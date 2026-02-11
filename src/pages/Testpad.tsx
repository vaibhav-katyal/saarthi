import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import { Play, RotateCcw, Sparkles, CheckCircle2, XCircle, Loader2, Code2 } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface TestCase {
  input: string;
  expectedOutput: string;
  passed: boolean | null;
}

interface Problem {
  title: string;
  description: string;
  constraints: string[];
  sampleInput: string;
  sampleOutput: string;
  prewrittenCode: string;
  testCases: TestCase[];
}

const sampleProblems: Problem[] = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to the target. You may assume that each input would have exactly one solution.",
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "Only one valid answer exists"],
    sampleInput: "nums = [2, 7, 11, 15], target = 9",
    sampleOutput: "[0, 1]",
    prewrittenCode: `function twoSum(nums, target) {\n  // Write your solution here\n  \n}`,
    testCases: [
      { input: "twoSum([2,7,11,15], 9)", expectedOutput: "[0,1]", passed: null },
      { input: "twoSum([3,2,4], 6)", expectedOutput: "[1,2]", passed: null },
      { input: "twoSum([3,3], 6)", expectedOutput: "[0,1]", passed: null },
    ],
  },
  {
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters. You must do this by modifying the input array in-place.",
    constraints: ["1 ≤ s.length ≤ 10⁵", "s[i] is a printable ASCII character"],
    sampleInput: 's = ["h","e","l","l","o"]',
    sampleOutput: '["o","l","l","e","h"]',
    prewrittenCode: `function reverseString(s) {\n  // Write your solution here\n  \n}`,
    testCases: [
      { input: 'reverseString(["h","e","l","l","o"])', expectedOutput: '["o","l","l","e","h"]', passed: null },
      { input: 'reverseString(["H","a","n","n","a","h"])', expectedOutput: '["h","a","n","n","a","H"]', passed: null },
    ],
  },
  {
    title: "Palindrome Check",
    description: "Given a string s, return true if it is a palindrome (reads the same forward and backward), considering only alphanumeric characters and ignoring cases.",
    constraints: ["1 ≤ s.length ≤ 2 × 10⁵", "s consists only of printable ASCII characters"],
    sampleInput: 's = "A man, a plan, a canal: Panama"',
    sampleOutput: "true",
    prewrittenCode: `function isPalindrome(s) {\n  // Write your solution here\n  \n}`,
    testCases: [
      { input: 'isPalindrome("A man, a plan, a canal: Panama")', expectedOutput: "true", passed: null },
      { input: 'isPalindrome("race a car")', expectedOutput: "false", passed: null },
      { input: 'isPalindrome(" ")', expectedOutput: "true", passed: null },
    ],
  },
];

const Testpad = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [running, setRunning] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateProblem = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    const random = sampleProblems[Math.floor(Math.random() * sampleProblems.length)];
    setProblem(random);
    setCode(random.prewrittenCode);
    setTestResults(random.testCases.map((tc) => ({ ...tc, passed: null })));
    setGenerating(false);
  };

  const runCode = async () => {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 1500));
    const results = testResults.map((tc) => ({ ...tc, passed: Math.random() > 0.3 }));
    setTestResults(results);
    setRunning(false);
  };

  const resetCode = () => {
    if (problem) {
      setCode(problem.prewrittenCode);
      setTestResults(problem.testCases.map((tc) => ({ ...tc, passed: null })));
    }
  };

  const passedCount = testResults.filter((t) => t.passed === true).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Testpad</h1>
            <p className="text-muted-foreground text-sm mt-1">Practice coding in a real exam-like environment.</p>
          </div>
          <button
            onClick={generateProblem} disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0 self-start sm:self-auto"
          >
            <Sparkles className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            {generating ? "Generating..." : "Generate Problem"}
          </button>
        </div>
      </motion.div>

      {problem ? (
        <div className="h-[calc(100vh-11rem)]">
          <ResizablePanelGroup direction="horizontal" className="rounded-2xl overflow-hidden border border-border/50">
            {/* Problem Panel */}
            <ResizablePanel defaultSize={45} minSize={30}>
              <div className="h-full overflow-y-auto glass p-6 space-y-6 border-0 rounded-none">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">Problem</span>
                  <h2 className="text-xl font-bold mt-3">{problem.title}</h2>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm leading-relaxed">{problem.description}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Constraints</h3>
                  <ul className="space-y-1.5">
                    {problem.constraints.map((c, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />{c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sample Input</h3>
                    <pre className="text-xs font-mono bg-foreground/5 rounded-xl p-4 border border-border/20">{problem.sampleInput}</pre>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sample Output</h3>
                    <pre className="text-xs font-mono bg-foreground/5 rounded-xl p-4 border border-border/20">{problem.sampleOutput}</pre>
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Code Panel */}
            <ResizablePanel defaultSize={55} minSize={35}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 glass-subtle border-0 rounded-none border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">JavaScript</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={resetCode} className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground" title="Reset code">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={runCode} disabled={running}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      {running ? "Running..." : "Run Code"}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <textarea
                    value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false}
                    className="w-full h-full bg-foreground/[0.03] p-5 font-mono text-xs leading-relaxed resize-none outline-none"
                  />
                </div>

                <div className="border-t border-border/30 glass-subtle p-4 rounded-none border-0 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Test Cases</span>
                    {testResults.some((t) => t.passed !== null) && (
                      <span className={`text-xs font-semibold ${passedCount === testResults.length ? "text-primary" : "text-muted-foreground"}`}>
                        {passedCount}/{testResults.length} passed
                      </span>
                    )}
                  </div>
                  {testResults.map((tc, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs font-mono p-3 rounded-xl bg-foreground/[0.03] border border-border/20">
                      {tc.passed === null ? (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20 shrink-0" />
                      ) : tc.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      <span className="truncate flex-1">{tc.input}</span>
                      <span className="text-muted-foreground shrink-0">→ {tc.expectedOutput}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : (
        <GlassCard variant="subtle" className="text-center py-24">
          <Code2 className="h-14 w-14 text-muted-foreground/15 mx-auto mb-5" />
          <p className="text-muted-foreground font-medium">No problem loaded yet</p>
          <p className="text-xs text-muted-foreground/60 mt-2 max-w-sm mx-auto">
            Click "Generate Problem" to get an AI-generated coding challenge with test cases.
          </p>
        </GlassCard>
      )}
    </div>
  );
};

export default Testpad;
