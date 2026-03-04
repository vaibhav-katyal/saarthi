import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageWrapper } from "@/components/PageWrapper";
import { BookOpen, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "@/hooks/use-toast";

const generatePrompt = (topic: string) => `
Your task is to generate a COMPLETE, STRUCTURED learning guide for the topic:
"${topic}"

The guide must teach the topic from beginner level and gradually progress toward advanced understanding.

STRICT RULES:
- Assume the learner is a BEGINNER unless the topic absolutely requires prior knowledge.
- If prerequisites exist, clearly state them and keep them minimal.
- Progress logically: fundamentals → core skills → intermediate → advanced → real-world use.
- Do NOT skip foundational concepts required to understand later topics.
- Focus on practical understanding and real developer workflows.
- Avoid academic or theoretical explanations unless necessary.
- Do NOT include motivational talk, filler text, or emojis.
- Do NOT repeat information between sections.
- Keep explanations concise and focused.

CONTENT REQUIREMENTS:
- Prefer practical skills over abstract theory.
- Include realistic project ideas developers would actually build.
- Use modern tools and practices relevant to the topic.
- Avoid outdated technologies unless historically necessary.

OUTPUT FORMAT (Markdown ONLY):

# ${topic} - Complete Learning Guide

## 1. Prerequisites
- List only what is absolutely required
- If none, explicitly say "No prerequisites"

## 2. Learning Roadmap
Break the topic into ordered phases:
- Phase 1: Foundations
- Phase 2: Core Concepts
- Phase 3: Intermediate Skills
- Phase 4: Advanced Topics
- Phase 5: Real-World Applications

Each phase must contain:
- Key concepts to learn
- Why they matter
- Estimated time to complete

## 3. Detailed Breakdown
For EACH phase:
- Concepts (bullet points)
- What the learner should be able to do after finishing
- Common mistakes beginners make

## 4. Hands-On Practice
- Beginner projects
- Intermediate projects
- Advanced / real-world projects

## 5. Best Learning Resources
Organized by category:
- Official documentation
- Free video courses
- Practice platforms
- Reference materials

Avoid paid resources unless unavoidable.

## 6. Assessment Checklist
Provide a checklist the learner can use to self-verify mastery.

## 7. Learning Timeline
- Fast-track path
- Standard path
- Deep-dive path

Each with realistic time estimates.

## 8. Next Steps
- What to learn AFTER this topic
- Related technologies or skills

STYLE CONSTRAINTS:
- Clear, concise, professional
- Use bullet points, not long paragraphs
- No repetition
- No unnecessary explanations
`;

export default function GuideView() {
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic") || "";

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!topic) {
      setError("No topic provided.");
      setLoading(false);
      return;
    }

    const apiKey = localStorage.getItem("groq_api_key");

    if (!apiKey) {
      setError(
        "No API key configured. Please configure it in the AI Roadmap section first."
      );
      setLoading(false);
      return;
    }

    const generateGuide = async () => {
      try {
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
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
                    "You are an expert technical learning guide generator. You must follow the exact structure and rules requested.",
                },
                {
                  role: "user",
                  content: generatePrompt(topic),
                },
              ],
              temperature: 0.4,
              max_tokens: 3000,
            }),
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || "Failed to call Groq API");
        }

        const data = await response.json();
        const result =
          data?.choices?.[0]?.message?.content || "Failed to generate guide.";

        setContent(result);
      } catch (err) {
        toast({
          title: "Generation Error",
          description: err instanceof Error ? err.message : "An error occurred",
          variant: "destructive",
        });

        setError(
          "Failed to generate the guide. Please check your API key and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    generateGuide();
  }, [topic]);

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <div className="mx-auto w-full max-w-5xl space-y-12 pb-10">
        <div className="flex flex-col space-y-8 pt-8 pb-4">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground flex items-center gap-4">
              {topic ? `${topic} Learning Guide` : "Your Personalized Guide"}
              {loading && (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              )}
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg">
              {loading
                ? "Generating your comprehensive path..."
                : "Here is everything you need to know, structured from basics to advanced."}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse" />
                  <Sparkles className="w-16 h-16 text-primary animate-bounce relative z-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">
                    Crafting the Perfect Curriculum
                  </h3>

                  <p className="text-muted-foreground max-w-sm">
                    Analyzing prerequisites, finding the best resources, and
                    structuring timelines. This will take a few seconds.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-destructive">
                <p className="font-semibold">{error}</p>
              </div>
            ) : content ? (
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>No guide found. Please generate one from the Roadmaps section.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}