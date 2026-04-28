import { X, Key, ExternalLink, ShieldCheck, HelpCircle } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface ApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiGuideModal({ isOpen, onClose }: ApiGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <GlassCard className="relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-0">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/50 shrink-0 bg-card/50">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <div className="bg-primary/20 p-1.5 rounded-lg">
              <Key className="w-5 h-5 text-primary" />
            </div>
            Get Your Free API Key
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scrollbar-thin">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you don't already have an API key, follow this step-by-step guide to generate one from the developer console.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-primary/20 text-primary text-xs">1</span>
                Open the Developer Console
              </h3>
              <div className="pl-7 space-y-2">
                <p className="text-sm text-muted-foreground">Go to the official console:</p>
                <a 
                  href="https://console.groq.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-lg"
                >
                  console.groq.com <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                  <li>This is where you manage API access</li>
                  <li>Make sure you're on the correct website (avoid fake links)</li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-primary/20 text-primary text-xs">2</span>
                Sign In / Create an Account
              </h3>
              <div className="pl-7 text-sm text-muted-foreground">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Click <strong className="text-foreground">Sign In</strong></li>
                  <li>Use your existing account or create a new one (takes ~1–2 minutes)</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-primary/20 text-primary text-xs">3</span>
                Navigate to API Keys Section
              </h3>
              <div className="pl-7 text-sm text-muted-foreground">
                <p className="mb-1">Once logged in:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Look for <strong className="text-foreground">"API Keys"</strong>, <strong className="text-foreground">"Developers"</strong>, or <strong className="text-foreground">"Settings"</strong></li>
                  <li>Click <strong className="text-foreground">Create New API Key</strong></li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-primary/20 text-primary text-xs">4</span>
                Generate Your API Key
              </h3>
              <div className="pl-7 space-y-3 text-sm text-muted-foreground">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Give your key a name (e.g., <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">MyAppKey</code>)</li>
                  <li>Click <strong className="text-foreground">Generate</strong></li>
                </ul>
                <p>You'll now see something like:</p>
                <div className="bg-black/50 border border-border/50 rounded-lg p-3 font-mono text-xs text-primary/80">
                  gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-primary/20 text-primary text-xs">5</span>
                Copy & Save Your Key
              </h3>
              <div className="pl-7 space-y-3 text-sm text-muted-foreground">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Click <strong className="text-foreground">Copy</strong></li>
                  <li>Store it somewhere safe (Notes / Password Manager)</li>
                </ul>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-3 mt-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-500 text-xs uppercase tracking-wider">Important</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-amber-500/90">
                      <li>Do NOT share your API key publicly</li>
                      <li>Treat it like a password</li>
                      <li>Never expose your API key in frontend code</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                Troubleshooting
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                <div className="bg-muted/30 border border-border/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">❌ "Key not working"</p>
                  <p className="text-xs text-muted-foreground">Check for extra spaces when pasting. Regenerate a new key if needed.</p>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">❌ "Access denied"</p>
                  <p className="text-xs text-muted-foreground">Your account may not have API access yet, or you might need to check your usage limits.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </GlassCard>
    </div>
  );
}
