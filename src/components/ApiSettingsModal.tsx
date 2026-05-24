import { X, Copy, Check } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onSave: () => void;
}

export function ApiSettingsModal({
  isOpen,
  onClose,
  apiKey,
  onApiKeyChange,
  onSave,
}: ApiSettingsModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              API Configuration
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Configure your Groq API for problem generation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Groq API Key */}
          <div>
            <div className="mb-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                Groq API Key
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Used to generate coding problems using AI.{" "}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Get free key →
                </a>
              </p>
            </div>

            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="gsk_..."
                className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors font-mono"
              />
              {apiKey && (
                <button
                  onClick={() => copyToClipboard(apiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted-foreground/10 rounded"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              )}
            </div>

            <div className="bg-muted/50 border border-border/50 rounded-lg p-4 mt-4">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>How to get a free Groq API Key:</strong>
              </p>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Visit the <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Groq Console</a></li>
                <li>Sign up or log in to your account</li>
                <li>Navigate to **API Keys** in the sidebar</li>
                <li>Click **Create API Key**, name it, and copy it</li>
                <li>Paste the key above and save the configuration</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-border/50">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave();
              onClose();
            }}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Save Configuration
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
