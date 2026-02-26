// Code execution service using Judge0 API
// Free tier: https://judge0.com/
// Template-based Java execution engine

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
const USER_CODE_START_MARKER = "// USER_CODE_START";
const USER_CODE_END_MARKER = "// USER_CODE_END";

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

/**
 * Extracts the user-editable section from a template
 * Returns text between USER_CODE_START and USER_CODE_END markers
 */
export function extractUserCode(template: string): string {
  const startIndex = template.indexOf(USER_CODE_START_MARKER);
  const endIndex = template.indexOf(USER_CODE_END_MARKER);

  if (startIndex === -1 || endIndex === -1) {
    console.warn("Template markers not found. Returning empty string.");
    return "";
  }

  // Get code between markers (excluding the marker lines themselves)
  const codeStart = startIndex + USER_CODE_START_MARKER.length;
  const code = template.substring(codeStart, endIndex).trim();

  return code;
}

/**
 * Builds the final executable code by replacing user code in template
 * Keeps markers intact, replaces everything between them
 */
export function buildFinalCode(template: string, userCode: string): string {
  const startPattern = new RegExp(
    `(${USER_CODE_START_MARKER})([\\s\\S]*?)(${USER_CODE_END_MARKER})`
  );

  if (!startPattern.test(template)) {
    console.error("Template markers not found. Returning template as-is.");
    return template;
  }

  return template.replace(
    startPattern,
    `$1\n${userCode}\n$3`
  );
}

/**
 * Normalizes output for comparison
 * Trim, remove carriage returns, collapse whitespace
 */
export function normalizeOutput(str: string): string {
  return str
    .trim()
    .replace(/\r/g, "")
    .replace(/\r\n/g, "\n");
}

export async function executeCode(
  code: string,
  input: string,
  language: string = "python",
  template?: string
): Promise<ExecutionResult> {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];

  if (!languageId) {
    return {
      status: "error",
      output: "",
      error: `Language ${language} not supported`,
    };
  }

  // If template provided, build final code using template system
  const finalCode = template ? buildFinalCode(template, code) : code;

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
          source_code: finalCode,
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
      output: normalizeOutput(result.stdout || ""),
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
  language: string = "python",
  template?: string
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
    const result = await executeCode(code, testCase.input, language, template);

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
      const output = normalizeOutput(result.output);
      const expected = normalizeOutput(testCase.expected);
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
