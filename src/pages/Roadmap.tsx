import { useState } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";

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

  const handleCardClick = (title: string) => {
    toast({ title: `Coming Soon: ${title} Roadmap` });
    console.log(`Will open roadmap for: ${title} later`);
  };

  const filteredRoles = ROLE_BASED.filter(role => role.toLowerCase().includes(search.toLowerCase()));
  const filteredSkills = SKILL_BASED.filter(skill => skill.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageWrapper title="Roadmaps">
      <div className="mx-auto w-full space-y-8 max-w-5xl">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search roadmaps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
          />
        </div>

        {/* Role-Based Roadmaps */}
        {(filteredRoles.length > 0) && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Role-Based Roadmaps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleCardClick(role)}
                  className="flex items-center text-left rounded-md border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/40 hover:bg-muted/50 transition-colors shadow-sm"
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
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Skill-Based Roadmaps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleCardClick(skill)}
                  className="flex items-center text-left rounded-md border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/40 hover:bg-muted/50 transition-colors shadow-sm"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {filteredRoles.length === 0 && filteredSkills.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No roadmaps found for "{search}"
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
