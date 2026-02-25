// Code execution service using Judge0 API
// Free tier: https://judge0.com/

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";

interface ExecutionResult {
  output: string;
  error?: string;
  exitCode?: number;
  status: "success" | "error" | "timeout";
}

interface LanguageConfig {
  [key: string]: number;
}

const LANGUAGE_IDS: LanguageConfig = {
  python: 71,
  javascript: 63,
  javascript3: 63,
  java: 62,
  cpp: 53,
  c: 50,
  typescript: 74,
};

export async function executeCode(
  code: string,
  input: string,
  language: string = "python"
): Promise<ExecutionResult> {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];

  if (!languageId) {
    return {
      status: "error",
      output: "",
      error: `Language ${language} not supported`,
    };
  }

  try {
    // Step 1: Submit code for execution
    const submitResponse = await fetch(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers: {
          "X-RapidAPI-Key": import.meta.env.VITE_JUDGE0_API_KEY || "",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language_id: languageId,
          source_code: code,
          stdin: input || "",
        }),
      }
    );

    if (!submitResponse.ok) {
      return {
        status: "error",
        output: "",
        error: "Failed to submit code for execution",
      };
    }

    const result = await submitResponse.json();

    if (result.status?.id > 3) {
      // Status > 3 indicates compilation or runtime error
      return {
        status: "error",
        output: result.stderr || result.compile_output || "Execution failed",
        error: result.stderr || result.compile_output,
        exitCode: result.exit_code,
      };
    }

    return {
      status: "success",
      output: result.stdout || "",
      exitCode: result.exit_code,
    };
  } catch (error) {
    return {
      status: "error",
      output: "",
      error: error instanceof Error ? error.message : "Failed to execute code",
    };
  }
}

export async function testCode(
  code: string,
  testCases: Array<{ input: string; expected: string }>,
  language: string = "python"
): Promise<{
  passed: number;
  failed: number;
  results: Array<{
    input: string;
    expected: string;
    output: string;
    passed: boolean;
    error?: string;
  }>;
}> {
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = await executeCode(code, testCase.input, language);

    if (result.status === "error") {
      failed++;
      results.push({
        input: testCase.input,
        expected: testCase.expected,
        output: "",
        passed: false,
        error: result.error,
      });
    } else {
      const output = result.output.trim();
      const expected = testCase.expected.trim();
      const testPassed = output === expected;

      if (testPassed) {
        passed++;
      } else {
        failed++;
      }

      results.push({
        input: testCase.input,
        expected: testCase.expected,
        output: output,
        passed: testPassed,
      });
    }
  }

  return { passed, failed, results };
}
