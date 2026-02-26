import { useState } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Map, BookOpen, Search } from "lucide-react";

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

  const handleCardClick = (title: string) => {
    toast({ title: `Coming Soon: ${title} Roadmap` });
    console.log(`Will open roadmap for: ${title} later`);
  };

  const handleGenerate = () => {
    if (!generateTopic.trim()) {
      toast({ 
        title: "Please enter a topic", 
        variant: "destructive" 
      });
      return;
    }
    
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
  };

  const filteredRoles = ROLE_BASED.filter(role => role.toLowerCase().includes(search.toLowerCase()));
  const filteredSkills = SKILL_BASED.filter(skill => skill.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageWrapper title="Roadmaps & Guides">
      <div className="mx-auto w-full space-y-12 max-w-5xl pb-10">
        
        {/* AI Generation Section */}
        <div className="flex flex-col items-center justify-center space-y-8 text-center pt-8 pb-4">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
              What can I help you learn?
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
              Enter a topic below to generate your path
            </p>
          </div>
          
          <div className="w-full max-w-xl space-y-6">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
              <div className="text-left space-y-2">
                <label className="text-sm font-medium text-muted-foreground px-1">
                  I want to generate a...
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
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-12 space-y-8">
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

      </div>
    </PageWrapper>
  );
}
