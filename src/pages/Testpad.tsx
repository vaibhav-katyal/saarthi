"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Sparkles,
  CheckCircle2,
  XCircle,
  Circle,
  Clock,
  ChevronDown,
  Settings,
  X,
  Code2,
  FileText,
  Terminal,
  AlertCircle,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { PageWrapper } from "@/components/PageWrapper";
import { GlassCard } from "@/components/GlassCard";
import { toast } from "@/hooks/use-toast";

interface TestCase {
  id: number;
  input: string;
  expected: string;
  actual?: string;
  output?: string;
  status?: "pass" | "fail" | "running" | "error";
}

interface Problem {
  title: string;
  difficulty: string;
  description: string;
  constraints: string[];
  examples: { input: string; output: string }[];
  code: string;
  testCases: TestCase[];
  functionName: string;
  language: string;
}

const difficultyColor: Record<string, string> = {
  Easy: "text-green-400",
  Medium: "text-yellow-400",
  Hard: "text-red-400",
};

const difficultyBg: Record<string, string> = {
  Easy: "bg-green-500/10 border border-green-500/20",
  Medium: "bg-yellow-500/10 border border-yellow-500/20",
  Hard: "bg-red-500/10 border border-red-500/20",
};

export default function Testpad() {
  const [apiKey, setApiKey] = useState("");
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [topic, setTopic] = useState("");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"tests" | "custom">("tests");
  const [showFullCode, setShowFullCode] = useState(false);
  const [boilerplate, setBoilerplate] = useState("");

  // Load API key from localStorage on mount
  useEffect(() => {
    loadApiKey();
  }, []);

  const callGroqAPI = async (prompt: string) => {
    if (!apiKey.trim()) {
      toast({ title: "Please enter Groq API key first", variant: "destructive" });
      setShowApiSettings(true);
      return null;
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a coding problem generator. Generate coding problems in valid JSON format. Always respond with valid JSON only, no other text.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "API Error",
          description: error.error?.message || "Failed to call Groq API",
          variant: "destructive",
        });
        return null;
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect to Groq API",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Enter a problem topic or description", variant: "destructive" });
      return;
    }

    setGenerating(true);
    const prompt = `Generate a Java coding problem for: "${topic}"
    
Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "title": "Problem Title",
  "difficulty": "Easy/Medium/Hard",
  "description": "Detailed problem description",
  "constraints": ["constraint1", "constraint2"],
  "examples": [
    {"input": "example input", "output": "example output"},
    {"input": "example input 2", "output": "example output 2"}
  ],
  "testCases": [
    {"input": "test input 1", "expected": "expected output 1"},
    {"input": "test input 2", "expected": "expected output 2"},
    {"input": "test input 3", "expected": "expected output 3"}
  ],
  "functionName": "solution",
  "language": "java",
  "prewrittenCode": "public static String solution(String input) {\\n    // Parse input and implement solution\\n    // Return result as String\\n    return \\\"\\\";\\n}"
}`;

    const response = await callGroqAPI(prompt);

    if (!response) {
      setGenerating(false);
      return;
    }

    try {
      // Extract JSON from response (in case of extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      const problemData = JSON.parse(jsonMatch[0]);

      const newProblem: Problem = {
        title: problemData.title,
        difficulty: problemData.difficulty,
        description: problemData.description,
        constraints: problemData.constraints,
        examples: problemData.examples,
        functionName: problemData.functionName,
        language: problemData.language || "java",
        code: problemData.prewrittenCode,
        testCases: problemData.testCases.map((tc: any, i: number) => ({
          id: i + 1,
          input: tc.input,
          expected: tc.expected,
        })),
      };

      // Create boilerplate with main function
      const boilerplateCode = `public class Main {
    // USER_CODE_HERE

    public static void main(String[] args) {
        // Function call with test input
        String input = args.length > 0 ? args[0] : "";
        System.out.println(solution(input));
    }
}`;

      // Extract just the function body (remove class wrappers if present)
      let justFunction = problemData.prewrittenCode.trim();
      
      // Remove outer class wrapper if it exists
      if (justFunction.includes('public class')) {
        const match = justFunction.match(/public\s+static\s+\w+\s+\w+\s*\([^)]*\)\s*\{[\s\S]*\}/);
        if (match) {
          justFunction = match[0];
        }
      }

      setProblem(newProblem);
      setCode(justFunction);
      setBoilerplate(boilerplateCode);
      setTestCases(newProblem.testCases);
      setCustomInput("");
      setShowFullCode(false);
      setCustomOutput("");
      setActiveTab("tests");
      toast({ title: `Problem generated: ${newProblem.title}` });
    } catch (error) {
      toast({
        title: "Error parsing response",
        description: error instanceof Error ? error.message : "Invalid JSON from API",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const constructFullCode = (userCode: string, boilerplateCode: string): string => {
    // Combine user code with boilerplate
    return boilerplateCode.replace("    // USER_CODE_HERE", userCode);
  };

  const executeCode = async (
    code: string,
    input: string,
    functionName: string = "solution",
    boilerplateCode?: string
  ): Promise<{ output: string; error?: string }> => {
    try {
      // Combine user code with boilerplate
      const fullCode = boilerplateCode 
        ? boilerplateCode.replace("    // USER_CODE_HERE", code)
        : code;

      // Use Judge0 API for code execution
      // Alternative: set up local backend for Java runner

      const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
      const LANGUAGE_ID = 62; // Java

      const response = await fetch(
        `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
        {
          method: "POST",
          headers: {
            "X-RapidAPI-Key": import.meta.env.VITE_JUDGE0_API_KEY || "",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language_id: LANGUAGE_ID,
            source_code: fullCode,
            stdin: input || "",
          }),
        }
      );

      if (!response.ok) {
        return {
          output: "",
          error: "Failed to connect to code execution service",
        };
      }

      const result = await response.json();

      if (result.status?.id > 3) {
        return {
          output: "",
          error: result.stderr || result.compile_output || "Execution error",
        };
      }

      return {
        output: result.stdout?.trim() || "",
      };
    } catch (error) {
      return {
        output: "",
        error:
          error instanceof Error
            ? error.message
            : "Failed to execute code. Please check API keys in settings.",
      };
    }
  };

  const runTests = async () => {
    if (!problem) {
      toast({ title: "Generate a problem first", variant: "destructive" });
      return;
    }

    if (!code.trim()) {
      toast({ title: "Write some code first", variant: "destructive" });
      return;
    }

    setRunning(true);
    setTestCases((prev) =>
      prev.map((tc) => ({ ...tc, status: "running", actual: undefined }))
    );

    try {
      const results: TestCase[] = [];

      for (const testCase of testCases) {
        const execution = await executeCode(code, testCase.input, problem.functionName, boilerplate);

        const passed =
          !execution.error && execution.output === testCase.expected.trim();

        results.push({
          ...testCase,
          status: passed ? "pass" : "fail",
          actual: execution.output,
          output: execution.output,
        });

        // Add small delay between tests for UX
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setTestCases(results);

      const passCount = results.filter((r) => r.status === "pass").length;
      const failCount = results.filter((r) => r.status === "fail").length;

      toast({
        title: `Tests Complete: ${passCount} passed, ${failCount} failed`,
        description:
          failCount === 0
            ? "🎉 Excellent! All tests passed!"
            : `${failCount} test case(s) need fixing`,
      });
    } catch (error) {
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "Failed to run tests",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  const runCustom = async () => {
    if (!problem) {
      toast({ title: "Generate a problem first", variant: "destructive" });
      return;
    }

    if (!code.trim()) {
      toast({ title: "Write some code first", variant: "destructive" });
      return;
    }

    if (!customInput.trim()) {
      toast({ title: "Enter custom input", variant: "destructive" });
      return;
    }

    setRunning(true);

    try {
      const execution = await executeCode(code, customInput, problem.functionName, boilerplate);

      if (execution.error) {
        setCustomOutput(`Error: ${execution.error}`);
        toast({
          title: "Execution Error",
          description: execution.error,
          variant: "destructive",
        });
      } else {
        setCustomOutput(execution.output);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to execute",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({ title: "Please enter a valid API key", variant: "destructive" });
      return;
    }
    localStorage.setItem("groq_api_key", apiKey);
    toast({ title: "API key saved successfully" });
    setShowApiSettings(false);
  };

  const loadApiKey = () => {
    const saved = localStorage.getItem("groq_api_key");
    if (saved) {
      setApiKey(saved);
    }
  };

  if (!problem) {
    return (
      <PageWrapper
        title="Testpad"
        subtitle="Generate and solve coding problems powered by AI"
      >
        {/* API Settings Modal */}
        {showApiSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Groq API Configuration
                </h2>
                <button
                  onClick={() => setShowApiSettings(false)}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Groq API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-primary/40 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your free API key from{" "}
                    <a
                      href="https://console.groq.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      console.groq.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowApiSettings(false)}
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveApiKey}
                  className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Welcome Screen */}
        <div className="max-w-2xl mx-auto">
          <GlassCard className="mb-6 text-center py-8">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Code2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              AI-Powered Coding Practice
            </h1>
            <p className="text-muted-foreground">
              Generate unlimited coding problems and practice with an interactive editor
            </p>
          </GlassCard>

          {/* Problem Generation */}
          <GlassCard className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Generate a Problem
            </h2>

            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="e.g., 'Find the longest palindromic substring', 'Binary tree zigzag traversal', 'Maximum subarray sum'"
                className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Problem
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowApiSettings(true)}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  API Settings
                </button>
              </div>
            </div>

            {apiKey && (
              <p className="text-xs text-success">✓ API key configured</p>
            )}
            {!apiKey && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Configure API key to get started
              </p>
            )}
          </GlassCard>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <GlassCard className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    Problem Generation
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    AI generates unique problems with descriptions and examples
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-start gap-3">
                <Code2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    Code Editor
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Modern editor with syntax highlighting and function templates
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-start gap-3">
                <Terminal className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    Test Execution
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Run test cases and custom inputs with instant feedback
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Testpad" subtitle={`Solving: ${problem.title}`}>
      {/* API Settings Modal */}
      {showApiSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Groq API Configuration
              </h2>
              <button
                onClick={() => setShowApiSettings(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Groq API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-primary/40 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowApiSettings(false)}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveApiKey}
                className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Header */}
      <GlassCard className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              {problem.title}
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  difficultyBg[problem.difficulty] || ""
                } ${difficultyColor[problem.difficulty] || ""}`}
              >
                {problem.difficulty}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Language: <span className="font-mono">{problem.language}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setProblem(null);
              setCode("");
              setTestCases([]);
              setTopic("");
            }}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            New Problem
          </button>
        </div>
      </GlassCard>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left - Problem Description */}
        <GlassCard className="lg:col-span-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          <h3 className="text-sm font-semibold text-foreground mb-3">Description</h3>

          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {problem.description}
          </p>

          {problem.constraints.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-foreground mb-2">Constraints</h4>
              <ul className="space-y-1">
                {problem.constraints.map((c, i) => (
                  <li key={i} className="text-xs text-muted-foreground font-mono">
                    • {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {problem.examples.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2">Examples</h4>
              <div className="space-y-2">
                {problem.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-md bg-muted/50 border border-border/50 p-2.5"
                  >
                    <p className="text-xs font-mono text-muted-foreground mb-1">
                      <span className="text-foreground">Input:</span>
                    </p>
                    <p className="text-xs font-mono text-foreground ml-2 mb-2">
                      {ex.input}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mb-1">
                      <span className="text-foreground">Output:</span>
                    </p>
                    <p className="text-xs font-mono text-foreground ml-2">
                      {ex.output}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Right - Editor and Tests */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Code Editor */}
          <GlassCard className="flex-1 p-0 overflow-hidden flex flex-col max-h-[calc(100vh-400px)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  {problem.language.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFullCode(!showFullCode)}
                  className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  {showFullCode ? "Hide" : "View"} Code
                </button>
                <button
                  onClick={runTests}
                  disabled={running}
                  className="flex items-center gap-1.5 rounded-md bg-primary/90 px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary transition-colors disabled:opacity-50"
              >
                {running ? (
                  <>
                    <Clock className="h-3 w-3 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    Run Tests
                  </>
                )}
              </button>
              </div>
            </div>
            {!showFullCode && (
              <div className="px-4 py-2 bg-muted/50 text-xs text-muted-foreground border-b border-border/50">
                ✎ Write your solution function. Click "View Code" to see the complete program structure with main function.
              </div>
            )}
            {showFullCode && (
              <div className="px-4 py-2 bg-blue-500/10 text-xs text-blue-400 border-b border-blue-500/20">
                📖 Viewing complete program structure (read-only). Click "Hide Code" to edit your solution.
              </div>
            )}
            <Editor
              height="100%"
              defaultLanguage={problem.language}
              value={showFullCode ? boilerplate.replace("    // USER_CODE_HERE", code) : code}
              onChange={(v) => {
                if (!showFullCode) {
                  setCode(v || "");
                }
              }}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                padding: { top: 12 },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                renderLineHighlight: "gutter",
                automaticLayout: true,
                readOnly: showFullCode,
              }}
            />
          </GlassCard>

          {/* Test Results & Custom Input */}
          <GlassCard className="max-h-64 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 border-b border-border/50 mb-3">
              <button
                onClick={() => setActiveTab("tests")}
                className={`px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${
                  activeTab === "tests"
                    ? "text-foreground bg-muted/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Test Cases ({testCases.filter((t) => t.status === "pass").length}/
                {testCases.length})
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${
                  activeTab === "custom"
                    ? "text-foreground bg-muted/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Custom Input
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === "tests" ? (
                <div className="space-y-1.5 px-3 py-2">
                  {testCases.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No test cases yet
                    </p>
                  ) : (
                    testCases.map((tc) => (
                      <div
                        key={tc.id}
                        className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-2 border border-border/50 hover:border-border/80 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {tc.status === "pass" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                          ) : tc.status === "fail" ? (
                            <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                          ) : tc.status === "running" ? (
                            <Clock className="h-4 w-4 text-yellow-400 animate-spin flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-mono text-muted-foreground truncate">
                              Input: {tc.input}
                            </p>
                            {tc.actual && (
                              <p className="text-xs font-mono text-muted-foreground truncate">
                                Expected: {tc.expected}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input"
                    className="w-full rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs outline-none focus:border-primary/40 transition-colors"
                  />
                  <button
                    onClick={runCustom}
                    disabled={running}
                    className="w-full flex items-center justify-center gap-1.5 rounded-md bg-primary/90 px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary transition-colors disabled:opacity-50"
                  >
                    <Play className="h-3 w-3" />
                    Run
                  </button>
                  {customOutput && (
                    <div className="rounded-md bg-muted/50 p-2 mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Output:</p>
                      <p className="text-xs font-mono text-foreground">{customOutput}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}
