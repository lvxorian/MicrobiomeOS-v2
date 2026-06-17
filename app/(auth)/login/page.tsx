"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { FlaskConical } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await signIn("email", { email, callbackUrl: "/dashboard" });
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="absolute inset-0 bg-gradient-to-b from-teal/5 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <FlaskConical className="h-10 w-10 text-teal mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold tracking-[-0.5px] text-text mb-2">
            Microbiome<span className="text-teal">OS</span>
          </h1>
          <p className="text-text-secondary text-sm">
            Výzkumná platforma pro mikrobiom
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          {sent ? (
            <div className="text-center py-4">
              <span className="font-mono text-[10px] uppercase tracking-[2px] text-teal block mb-2">
                Odesláno
              </span>
              <p className="text-text text-sm mb-1">Zkontrolujte svůj e-mail</p>
              <p className="text-text-secondary text-xs">
                Na adresu <strong>{email}</strong> byl odeslán přihlašovací odkaz.
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleEmailLogin}>
                <label className="block font-mono text-[10px] uppercase tracking-[1.5px] text-text3 mb-2">
                  E-mail (magic link)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="petr.rysavka@vyzkum.cz"
                  required
                  className="w-full h-10 px-3 rounded-md bg-bg3 border border-border text-text text-sm placeholder:text-text3 focus:border-teal/40 focus:ring-1 focus:ring-teal/20 outline-none transition-colors mb-4"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-10 rounded-md bg-teal text-background font-mono text-xs font-medium hover:bg-teal-dim disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Odesílám..." : "Přihlásit se"}
                </button>
              </form>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="font-mono text-[9px] text-text3 uppercase tracking-[1px]">
                  nebo
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                className="w-full h-10 rounded-md bg-bg3 border border-border text-text-secondary font-mono text-xs font-medium hover:bg-card2 hover:text-text transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </button>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-text3 text-[11px]">
          Pouze pro ověřené výzkumníky. Registrace přes pozvánku.
        </p>
      </div>
    </div>
  );
}
