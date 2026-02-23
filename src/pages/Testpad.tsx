import { useState } from "react";
import {
  Play,
  Sparkles,
  CheckCircle2,
  XCircle,
  Circle,
  Clock,
  ChevronDown,
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
  status?: "pass" | "fail" | "running";
}

interface Problem {
  title: string;
  difficulty: string;
  description: string;
  constraints: string[];
  examples: { input: string; output: string }[];
  code: string;
  testCases: TestCase[];
}

const problemBank: Record<string, Problem> = {
  default: {
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "-10⁹ ≤ target ≤ 10⁹", "Only one valid answer exists."],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`,
    testCases: [
      { id: 1, input: "[2,7,11,15], 9", expected: "[0, 1]" },
      { id: 2, input: "[3,2,4], 6", expected: "[1, 2]" },
      { id: 3, input: "[3,3], 6", expected: "[0, 1]" },
    ],
  },
  "binary tree": {
    title: "Invert Binary Tree",
    difficulty: "Easy",
    description:
      "Given the root of a binary tree, invert the tree (mirror it), and return its root. Inverting means swapping left and right children recursively for every node.",
    constraints: ["0 ≤ Number of nodes ≤ 100", "-100 ≤ Node.val ≤ 100"],
    examples: [
      { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" },
      { input: "root = [2,1,3]", output: "[2,3,1]" },
    ],
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def invert_tree(root):
    if root is None:
        return None
    root.left, root.right = root.right, root.left
    invert_tree(root.left)
    invert_tree(root.right)
    return root
`,
    testCases: [
      { id: 1, input: "[4,2,7,1,3,6,9]", expected: "[4,7,2,9,6,3,1]" },
      { id: 2, input: "[2,1,3]", expected: "[2,3,1]" },
      { id: 3, input: "[]", expected: "[]" },
    ],
  },
  "linked list": {
    title: "Reverse Linked List",
    difficulty: "Easy",
    description:
      "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    constraints: ["0 ≤ Number of nodes ≤ 5000", "-5000 ≤ Node.val ≤ 5000"],
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
    ],
    code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev
`,
    testCases: [
      { id: 1, input: "[1,2,3,4,5]", expected: "[5,4,3,2,1]" },
      { id: 2, input: "[1,2]", expected: "[2,1]" },
      { id: 3, input: "[1]", expected: "[1]" },
    ],
  },
  "dynamic programming": {
    title: "Climbing Stairs",
    difficulty: "Easy",
    description:
      "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    constraints: ["1 ≤ n ≤ 45"],
    examples: [
      { input: "n = 2", output: "2" },
      { input: "n = 3", output: "3" },
    ],
    code: `def climb_stairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b
`,
    testCases: [
      { id: 1, input: "n = 2", expected: "2" },
      { id: 2, input: "n = 3", expected: "3" },
      { id: 3, input: "n = 5", expected: "8" },
    ],
  },
};

const difficultyColor: Record<string, string> = {
  Easy: "text-success",
  Medium: "text-warning",
  Hard: "text-destructive",
};

export default function Testpad() {
  const [topic, setTopic] = useState("");
  const [problem, setProblem] = useState<Problem>(problemBank.default);
  const [code, setCode] = useState(problemBank.default.code);
  const [testCases, setTestCases] = useState<TestCase[]>(problemBank.default.testCases);
  const [running, setRunning] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Enter a topic first", variant: "destructive" });
      return;
    }
    setGenerating(true);
    // Match topic to problem bank
    setTimeout(() => {
      const key = Object.keys(problemBank).find((k) =>
        topic.toLowerCase().includes(k)
      );
      const selected = problemBank[key || "default"];
      setProblem(selected);
      setCode(selected.code);
      setTestCases(selected.testCases.map((tc) => ({ ...tc, status: undefined, actual: undefined })));
      setGenerating(false);
      toast({ title: `Problem generated: ${selected.title}` });
    }, 1200);
  };

  const runTests = () => {
    setRunning(true);
    setTestCases((prev) =>
      prev.map((tc) => ({ ...tc, status: "running", actual: undefined }))
    );

    testCases.forEach((_, i) => {
      setTimeout(() => {
        setTestCases((prev) =>
          prev.map((tc, j) =>
            j === i
              ? {
                  ...tc,
                  status: Math.random() > 0.15 ? "pass" : "fail",
                  actual: tc.expected,
                }
              : tc
          )
        );
        if (i === testCases.length - 1) {
          setRunning(false);
          toast({ title: "Test execution complete" });
        }
      }, 800 * (i + 1));
    });
  };

  return (
    <PageWrapper title="Testpad" subtitle="Practice coding problems with AI-generated challenges">
      {/* Topic input */}
      <GlassCard className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Enter a topic (e.g., 'binary tree', 'linked list', 'dynamic programming')"
            className="flex-1 rounded-lg border border-border bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50"
          >
            {generating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>
      </GlassCard>

      {/* Split pane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left - Problem */}
        <GlassCard className="overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-semibold text-foreground">{problem.title}</h2>
            <span className={`text-xs font-medium ${difficultyColor[problem.difficulty] || ""}`}>
              {problem.difficulty}
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {problem.description}
          </p>

          <div className="mb-4">
            <h3 className="text-xs font-medium text-foreground mb-2">Constraints</h3>
            <ul className="space-y-1">
              {problem.constraints.map((c, i) => (
                <li key={i} className="text-xs text-muted-foreground font-mono">• {c}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-medium text-foreground">Examples</h3>
            {problem.examples.map((ex, i) => (
              <div key={i} className="rounded-md bg-muted p-2.5">
                <p className="text-xs font-mono text-muted-foreground">
                  <span className="text-foreground">Input:</span> {ex.input}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  <span className="text-foreground">Output:</span> {ex.output}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Right - Editor */}
        <div className="flex flex-col gap-3">
          <GlassCard className="flex-1 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Python</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>
              <button
                onClick={runTests}
                disabled={running}
                className="flex items-center gap-1.5 rounded-md bg-success/90 px-3 py-1 text-xs font-medium text-success-foreground hover:bg-success transition-colors disabled:opacity-50"
              >
                <Play className="h-3 w-3" />
                {running ? "Running..." : "Run"}
              </button>
            </div>
            <Editor
              height="350px"
              defaultLanguage="python"
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                padding: { top: 12 },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                renderLineHighlight: "gutter",
              }}
            />
          </GlassCard>

          {/* Test results */}
          <GlassCard>
            <h3 className="text-xs font-medium text-foreground mb-2.5">Test Cases</h3>
            <div className="space-y-1.5">
              {testCases.map((tc) => (
                <div
                  key={tc.id}
                  className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {tc.status === "pass" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    ) : tc.status === "fail" ? (
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                    ) : tc.status === "running" ? (
                      <Clock className="h-3.5 w-3.5 text-warning animate-pulse" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="text-xs font-mono text-muted-foreground">
                      Case {tc.id}: {tc.input}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">→ {tc.expected}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}
