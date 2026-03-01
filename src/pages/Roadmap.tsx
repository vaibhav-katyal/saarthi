import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Map, BookOpen, Search, Settings, X, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ROLE_BASED = [
  "Frontend", "Backend", "Full Stack",
  "DevOps", "DevSecOps", "Data Analyst",
  "AI Engineer", "AI and Data Scientist", "Data Engineer",
  "Android", "Machine Learning", "PostgreSQL",
  "iOS", "Blockchain", "QA",
  "Software Architect", "Cyber Security", "UX Design",
  "Technical Writer", "Game Developer", "Server Side Game Developer",
  "MLOps", "Product Manager", "Engineering Manager",
  "Developer Relations", "BI Analyst"
];

const SKILL_BASED = [
  "SQL", "Computer Science", "React",
  "Vue", "Angular", "JavaScript",
  "TypeScript", "Node.js", "Python",
  "System Design", "Java", "ASP.NET Core",
  "API Design", "Spring Boot", "Flutter",
  "C++", "Rust", "Go",
  "Software Design and Architecture", "GraphQL", "React Native",
  "Design System", "Prompt Engineering", "MongoDB",
  "Linux", "Kubernetes", "Docker",
  "AWS", "Terraform", "Data Structures & Algorithms",
  "Redis", "Git and GitHub", "PHP",
  "Cloudflare", "AI Red Teaming", "AI Agents",
  "Next.js", "Code Review", "Kotlin",
  "HTML", "CSS", "Swift & Swift UI",
  "Shell / Bash", "Laravel", "Elasticsearch",
  "WordPress", "Django", "Ruby",
  "Ruby on Rails", "Claude Code", "Vibe Coding"
];

export default function Roadmap() {
  const [search, setSearch] = useState("");
  const [generateTopic, setGenerateTopic] = useState("");
  const [generateType, setGenerateType] = useState<"roadmap" | "guide">("roadmap");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [generatedGuide, setGeneratedGuide] = useState("");
  const [selectedRoadmapPdf, setSelectedRoadmapPdf] = useState("");

  const [isLibraryExpanded, setIsLibraryExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("groq_api_key");
    if (saved) {
      setApiKey(saved);
    }
  }, []);

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({ title: "Please enter a valid API key", variant: "destructive" });
      return;
    }
    localStorage.setItem("groq_api_key", apiKey);
    toast({ title: "API key saved successfully" });
    setShowApiSettings(false);
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
              content: "You are an expert technical writer and developer documentation creator. YOU MUST FORMAT YOUR ENTIRE RESPONSE IN VALID MARKDOWN. Use standard Markdown symbols: `#` for Heading 1, `##` for Heading 2, `###` for Heading 3, `-` for bulleted lists, `**bold**` for bold text. Do not return plain text for structural elements.",
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

  const handleCardClick = (title: string) => {
    if (title.toLowerCase() === "frontend") {
      setSelectedRoadmapPdf("/roadmaps/frontend.pdf");
      toast({ title: `Opening Frontend Roadmap...` });
    } else {
      toast({ title: `Coming Soon: ${title} Roadmap` });
      console.log(`Will open roadmap for: ${title} later`);
    }
  };

  const handleGenerate = async () => {
    if (!generateTopic.trim()) {
      toast({
        title: "Please enter a topic",
        variant: "destructive"
      });
      return;
    }

    if (generateType === "guide") {
      if (!apiKey.trim()) {
        setShowApiSettings(true);
        toast({ title: "Please enter Groq API key first", variant: "destructive" });
        return;
      }

      setIsGenerating(true);
      setGeneratedGuide("");

      const prompt = `Create a visually appealing, highly-structured Markdown guide for the topic: "${generateTopic}".

Please strictly adhere to the following Markdown format. DO NOT use plain text for headings.

# ${generateTopic} Guide

[Write a 1-line catchy tagline]

[Write a short 2-sentence intro paragraph]

## Overview
### What It Is
[2 line description]

### Why It Matters
[2 line description]

## Core Concepts
- **[Concept 1]**: [1-sentence explanation]
- **[Concept 2]**: [1-sentence explanation]
- **[Concept 3]**: [1-sentence explanation]
- **[Concept 4]**: [1-sentence explanation]

## Architecture / How It Works
1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]

## Code Example
[Short paragraph explaining the code below]
\`\`\`javascript
// Example code
\`\`\`

## Common Interview Questions
- [Question 1]
- [Question 2]
- [Question 3]
- [Question 4]
- [Question 5]

Ensure that the output includes the exact markdown tags shown above (e.g., "#", "##", "###", "-", "\`\`\`", "**"). DO NOT omit the markdown symbols. WRITE IN A DIRECT, PROFESSIONAL TONE.`;

      const response = await callGroqAPI(prompt);

      setIsGenerating(false);

      if (response) {
        setGeneratedGuide(response);
        toast({ title: `Generated guide for ${generateTopic}` });
        setGenerateTopic("");
      }
    } else {
      setIsGenerating(true);
      // Simulate generation delay
      setTimeout(() => {
        setIsGenerating(false);
        toast({
          title: `Generated ${generateType} for ${generateTopic}`,
          description: "This feature is coming soon!"
        });
        setGenerateTopic("");
      }, 1500);
    }
  };

  const filteredRoles = ROLE_BASED.filter(role => role.toLowerCase().includes(search.toLowerCase()));
  const filteredSkills = SKILL_BASED.filter(skill => skill.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageWrapper title="Roadmaps & Guides">
      <div className={`mx-auto w-full space-y-12 pb-10 ${generatedGuide || selectedRoadmapPdf ? "max-w-7xl" : "max-w-5xl"}`}>

        {/* API Settings Modal */}
        {showApiSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-background border border-border rounded-xl shadow-lg">
              <div className="flex items-center justify-between p-4 border-b border-border">
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

              <div className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Groq API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors shadow-sm"
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
              </div>

              <div className="flex gap-2 p-4 border-t border-border">
                <button
                  onClick={() => setShowApiSettings(false)}
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveApiKey}
                  className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Generation Section */}
        {!generatedGuide && !selectedRoadmapPdf ? (
          <>
            <div className="flex flex-col items-center justify-center space-y-8 text-center pt-8 pb-4">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
                  What can I help you learn?
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
                  Enter a topic below to get it personalized for you
                </p>
              </div>

              <div className="w-full max-w-xl space-y-6">
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
                  <div className="text-left space-y-2">
                    <label className="text-sm font-medium text-muted-foreground px-1">
                      What can I help you learn?
                    </label>
                    <div className="flex bg-muted/50 p-1 rounded-xl">
                      <button
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${generateType === 'roadmap' ? 'bg-background shadow font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setGenerateType('roadmap')}
                      >
                        <Map className="w-4 h-4" />
                        Roadmap
                      </button>
                      <button
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${generateType === 'guide' ? 'bg-background shadow font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setGenerateType('guide')}
                      >
                        <BookOpen className="w-4 h-4" />
                        Guide
                      </button>
                    </div>
                  </div>

                  <div className="text-left space-y-2">
                    <label className="text-sm font-medium text-muted-foreground px-1 hover:cursor-pointer" htmlFor="topic-input">
                      Topic
                    </label>
                    <input
                      id="topic-input"
                      type="text"
                      placeholder="e.g. Frontend Development, Machine Learning..."
                      value={generateTopic}
                      onChange={(e) => setGenerateTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-base outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
                    />
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !generateTopic.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3.5 rounded-xl text-sm font-medium transition-all shadow-md mt-4"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </button>

                  {generateType === 'guide' && (
                    <div className="flex items-center justify-between px-1 pt-2">
                      {apiKey ? (
                        <p className="text-xs text-green-500">✓ API key configured</p>
                      ) : (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Configure API key to get started
                        </p>
                      )}
                      <button
                        onClick={() => setShowApiSettings(true)}
                        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Settings className="h-3 w-3" />
                        API Settings
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {!isLibraryExpanded ? (
              <div className="border-t border-border pt-12 flex justify-center pb-0">
                <button
                  onClick={() => setIsLibraryExpanded(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border rounded-xl text-base font-medium transition-colors shadow-sm"
                >
                  <BookOpen className="w-5 h-5" />
                  Explore Library
                </button>
              </div>
            ) : (
              <div className="border-t border-border pt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">Explore Library</h2>
                    <p className="text-sm text-muted-foreground">Discover professionally curated learning paths.</p>
                  </div>
                  {/* Search Input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search library..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Role-Based Roadmaps */}
                {(filteredRoles.length > 0) && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                      Role-Based Paths
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredRoles.map((role) => (
                        <button
                          key={role}
                          onClick={() => handleCardClick(role)}
                          className="flex items-center text-left rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium hover:border-primary/40 hover:bg-muted/50 transition-colors shadow-sm"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill-Based Roadmaps */}
                {(filteredSkills.length > 0) && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                      Skill-Based Paths
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredSkills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => handleCardClick(skill)}
                          className="flex items-center text-left rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium hover:border-primary/40 hover:bg-muted/50 transition-colors shadow-sm"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredRoles.length === 0 && filteredSkills.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
                    <p>No roadmaps or guides found for "{search}"</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="w-full max-w-none mx-auto space-y-6 pt-4 pb-12 animate-in fade-in slide-in-from-bottom-4">
            {!selectedRoadmapPdf && (
              <button
                onClick={() => {
                  setGeneratedGuide("");
                  setSelectedRoadmapPdf("");
                }}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/50 hover:text-foreground hover:bg-muted rounded-xl transition-all border border-transparent hover:border-border w-fit"
              >
                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Close Guide
              </button>
            )}
            {generatedGuide ? (
              <div className="text-left w-full max-w-4xl mx-auto py-8">
                <div className="prose prose-slate dark:prose-invert max-w-none 
                  prose-headings:tracking-tight 
                  prose-h1:text-5xl sm:prose-h1:text-[4rem] sm:prose-h1:leading-[1.1] prose-h1:font-black prose-h1:text-foreground prose-h1:mb-12
                  prose-h2:text-3xl sm:prose-h2:text-[2rem] prose-h2:font-bold prose-h2:text-foreground prose-h2:mt-16 prose-h2:mb-8
                  prose-h3:text-xl sm:prose-h3:text-[1.35rem] prose-h3:font-semibold prose-h3:text-foreground/90 prose-h3:mt-10 prose-h3:mb-4
                  prose-p:text-base sm:prose-p:text-[1.1rem] prose-p:leading-[1.75] prose-p:text-muted-foreground prose-p:mb-6
                  prose-strong:font-semibold prose-strong:text-foreground
                  prose-ul:space-y-4 prose-ul:my-8 prose-ul:ml-6 prose-ul:list-disc marker:prose-ul:text-foreground/40
                  prose-ol:space-y-4 prose-ol:my-8 prose-ol:ml-6 prose-ol:list-decimal marker:prose-ol:text-foreground/60 marker:prose-ol:font-medium
                  prose-li:text-muted-foreground prose-li:leading-relaxed prose-li:pl-2
                  prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-muted/80 prose-code:text-foreground prose-code:rounded-md prose-code:border prose-code:border-border/50 prose-code:text-[0.85em] prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-border/30 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:shadow-xl
                ">
                  <ReactMarkdown>{generatedGuide}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex-none p-4 flex justify-between items-center border-b border-border/40 bg-card/60 backdrop-blur-xl">
                  <div className="font-semibold text-foreground ml-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Interactive Roadmap
                  </div>
                  <button
                    onClick={() => setSelectedRoadmapPdf("")}
                    className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:text-foreground hover:bg-muted/80 rounded-xl transition-all border border-transparent hover:border-border shadow-sm"
                  >
                    <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Close Roadmap
                  </button>
                </div>
                <div className="flex-1 w-full bg-muted/10 relative">
                  <iframe
                    src={selectedRoadmapPdf}
                    className="absolute inset-0 w-full h-full border-0"
                    title="Roadmap PDF View"
                  />
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
