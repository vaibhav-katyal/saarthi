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
  FileText,
  Terminal,
  AlertCircle,
  History,
  Code2,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { PageWrapper } from "@/components/PageWrapper";
import { GlassCard } from "@/components/GlassCard";
import { toast } from "@/hooks/use-toast";
import { logTestpadActivity } from "@/lib/activityLogger";
import {
  extractUserCode,
  buildFinalCode,
  normalizeOutput,
} from "@/lib/codeExecution";

interface TestCase {
  id: number;
  input: string;
  expected: string;
  actual?: string;
  output?: string;
  status?: "pass" | "fail" | "running" | "error";
  isHidden?: boolean;
}

interface Problem {
  title: string;
  difficulty: string;
  description: string;
  constraints: string[];
  examples: { input: string; output: string }[];
  testCases: TestCase[];
  fullTemplate: string;
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
  const showFullCodeRef = useRef(false);
  const [attempts, setAttempts] = useState(0);

  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleToggleFullCode = () => {
    setShowFullCode((prev) => {
      const newValue = !prev;
      showFullCodeRef.current = newValue;
      return newValue;
    });
  };

  // Resizable panels state
  const [leftWidth, setLeftWidth] = useState(30);
  const [rightWidth, setRightWidth] = useState(25);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    loadApiKey();
  }, []);

  // Handle left divider resize
  useEffect(() => {
    if (!isDraggingLeft) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 15 && newWidth < 50) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingLeft]);

  // Handle right divider resize
  useEffect(() => {
    if (!isDraggingRight) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      if (newWidth > 15 && newWidth < 50) {
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingRight(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingRight]);

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

CRITICAL REQUIREMENTS - MUST FOLLOW EXACTLY:
1. Class name MUST be Main
2. The user-editable method must be an instance method inside Main.
3. Never use static methods for the user-editable method
4. Never use solution(String input) pattern
5. Method body MUST be completely empty with just closing brace
6. Main method must instantiate Main class and call the method (e.g. Main obj = new Main(); obj.methodName(...);)
7. Pass individual parameters, NOT String input
8. Print result using System.out.println()
9. For arrays, test case inputs MUST be space-separated values (e.g., "1 2 3"), NEVER use formatting like "[1, 2, 3]" or commas, so Scanner can read them easily.
10. Generate EXACTLY 5 to 6 Test Cases. They MUST be generated using the "Equivalence Partitioning" method. Ensure cases cover average expected outcomes, boundary cases, edge constraints, negatives, or zeroes where applicable.
11. Mark 3 testcases as hidden by setting '"isHidden": true', and leave the rest with '"isHidden": false'.

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "title": "Problem Title",
  "difficulty": "Easy/Medium/Hard",
  "description": "Detailed problem description",
  "constraints": ["constraint1", "constraint2"],
  "examples": [
    {"input": "1 2", "output": "3"},
    {"input": "5 7", "output": "12"}
  ],
  "testCases": [
    {"input": "1 2", "expected": "3", "isHidden": false},
    {"input": "5 7", "expected": "12", "isHidden": false},
    {"input": "-1 1", "expected": "0", "isHidden": true},
    {"input": "0 0", "expected": "0", "isHidden": true},
    {"input": "100 -50", "expected": "50", "isHidden": true}
  ],
  "language": "java",
  "fullTemplate": "import java.util.*;\\n\\npublic class Main {\\n    // USER_CODE_START\\n    public long sumTwoNumbers(int a, int b) {\\n    }\\n    // USER_CODE_END\\n\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        if (sc.hasNextInt()) {\\n            int a = sc.nextInt();\\n            int b = sc.nextInt();\\n            Main obj = new Main();\\n            long result = obj.sumTwoNumbers(a, b);\\n            System.out.println(result);\\n        }\\n    }\\n}"
}

SKELETON TEMPLATE STRUCTURE:
import java.util.*;

public class Main {
    // USER_CODE_START
    public RETURN_TYPE methodName(PARAM_TYPES params) {
    }
    // USER_CODE_END

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            // Read inputs matching EXACTLY the format in testCases.input
            Main obj = new Main();
            RETURN_TYPE result = obj.methodName(params);
            System.out.println(result);
        }
    }
}

ENFORCED RULES:
- Method between markers must have EMPTY BODY (no implementation, no return statement)
- Main method reads input using Scanner
- Main creates Main instance and calls the empty method
- Result is printed with System.out.println()
- Template must be fully compilable (even with empty method)
- NEVER generate solution(String input)
- NEVER use static for user method
- Wrap method EXACTLY between // USER_CODE_START and // USER_CODE_END markers
- Parse input safely (e.g., check sc.hasNext() to prevent NoSuchElementException)
- Properly escape template string for JSON`;

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
        language: problemData.language || "java",
        fullTemplate: problemData.fullTemplate,
        testCases: problemData.testCases.map((tc: any, i: number) => ({
          id: i + 1,
          input: tc.input,
          expected: tc.expected,
          isHidden: tc.isHidden || false,
        })),
      };

      setProblem(newProblem);
      // Extract the user-editable code from the template
      const userCode = extractUserCode(newProblem.fullTemplate);
      setCode(userCode);
      setTestCases(newProblem.testCases);
      setCustomInput("");
      setShowFullCode(false);
      showFullCodeRef.current = false;
      setCustomOutput("");
      setActiveTab("tests");
      setAttempts(0);
      toast({ title: `Problem generated: ${newProblem.title}` });
      
      // Log the problem generation activity
      logTestpadActivity.generate(topic);
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

  const executeCode = async (
    code: string,
    input: string
  ): Promise<{ output: string; error?: string }> => {
    if (!problem) {
      return {
        output: "",
        error: "No problem loaded",
      };
    }

    try {
      // Build final code using template system
      const finalCode = buildFinalCode(problem.fullTemplate, code);

      // Use Judge0 API for code execution
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
            source_code: finalCode,
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
        output: normalizeOutput(result.stdout || ""),
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
        const execution = await executeCode(code, testCase.input);

        const passed =
          !execution.error &&
          normalizeOutput(execution.output) === normalizeOutput(testCase.expected);

        results.push({
          ...testCase,
          status: passed ? "pass" : "fail",
          actual: execution.output,
          output: execution.error ? execution.error : execution.output,
        });

        // Add small delay between tests for UX
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setTestCases(results);

      const passCount = results.filter((r) => r.status === "pass").length;
      const failCount = results.filter((r) => r.status === "fail").length;

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // Save to MongoDB
      try {
        const token = localStorage.getItem("token");
        if (token) {
          fetch("http://localhost:5000/api/testpad", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              problemTitle: problem.title,
              passedCases: passCount,
              totalCases: results.length,
              attempts: newAttempts,
            }),
          }).catch(err => console.error("Failed to save testpad results:", err));
        }
      } catch (err) {
        console.error("Failed to save testpad results:", err);
      }

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
      const execution = await executeCode(code, customInput);

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

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch("http://localhost:5000/api/testpad", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setHistoryData(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      toast({ title: "Failed to load history", variant: "destructive" });
    } finally {
      setLoadingHistory(false);
    }
  };

  const openHistory = () => {
    setShowHistory(true);
    fetchHistory();
  };

  if (!problem) {
    return (
      <PageWrapper
        title="Testpad"
        subtitle="Generate and solve coding problems powered by AI"
        icon={<Code2 className="h-3 w-3" />}
        badge="Practice"
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

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowHistory(false)}>
            <GlassCard className="w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Attempt History
                </h2>
                <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-muted rounded-md transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                {loadingHistory ? (
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : historyData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">No attempts yet. Start solving problems!</p>
                ) : (
                  historyData.map((record) => (
                    <div key={record._id} className="bg-muted/30 border border-border/50 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-1">{record.problemTitle}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className={`h-3 w-3 ${record.passedCases === record.totalCases ? 'text-green-500' : 'text-muted-foreground'}`} />
                            {record.passedCases} / {record.totalCases} Passed
                          </span>
                          <span>•</span>
                          <span>{record.attempts} Attempts</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(record.lastAttemptedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Welcome Screen */}
        <div className="max-w-2xl mx-auto space-y-4">
          <GlassCard className="text-center py-5">
            <div className="mb-3 flex justify-center">
              <div className="rounded-full bg-primary/10 p-2.5">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-1">
              AI-Powered Coding Practice
            </h1>
            <p className="text-muted-foreground text-sm">
              Generate unlimited coding problems and practice with an interactive editor
            </p>
          </GlassCard>

          {/* Problem Generation */}
          <GlassCard>
            <h2 className="text-base font-semibold text-foreground mb-3">
              Generate a Problem
            </h2>

            <div className="flex flex-col gap-3 mb-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="e.g., 'Find the longest palindromic substring', 'Binary tree zigzag traversal'"
                className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
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
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  API Settings
                </button>
                <button
                  onClick={openHistory}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  title="View History"
                >
                  <History className="h-4 w-4" />
                  History
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
            <GlassCard className="p-3.5">
              <div className="flex items-start gap-2.5">
                <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground text-xs mb-1">
                    Problem Generation
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    AI generates unique problems with descriptions and examples
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-3.5">
              <div className="flex items-start gap-2.5">
                <Code2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground text-xs mb-1">
                    Code Editor
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Modern editor with syntax highlighting and function templates
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-3.5">
              <div className="flex items-start gap-2.5">
                <Terminal className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground text-xs mb-1">
                    Test Execution
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-tight">
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
    <div className="w-full h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 border-b border-border/50 px-6 py-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-foreground">{problem.title}</h1>
            <p className="text-xs text-muted-foreground">Competitive Programming</p>
          </div>
          <span
            className={`text-xs font-bold px-2 py-1 rounded ${difficultyBg[problem.difficulty] || ""} ${difficultyColor[problem.difficulty] || ""}`}
          >
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openHistory}
            title="Attempt History"
            className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowApiSettings(true)}
            title="API Settings"
            className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setProblem(null);
              setCode("");
              setTestCases([]);
              setTopic("");
            }}
            className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded text-xs font-medium transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            New Problem
          </button>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* History Modal (Inner View) */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowHistory(false)}>
            <div className="w-full max-w-2xl max-h-[80vh] bg-background border border-border rounded-lg shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Attempt History
                </h2>
                <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {loadingHistory ? (
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : historyData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">No attempts yet. Keep practicing!</p>
                ) : (
                  historyData.map((record) => (
                    <div key={record._id} className="bg-muted/30 border border-border/50 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground text-xs mb-1">{record.problemTitle}</h3>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className={`h-3 w-3 ${record.passedCases === record.totalCases && record.totalCases > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                            {record.passedCases} / {record.totalCases} Passed
                          </span>
                          <span>•</span>
                          <span>{record.attempts} Attempts</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(record.lastAttemptedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* API Settings Modal */}
        {showApiSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-background border border-border rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">
                  Groq API Configuration
                </h2>
                <button
                  onClick={() => setShowApiSettings(false)}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">
                    Groq API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full rounded border border-border bg-muted px-3 py-2 text-xs outline-none focus:border-primary/40 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2 p-4 border-t border-border">
                <button
                  onClick={() => setShowApiSettings(false)}
                  className="flex-1 rounded border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveApiKey}
                  className="flex-1 rounded bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LEFT PANEL - Problem Description */}
        <div
          className="bg-background border-r border-border/50 overflow-y-auto"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="p-5 space-y-5 text-sm">
            {/* Problem Title */}
            <div>
              <h3 className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">
                Problem
              </h3>
              <p className="text-xs text-foreground leading-relaxed">
                {problem.description}
              </p>
            </div>

            {/* Constraints */}
            {problem.constraints.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">
                  Constraints
                </h4>
                <ul className="space-y-1">
                  {problem.constraints.map((c, i) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground font-mono bg-muted/40 px-2 py-1 rounded"
                    >
                      • {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Input Format */}
            <div>
              <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">
                Input Format
              </h4>
              <p className="text-xs text-muted-foreground">
                Input is read from standard input (stdin). See examples below.
              </p>
            </div>

            {/* Output Format */}
            <div>
              <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-wideset">
                Output Format
              </h4>
              <p className="text-xs text-muted-foreground">
                Output should be printed to standard output (stdout).
              </p>
            </div>

            {/* Examples */}
            {problem.examples.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">
                  Examples
                </h4>
                <div className="space-y-2">
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="bg-muted/50 rounded border border-border/50 p-2.5">
                      <p className="text-xs font-mono text-primary mb-1">
                        Input:
                      </p>
                      <p className="text-xs font-mono text-foreground ml-2 mb-2 bg-black/20 p-1 rounded font-semibold">
                        {ex.input}
                      </p>
                      <p className="text-xs font-mono text-primary mb-1">
                        Output:
                      </p>
                      <p className="text-xs font-mono text-foreground ml-2 bg-black/20 p-1 rounded font-semibold">
                        {ex.output}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LEFT DIVIDER */}
        <div
          className="w-1 bg-border/50 hover:bg-primary/50 cursor-col-resize transition-colors"
          onMouseDown={() => setIsDraggingLeft(true)}
        />

        {/* MIDDLE PANEL - Code Editor */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
          {/* Editor Header */}
          <div className="bg-muted/40 border-b border-border/50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-mono font-bold text-foreground">
                {problem.language.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFullCode}
                title={showFullCode ? "Hide full code" : "View full code"}
                className="text-xs px-2.5 py-1.5 rounded border border-border/50 bg-muted hover:bg-muted/80 text-foreground transition-colors font-medium flex items-center gap-1.5"
              >
                <FileText className="h-3 w-3" />
                {showFullCode ? "Hide" : "View"} Full
              </button>
              <button
                onClick={runTests}
                disabled={running}
                className="text-xs px-2.5 py-1.5 rounded bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-medium flex items-center gap-1.5 disabled:opacity-50"
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

          {/* Info Message */}
          {!showFullCode && (
            <div className="px-4 py-2 bg-blue-500/10 text-xs text-blue-400 border-b border-border/50 flex items-center gap-2">
              <Circle className="h-1.5 w-1.5 fill-blue-400" />
              Edit only your solution. Click "View Full" to see the complete code structure.
            </div>
          )}
          {showFullCode && (
            <div className="px-4 py-2 bg-green-500/10 text-xs text-green-400 border-b border-border/50 flex items-center gap-2">
              <Circle className="h-1.5 w-1.5 fill-green-400" />
              Read-only view. Edit within USER_CODE markers only.
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage={problem.language}
              value={showFullCode ? buildFinalCode(problem.fullTemplate, code) : code}
              onChange={(v) => {
                if (!showFullCodeRef.current) {
                  setCode(v || "");
                }
              }}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 11,
                padding: { top: 12, bottom: 12 },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                renderLineHighlight: "gutter",
                automaticLayout: true,
                readOnly: showFullCode,
              }}
            />
          </div>
        </div>

        {/* RIGHT DIVIDER */}
        <div
          className="w-1 bg-border/50 hover:bg-primary/50 cursor-col-resize transition-colors"
          onMouseDown={() => setIsDraggingRight(true)}
        />

        {/* RIGHT PANEL - Test Console */}
        <div
          className="bg-background border-l border-border/50 flex flex-col overflow-hidden"
          style={{ width: `${rightWidth}%` }}
        >
          {/* Tabs */}
          <div className="flex items-center border-b border-border/50 bg-muted/30">
            <button
              onClick={() => setActiveTab("tests")}
              className={`flex-1 px-3 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === "tests"
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
            >
              Tests ({testCases.filter((t) => t.status === "pass").length}/{testCases.length})
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`flex-1 px-3 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === "custom"
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
            >
              <Terminal className="h-3 w-3 inline mr-1" />
              Console
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === "tests" ? (
              <div className="space-y-2">
                {testCases.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No test cases available
                  </p>
                ) : (
                  testCases.map((tc) => (
                    <div
                      key={tc.id}
                      className="bg-muted/50 border border-border/50 rounded p-2.5 hover:border-border/80 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {tc.status === "pass" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                        ) : tc.status === "fail" ? (
                          <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                        ) : tc.status === "running" ? (
                          <Clock className="h-3.5 w-3.5 text-yellow-400 animate-spin flex-shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="font-mono text-foreground font-semibold">
                          Test {tc.id}
                        </span>
                        {tc.status && (
                          <span
                            className={`ml-auto text-xs font-bold ${tc.status === "pass"
                              ? "text-green-400"
                              : tc.status === "fail"
                                ? "text-red-400"
                                : "text-muted-foreground"
                              }`}
                          >
                            {tc.status === "pass"
                              ? "PASS"
                              : tc.status === "fail"
                                ? "FAIL"
                                : tc.status === "running"
                                  ? "RUN"
                                  : ""}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-muted-foreground">
                        {tc.isHidden ? (
                          <div className="flex items-center gap-2 py-2">
                            <div className="h-4 w-32 bg-muted-foreground/20 animate-pulse rounded"></div>
                            <span className="text-xs text-muted-foreground italic">Hidden Test Case</span>
                          </div>
                        ) : (
                          <>
                            <p className="font-mono text-xs">
                              <span className="text-muted-foreground">Input:</span> {tc.input}
                            </p>
                            <p className="font-mono text-xs">
                              <span className="text-muted-foreground">Expected:</span> {tc.expected}
                            </p>
                            {tc.output && (
                              <p className="font-mono text-xs">
                                <span className="text-muted-foreground">Output:</span>{" "}
                                <span
                                  className={
                                    tc.status === "pass" ? "text-green-400" : "text-red-400"
                                  }
                                >
                                  {tc.output}
                                </span>
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Custom Input
                  </label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter test input..."
                    className="w-full h-20 rounded border border-border/50 bg-muted px-2 py-1.5 text-xs font-mono outline-none focus:border-primary/40 transition-colors resize-none"
                  />
                </div>
                <button
                  onClick={runCustom}
                  disabled={running}
                  className="w-full text-xs px-2.5 py-1.5 rounded bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Play className="h-3 w-3" />
                  {running ? "Running..." : "Run"}
                </button>
                {customOutput && (
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Output
                    </label>
                    <div className="rounded border border-border/50 bg-black/30 p-2 max-h-32 overflow-y-auto">
                      <p className="text-xs font-mono text-green-400 break-words">
                        {customOutput}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
