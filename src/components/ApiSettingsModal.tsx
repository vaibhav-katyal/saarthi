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
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              API Configuration
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Configure your APIs for problem generation and code execution
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Groq API Key */}
          <div className="border-b border-border/50 pb-6">
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
                  className="text-primary hover:underline"
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
          </div>

          {/* Judge0 API Info */}
          <div>
            <div className="mb-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                Judge0 API Key
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Used to execute code and run tests.{" "}
                <a
                  href="https://rapidapi.com/judge0-official/api/judge0-ce"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get free key on RapidAPI →
                </a>
              </p>
            </div>

            <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Steps:</strong>
              </p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Visit RapidAPI and subscribe to Judge0 (free tier)</li>
                <li>Copy your X-RapidAPI-Key from dashboard</li>
                <li>Add it to your .env.local file</li>
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
