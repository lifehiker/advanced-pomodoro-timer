"use client";

import { useState } from "react";
import { Puzzle, Link, Unlink, Key, ExternalLink, CheckCircle, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { usePomodoroStore } from "@/lib/store";

const integrationIcons: Record<string, { bg: string; text: string }> = {
  trello: { bg: "rgba(0, 121, 191, 0.15)", text: "#0079bf" },
  asana: { bg: "rgba(246, 114, 128, 0.15)", text: "#f67280" },
  "google-calendar": { bg: "rgba(66, 133, 244, 0.15)", text: "#4285f4" },
};

export default function IntegrationsPanel() {
  const { integrations, toggleIntegration, updateApiKey } = usePomodoroStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="animate-slide-up space-y-6">
      <div className="glass-card p-6">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--color-accent-work-dim)" }}>
              <Puzzle size={20} style={{ color: "var(--color-accent-work)" }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Integrations</h2>
              <p className="text-xs text-[var(--color-text-muted)]">Connect your favorite productivity tools</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full px-3 py-1" style={{ backgroundColor: connectedCount > 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(255,255,255,0.05)" }}>
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: connectedCount > 0 ? "var(--color-success)" : "var(--color-text-muted)" }} />
            <span className="text-xs text-[var(--color-text-secondary)]">{connectedCount} connected</span>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 rounded-lg bg-white/[0.03] px-4 py-2.5">
          <Shield size={14} className="text-[var(--color-text-muted)]" />
          <span className="text-xs text-[var(--color-text-muted)]">API keys are stored locally in your browser</span>
        </div>

        <div className="space-y-3">
          {integrations.map((integration) => {
            const colors = integrationIcons[integration.id] || { bg: "var(--color-accent-work-dim)", text: "var(--color-accent-work)" };
            const isExpanded = expandedId === integration.id;

            return (
              <div key={integration.id} className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white/[0.02] transition-all hover:border-[var(--color-border-hover)]">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: colors.bg }}>
                    {integration.connected ? <Link size={18} style={{ color: colors.text }} /> : <Unlink size={18} style={{ color: colors.text }} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{integration.name}</h3>
                      {integration.connected && (
                        <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                          <CheckCircle size={10} /> Connected
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{integration.description}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => toggleIntegration(integration.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                      style={
                        integration.connected
                          ? { backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }
                          : { backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e" }
                      }
                    >
                      {integration.connected ? "Disconnect" : "Connect"}
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : integration.id)}
                      className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="animate-slide-up border-t border-[var(--color-border)] bg-white/[0.02] px-4 py-3">
                    <label className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <Key size={12} /> API Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={integration.apiKey}
                        onChange={(e) => updateApiKey(integration.id, e.target.value)}
                        placeholder={`Enter ${integration.name} API key...`}
                        className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-work)]"
                      />
                      <button type="button"
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                      >
                        Get Key <ExternalLink size={12} />
                      </button>
                    </div>
                    {integration.apiKey && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle size={10} /> API key saved
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
