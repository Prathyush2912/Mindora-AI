
import { useState } from "react";
import { supabase } from "./lib/supabase";

type AuthProps = {
  onAuthenticated?: () => void;
};

export default function Auth({ onAuthenticated }: AuthProps) {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
          },
        });

        if (error) throw error;

        if (data.session) {
          onAuthenticated?.();
        } else {
          setMessage("Account created. Check your email to confirm your account.");
        }
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
        onAuthenticated?.();
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim()
        );

        if (error) throw error;
        setMessage("Password reset link sent. Check your email.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const heading =
    mode === "signup"
      ? "Create your account"
      : mode === "reset"
        ? "Reset your password"
        : "Welcome back";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b0b12] px-5 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold">
            M
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Mindora</h1>
          <p className="mt-2 text-sm text-gray-400">
            Your personal AI-powered learning space
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold">{heading}</h2>
          <p className="mt-2 mb-7 text-sm text-gray-400">
            {mode === "signup"
              ? "Start your learning journey with Mindora."
              : mode === "reset"
                ? "Enter your email and we'll send you a reset link."
                : "Sign in to continue learning."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Full name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-500"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Email address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-500"
              />
            </div>

            {mode !== "reset" && (
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Password
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-500"
                />
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setError("");
                    setMessage("");
                  }}
                  className="text-sm text-violet-400 hover:text-violet-300"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 py-3 font-semibold transition hover:bg-violet-500 disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "signup"
                  ? "Create account"
                  : mode === "reset"
                    ? "Send reset link"
                    : "Sign in"}
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-gray-400">
            {mode === "reset" ? (
              <button
                onClick={() => setMode("login")}
                className="text-violet-400 hover:text-violet-300"
              >
                Back to sign in
              </button>
            ) : (
              <>
                {mode === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError("");
                    setMessage("");
                  }}
                  className="font-medium text-violet-400 hover:text-violet-300"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
