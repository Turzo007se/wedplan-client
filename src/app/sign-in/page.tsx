"use client";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, CheckCircle2 } from "lucide-react";
import { authClient, cacheApiToken } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Toast } from "@/components/Shell";
import { Button } from "@/components/ui/button";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get("redirect");
  const redirectPath = requestedRedirect && /^\/(?![\/\\])/.test(requestedRedirect) && !/[\\\u0000-\u001f]/.test(requestedRedirect)
    ? requestedRedirect
    : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const r: any = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (r?.error) {
        setError(r.error.message || "Invalid email or password.");
        setBusy(false);
        return;
      }

      await cacheApiToken();
      window.dispatchEvent(new Event("auth-changed"));

      // Fetch user profile to verify role and status
      try {
        const me = await api<{ user: any }>("/api/me");
        if (me?.user?.isBlocked) {
          setError("This account is currently blocked by an administrator.");
          await authClient.signOut();
          setBusy(false);
          return;
        }
      } catch {
        // Continue if profile load had a transient issue
      }

      setNotice("Signed in successfully! Redirecting...");
      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setBusy(false);
    }
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 py-14 min-h-[75vh] flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl w-full items-center">
        {/* Left Narrative */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fbf0f2] px-3.5 py-1 text-xs font-semibold text-[#8f3e4d]">
            <Heart size={14} fill="currentColor" /> Welcome Back
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#292526] leading-tight">
            Continue Planning Your Forever Celebration.
          </h1>
          <p className="text-base text-[#777174] leading-relaxed">
            Sign in to check the status of your booking requests, manage your vendor services, or review platform transactions.
          </p>
          <div className="rounded-xl border border-[#ded3cf] bg-[#fdfbf9] p-5 text-xs text-[#514b4c] space-y-2">
            <p className="font-semibold text-[#292526]">Role-Based Access:</p>
            <p>• Customers can view booking statuses and cancel pending requests.</p>
            <p>• Vendors can accept/reject booking requests and upgrade to Premium.</p>
            <p>• Admins can review pending services and manage platform users.</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="rounded-2xl border border-[#eee5e1] bg-white p-8 shadow-xl">
          <h2 className="font-serif text-2xl font-bold text-[#292526]">Sign In to WedPlan</h2>
          <p className="text-xs text-[#777174] mt-1 mb-6">Enter your credentials to access your dashboard</p>

          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#292526] mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#ded3cf] px-3.5 py-2.5 text-sm text-[#292526] focus:border-[#b65b69] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#292526]">Password</label>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#ded3cf] px-3.5 py-2.5 text-sm text-[#292526] focus:border-[#b65b69] focus:outline-none"
              />
            </div>

            <Button type="submit" disabled={busy} className="w-full h-11 text-base font-semibold mt-2">
              {busy ? "Signing In..." : "Sign In"}
            </Button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#eee5e1]" />
              </div>
              <span className="relative bg-white px-3 text-xs text-[#777174]">Or continue with</span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => authClient.signIn.social({ provider: "google", callbackURL: new URL(redirectPath, window.location.origin).href })}
              className="w-full h-11"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-xs text-[#777174] pt-2">
              New to WedPlan?{" "}
              <Link href="/sign-up" className="font-semibold text-[#b65b69] hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>

      <Toast message={notice} type="success" onClose={() => setNotice("")} />
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-[#777174]">Loading sign-in...</div>}>
      <SignInContent />
    </Suspense>
  );
}
