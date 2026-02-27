"use client";

import { useState, useEffect } from "react";
import {
    Brain,
    Play,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ArrowRight,
    RotateCcw,
} from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { GlassCard } from "@/components/GlassCard";
import { toast } from "@/hooks/use-toast";

interface MCQQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

interface MCQResult {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    results: {
    questionId: number;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    }[];
}

type PageState = "form" | "quiz" | "results";

export default function MCQ() {
    const [apiKey, setApiKey] = useState("");
    const [showApiSettings, setShowApiSettings] = useState(false);
    const [pageState, setPageState] = useState<PageState>("form");

  // Form state
    const [topic, setTopic] = useState("");
    const [subtopic, setSubtopic] = useState("");
    const [numQuestions, setNumQuestions] = useState(5);
    const [difficulty, setDifficulty] = useState("Medium");

  // Quiz state
    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [generating, setGenerating] = useState(false);

  // Results state
    const [results, setResults] = useState<MCQResult | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("groq_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const saveApiKey = () => {
    localStorage.setItem("groq_api_key", apiKey);
    setShowApiSettings(false);
    toast({ title: "API key saved successfully" });
  };

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
                "You are an expert educational content creator. Generate high-quality MCQ questions with clear explanations.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Groq API error:", error);
        toast({
          title: "Error",
          description: "Failed to generate MCQs. Check your API key.",
          variant: "destructive",
        });
        return null;
      }

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || null;
    } catch (err) {
      console.error("Error calling Groq API:", err);
      toast({
        title: "Error",
        description: "Failed to connect to AI service",
        variant: "destructive",
      });
      return null;
    }
  };

  const generateMCQs = async () => {
    if (!topic.trim()) {
      toast({ title: "Please enter a topic", variant: "destructive" });
      return;
    }

    setGenerating(true);

    const subtopicPart = subtopic.trim() ? ` and subtopic: ${subtopic}` : "";
    const prompt = `Generate exactly ${numQuestions} multiple choice questions about "${topic}"${subtopicPart} with difficulty level "${difficulty}".

Format your response as a valid JSON array with this exact structure (no markdown, just raw JSON):
[
  {
    "id": 1,
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Detailed explanation of why this is correct..."
  }
]

Make sure:
- Each question has exactly 4 options
- One option should be marked as correctAnswer (must be one of the options)
- Explanations are clear and educational
- Questions are appropriate for ${difficulty} level
- JSON is valid and parseable`;

    const response = await callGroqAPI(prompt);

    if (!response) {
      setGenerating(false);
      return;
    }

    try {
      // Extract JSON from response (handle cases where there might be markdown)
      let jsonStr = response;
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsedQuestions = JSON.parse(jsonStr) as MCQQuestion[];

      // Validate questions
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        throw new Error("Invalid questions format");
      }

      setQuestions(parsedQuestions);
      setUserAnswers({});
      setCurrentQuestion(0);
      setPageState("quiz");
      toast({ title: `Generated ${parsedQuestions.length} MCQ questions!` });
    } catch (err) {
      console.error("Error parsing MCQs:", err);
      toast({
        title: "Error",
        description: "Failed to parse generated MCQs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [questions[currentQuestion].id]: answer,
    });
  };

  const goToNextQuestion = () => {
    if (!userAnswers[questions[currentQuestion].id]) {
      toast({ title: "Please select an answer", variant: "destructive" });
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = () => {
    // Check if all questions are answered
    if (Object.keys(userAnswers).length !== questions.length) {
      toast({
        title: "Incomplete",
        description: "Please answer all questions before submitting",
        variant: "destructive",
      });
      return;
    }

    // Calculate results
    const quizResults: MCQResult["results"] = questions.map((q) => {
      const userAnswer = userAnswers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      return {
        questionId: q.id,
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const correctCount = quizResults.filter((r) => r.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);

    setResults({
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score,
      results: quizResults,
    });
    setPageState("results");
  };

  const resetQuiz = () => {
    setTopic("");
    setSubtopic("");
    setNumQuestions(5);
    setDifficulty("Medium");
    setQuestions([]);
    setUserAnswers({});
    setCurrentQuestion(0);
    setResults(null);
    setPageState("form");
  };

  // Page 1: Form
  if (pageState === "form") {
    return (
      <PageWrapper
        title="MCQ Generator"
        subtitle="Generate and practice multiple choice questions powered by AI"
      >
        <div className="max-w-2xl mx-auto">
          <GlassCard className="space-y-6">
            {showApiSettings && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Groq API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Groq API key (gsk_...)"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
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
                <button
                  onClick={saveApiKey}
                  className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
                >
                  Save API Key
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Biology, Python Programming, History"
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Subtopic <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type="text"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Decorators, World War II"
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Questions
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {[3, 5, 10, 15, 20].map((num) => (
                    <option key={num} value={num}>
                        {num} Questions
                    </option>
                    ))}
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium mb-2">
                    Difficulty Level
                </label>
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                </select>
                </div>
            </div>

            <button
                onClick={() => setShowApiSettings(!showApiSettings)}
                className="text-sm text-primary hover:underline"
            >
                {showApiSettings ? "Hide" : "Configure"} API Settings
            </button>

            <button
                onClick={generateMCQs}
                disabled={generating || !topic.trim()}
                className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
                {generating ? (
                <>
                    <span className="animate-spin">⏳</span>
                    Generating MCQs...
                </>
                ) : (
                <>
                    <Brain className="h-5 w-5" />
                    Generate MCQs
                </>
                )}
            </button>
            </GlassCard>
        </div>
        </PageWrapper>
    );
    }

  // Page 2: Quiz
    if (pageState === "quiz" && questions.length > 0) {
    const q = questions[currentQuestion];
    const selectedAnswer = userAnswers[q.id];

    return (
        <PageWrapper
        title="MCQ Quiz"
        subtitle={`Question ${currentQuestion + 1} of ${questions.length}`}
        >
        <div className="max-w-3xl mx-auto">
            <GlassCard className="mb-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{q.question}</h2>
                <div className="text-sm text-muted-foreground">
                    {currentQuestion + 1}/{questions.length}
                </div>
                </div>
                <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
                <div
                    className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
                </div>
            </div>

            <div className="space-y-3">
                {q.options.map((option, idx) => (
                <label
                    key={idx}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedAnswer === option
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                >
                    <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={() => handleAnswerSelect(option)}
                    className="w-4 h-4 cursor-pointer"
                    />
                    <span className="ml-4 text-sm">{option}</span>
                </label>
                ))}
            </div>
            </GlassCard>

            <div className="flex gap-3">
            <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestion === 0 || generating}
                className="px-6 py-2 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                Previous
            </button>

            {currentQuestion < questions.length - 1 ? (
                <button
                onClick={goToNextQuestion}
                className="ml-auto px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition flex items-center gap-2"
                >
                Next <ArrowRight className="h-4 w-4" />
                </button>
            ) : (
                <button
                onClick={submitQuiz}
                className="ml-auto px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition flex items-center gap-2"
                >
                Submit <CheckCircle2 className="h-4 w-4" />
                </button>
            )}
            </div>
        </div>
        </PageWrapper>
    );
    }

  // Page 3: Results
    if (pageState === "results" && results) {
    return (
        <PageWrapper
        title="Quiz Results"
        subtitle={`You scored ${results.score}% on this quiz`}
        >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Score Summary */}
            <GlassCard className="bg-gradient-to-br from-primary/20 to-primary/10">
            <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                <div className="text-4xl font-bold text-primary mb-2">
                    {results.score}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>
                <div>
                <div className="text-4xl font-bold text-green-500 mb-2">
                    {results.correctAnswers}
                </div>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div>
                <div className="text-4xl font-bold text-red-500 mb-2">
                    {results.totalQuestions - results.correctAnswers}
                </div>
                <p className="text-sm text-muted-foreground">Incorrect Answers</p>
                </div>
            </div>
            </GlassCard>

          {/* Detailed Results */}
            <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review Your Answers</h3>
            {results.results.map((result, idx) => (
                <GlassCard
                key={idx}
                className={`border-l-4 ${
                    result.isCorrect ? "border-l-green-500" : "border-l-red-500"
                }`}
                >
                <div className="flex items-start gap-3 mb-3">
                    {result.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                    <p className="font-medium mb-2">{result.question}</p>
                    <div className="space-y-2 text-sm">
                        <div>
                        <span className="text-muted-foreground">Your answer: </span>
                        <span
                            className={result.isCorrect ? "text-green-500" : "text-red-500"}
                        >
                            {result.userAnswer}
                        </span>
                        </div>
                        {!result.isCorrect && (
                        <div>
                            <span className="text-muted-foreground">Correct answer: </span>
                            <span className="text-green-500">{result.correctAnswer}</span>
                        </div>
                    )}
                    </div>
                </div>
                </div>

                <div className="bg-secondary/30 rounded-lg p-3 ml-8">
                <p className="text-xs font-medium text-primary mb-1">Explanation:</p>
                <p className="text-sm text-muted-foreground">{result.explanation}</p>
                </div>
            </GlassCard>
            ))}
        </div>

          {/* Action Button */}
        <button
            onClick={resetQuiz}
            className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
        >
            <RotateCcw className="h-5 w-5" />
            Try Another Quiz
        </button>
        </div>
    </PageWrapper>
    );
}

    return null;
}
