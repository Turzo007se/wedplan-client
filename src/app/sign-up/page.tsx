"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, ImagePlus, Loader2, CheckCircle2 } from "lucide-react";
import { authClient, cacheApiToken } from "@/lib/auth-client";
import { api, uploadImage } from "@/lib/api";
import { Toast } from "@/components/Shell";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  // Handle image selection and upload to ImgBB
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/)) {
      setError("Please select a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  }

  // Password validation: minimum 6 chars, 1 uppercase, 1 lowercase
  function validatePassword(pass: string): string | null {
    if (pass.length < 6) return "Password must be at least 6 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      return;
    }

    setBusy(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: role === "vendor" ? "vendor" : "customer",
        callbackURL: "/dashboard",
      };

      const r: any = await authClient.signUp.email(payload);
      if (r?.error) {
        setError(r.error.message || "Unable to create account. Please try again.");
        setBusy(false);
        return;
      }

      await cacheApiToken();
      if (imageFile) {
        try {
          const image = await uploadImage(imageFile);
          await api("/api/me", { method: "PATCH", body: JSON.stringify({ name: payload.name, image }) });
        } catch (error) {
          setError(error instanceof Error ? error.message : "Profile photo upload failed.");
          setNotice("Account created. You can retry the photo upload in Profile Settings.");
          window.dispatchEvent(new Event("auth-changed"));
          setTimeout(() => router.push("/dashboard?tab=profile"), 1800);
          return;
        }
      }
      window.dispatchEvent(new Event("auth-changed"));
      setNotice("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      setBusy(false);
    }
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 py-12 min-h-[75vh] flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl w-full items-center">
        {/* Left Side: Brand Narrative */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-tint px-3.5 py-1 text-xs font-semibold text-accent-strong">
            <Heart size={14} fill="currentColor" /> Welcome to WedPlan
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight">
            Begin Your Wedding Journey With Confidence.
          </h1>
          <p className="text-base text-muted leading-relaxed">
            Create an account to browse verified wedding professionals, request event dates, or publish your wedding services to reaching hundreds of celebrating couples.
          </p>

          <div className="space-y-3 pt-2 text-sm text-secondary-ink">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-accent" />
              <span>Free customer accounts with direct inquiry tools</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-accent" />
              <span>Vendor accounts with up to 3 free published services</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-accent" />
              <span>Real-time booking management & status updates</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="rounded-2xl border border-line bg-surface p-8 shadow-xl">
          <h2 className="font-serif text-2xl font-bold text-ink">Create Your Account</h2>
          <p className="text-xs text-muted mt-1 mb-6">Enter your details to register on WedPlan</p>

          {error && (
            <div className="mb-4 rounded-lg bg-danger-surface border border-danger-line p-3 text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ayesha Rahman"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-outline px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-outline px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Password * (min 6 chars, 1 uppercase, 1 lowercase)
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-outline px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Account Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-outline bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              >
                <option value="customer">Customer (Looking to plan and book services)</option>
                <option value="vendor">Vendor (Wedding professional providing services)</option>
              </select>
            </div>

            {/* Profile Image (Optional - ImgBB Upload) */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Profile Image (Optional - uploaded via ImgBB)
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-12 w-12 rounded-full object-cover border-2 border-accent"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream border border-outline text-muted">
                    <ImagePlus size={20} />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="text-xs text-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-raised file:text-accent-strong hover:file:bg-raised cursor-pointer"
                  />

                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={busy} className="w-full h-11 text-base font-semibold mt-2">
              {busy ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Google Authentication */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <span className="relative bg-surface px-3 text-xs text-muted">Or continue with</span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => authClient.signIn.social({ provider: "google", callbackURL: new URL("/dashboard", window.location.origin).href })}
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

            <p className="text-center text-xs text-muted pt-2">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-semibold text-accent hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>

      <Toast message={notice} type="success" onClose={() => setNotice("")} />
    </main>
  );
}
