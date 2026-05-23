"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import {
    Brain,
    Play,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ArrowRight,
    RotateCcw,
    Settings,
    Zap,
    BarChart3,
    ChevronRight,
    X,
    HelpCircle,
} from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { GlassCard } from "@/components/GlassCard";
import { ApiGuideModal } from "@/components/ApiGuideModal";
import { toast } from "@/hooks/use-toast";
import { logMCQActivity } from "@/lib/activityLogger";

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
    const [searchParams] = useSearchParams();
    const [apiKey, setApiKey] = useState("");
    const [showApiSettings, setShowApiSettings] = useState(false);
    const [showApiGuide, setShowApiGuide] = useState(false);
    const [pageState, setPageState] = useState<PageState>("form");

  // Form state
    const [topic, setTopic] = useState("");
    const [subtopic, setSubtopic] = useState("");
    const [numQuestions, setNumQuestions] = useState(5);
    const [difficulty, setDifficulty] = useState("Intermediate");

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

  // Load MCQ parameters from URL (from agentic mode)
  useEffect(() => {
    const urlTopic = searchParams.get('topic');
    const urlSubtopic = searchParams.get('subtopic');
    const urlDifficulty = searchParams.get('difficulty');
    const urlNumQuestions = searchParams.get('numQuestions');

    if (urlTopic) setTopic(decodeURIComponent(urlTopic));
    if (urlSubtopic) setSubtopic(decodeURIComponent(urlSubtopic));
    if (urlDifficulty) setDifficulty(urlDifficulty);
    if (urlNumQuestions) setNumQuestions(parseInt(urlNumQuestions));
  }, [searchParams]);

  // Trigger confetti when all MCQs are correct
  useEffect(() => {
    if (results && results.score === 100) {
      // Celebrate with confetti! 🎉
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Extra burst after a short delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { x: 0.1, y: 0.6 },
        });
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { x: 0.9, y: 0.6 },
        });
      }, 250);
    }
  }, [results]);

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
    
    // Log the quiz completion activity
    logMCQActivity.submit(score, correctCount, questions.length);
  };

  const resetQuiz = () => {
    setTopic("");
    setSubtopic("");
    setNumQuestions(5);
    setDifficulty("Intermediate");
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
        subtitle="Create personalized quizzes powered by advanced AI"
        icon={<Brain className="h-3 w-3" />}
        badge="Quizzes"
      >
        {/* API Guide Modal */}
        <ApiGuideModal isOpen={showApiGuide} onClose={() => setShowApiGuide(false)} />

        {/* API Settings Modal */}
        {showApiSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md border border-border/50">
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
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
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
                    <button
                      onClick={() => setShowApiGuide(true)}
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors underline underline-offset-2 flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      How to get API key?
                    </button>
                  </div>
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

        <div className="max-w-4xl mx-auto space-y-4">
          {/* Header Section */}
          <div className="relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-gradient-to-br from-primary/15 via-transparent to-transparent p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 backdrop-blur-sm">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Quiz Builder</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Customize your learning experience with AI-generated questions
                </p>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <GlassCard className="space-y-5 border border-border/50 p-5">

            {/* Topic and Subtopic Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2 text-foreground">
                  Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Quantum Physics, Machine Learning, Shakespeare"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 text-foreground">
                  Subtopic{" "}
                  <span className="font-normal text-[10px] text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="text"
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  placeholder="e.g., Wave-Particle Duality, Neural Networks"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Configuration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Questions Card */}
              <div className="rounded-xl border border-border/50 bg-gradient-to-br from-secondary/30 to-secondary/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-semibold text-foreground">Questions</h3>
                </div>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-border/50 text-foreground font-medium cursor-pointer appearance-none"
                >
                  {[3, 5, 10, 15, 20].map((num) => (
                    <option key={num} value={num} style={{ backgroundColor: '#0f172a', color: '#e5e7eb' }}>
                      {num} Questions
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Card */}
              <div className="rounded-xl border border-border/50 bg-gradient-to-br from-secondary/30 to-secondary/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-semibold text-foreground">Difficulty</h3>
                </div>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-border/50 text-foreground font-medium cursor-pointer appearance-none"
                >
                  <option style={{ backgroundColor: '#0f172a', color: '#e5e7eb' }}>Beginner</option>
                  <option style={{ backgroundColor: '#0f172a', color: '#e5e7eb' }}>Intermediate</option>
                  <option style={{ backgroundColor: '#0f172a', color: '#e5e7eb' }}>Advanced</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowApiSettings(true)}
                className="px-3 py-2 text-sm rounded-lg bg-secondary/50 text-foreground font-medium hover:bg-secondary transition duration-200 flex items-center gap-2"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </button>
              <button
                onClick={generateMCQs}
                disabled={generating || !topic.trim()}
                className="ml-auto px-6 py-2 text-sm rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="animate-spin w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                    <span>Crafting Questions...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Start Quiz</span>
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      </PageWrapper>
    );
  }

  // Page 2: Quiz
  if (pageState === "quiz" && questions.length > 0) {
    const q = questions[currentQuestion];
    const selectedAnswer = userAnswers[q.id];
    const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <PageWrapper
        title="Quiz Session"
        subtitle={`Question ${currentQuestion + 1} of ${questions.length}`}
        icon={<Zap className="h-3 w-3" />}
        badge="Live"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-foreground">
                Progress
              </div>
              <div className="text-sm font-semibold text-primary">
                {currentQuestion + 1}/{questions.length}
              </div>
            </div>
            <div className="h-2 w-full bg-secondary/40 rounded-full overflow-hidden backdrop-blur-sm border border-border/30">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <GlassCard className="space-y-8 border border-border/50 backdrop-blur-xl">
            {/* Question Text */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <span className="text-sm font-bold text-primary">
                    {currentQuestion + 1}
                  </span>
                </div>
                <h2 className="text-xl font-semibold leading-relaxed text-foreground mt-1">
                  {q.question}
                </h2>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                return (
                  <label
                    key={idx}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                        : "border-border/50 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/40"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 mt-0.5 ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-border/50 group-hover:border-primary/50"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(option)}
                      className="sr-only"
                    />
                    <span className="flex-1 text-base font-medium text-foreground leading-relaxed pt-0.5">
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          </GlassCard>

          {/* Navigation Buttons */}
          <div className="flex gap-3 items-center pt-4">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
              className={`px-6 py-2.5 rounded-lg font-medium transition duration-200 flex items-center gap-2 ${
                currentQuestion === 0
                  ? "bg-secondary/30 text-muted-foreground cursor-not-allowed"
                  : "bg-secondary/50 text-foreground hover:bg-secondary/70"
              }`}
            >
              ← Back
            </button>

            <div className="flex-1" />

            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={goToNextQuestion}
                disabled={!selectedAnswer}
                className={`px-8 py-2.5 rounded-lg font-medium transition duration-200 flex items-center gap-2 ${
                  !selectedAnswer
                    ? "bg-primary/30 text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30"
                }`}
              >
                Next <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={!selectedAnswer}
                className={`px-8 py-2.5 rounded-lg font-semibold transition duration-200 flex items-center gap-2 ${
                  !selectedAnswer
                    ? "bg-green-500/30 text-muted-foreground cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-lg hover:shadow-green-500/30"
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Page 3: Results
  if (pageState === "results" && results) {
    const accuracyColor = 
      results.score >= 80 ? "text-emerald-400" :
      results.score >= 60 ? "text-yellow-400" : 
      "text-orange-400";

    const scoreStatus = 
      results.score >= 80 ? "Excellent!" :
      results.score >= 60 ? "Good Effort" : 
      "Keep Practicing";

    return (
      <PageWrapper
        title="Quiz Complete"
        subtitle="Review your performance and learn from mistakes"
        icon={<BarChart3 className="h-3 w-3" />}
        badge="Results"
      >
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Score Card */}
          <div className="relative overflow-hidden rounded-2xl border border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
            <GlassCard className="relative space-y-8 backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Score */}
                <div className="flex flex-col items-center justify-center space-y-4 py-8 px-6">
                  <div className="relative h-40 w-40">
                    <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-secondary/40"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={`${(results.score / 100) * 282.74} 282.74`}
                        className={`${accuracyColor} transition-all duration-1000`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className={`text-4xl font-bold ${accuracyColor}`}>
                        {results.score}%
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-semibold ${accuracyColor}`}>
                      {scoreStatus}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-400 mb-2">
                        {results.correctAnswers}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Correct Answers
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-400 mb-2">
                        {results.totalQuestions - results.correctAnswers}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Incorrect Answers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex items-center">
                  <div className="space-y-4 w-full">
                    <div className="rounded-lg bg-secondary/30 p-4 backdrop-blur-sm border border-border/30">
                      <p className="text-xs text-muted-foreground font-medium mb-2">
                        TOTAL QUESTIONS
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {results.totalQuestions}
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary/30 p-4 backdrop-blur-sm border border-border/30">
                      <p className="text-xs text-muted-foreground font-medium mb-2">
                        ACCURACY RATE
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.round((results.correctAnswers / results.totalQuestions) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold tracking-tight">Answer Review</h3>
            </div>

            {results.results.map((result, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-xl border border-border/50 backdrop-blur-sm transition-all duration-200 hover:border-border/80"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                    result.isCorrect
                      ? "bg-gradient-to-b from-emerald-500 to-emerald-400"
                      : "bg-gradient-to-b from-red-500 to-red-400"
                  }`}
                />
                <GlassCard className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {result.isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-4">
                        {result.question}
                      </h4>

                      <div className="space-y-3">
                        {/* Your Answer */}
                        <div className="rounded-lg bg-secondary/40 p-3 border border-border/40">
                          <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                            YOUR ANSWER
                          </p>
                          <p className={`text-sm font-medium ${
                            result.isCorrect ? "text-emerald-400" : "text-red-400"
                          }`}>
                            {result.userAnswer}
                          </p>
                        </div>

                        {/* Correct Answer (if wrong) */}
                        {!result.isCorrect && (
                          <div className="rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20">
                            <p className="text-xs font-semibold text-emerald-400 mb-1.5">
                              CORRECT ANSWER
                            </p>
                            <p className="text-sm font-medium text-emerald-400">
                              {result.correctAnswer}
                            </p>
                          </div>
                        )}

                        {/* Explanation */}
                        <div className="rounded-lg bg-blue-500/10 p-4 border border-blue-500/20 space-y-2">
                          <p className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                            <Zap className="h-3.5 w-3.5" />
                            EXPLANATION
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {result.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={resetQuiz}
            className="w-full px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/30 transition duration-200 flex items-center justify-center gap-2 mt-8"
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
