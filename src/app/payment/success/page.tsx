"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PaymentSuccessPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check status after webhook processing
    const checkStatus = () => {
      api<{ user: any }>("/api/me")
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="container mx-auto px-4 sm:px-6 py-20 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-lg w-full rounded-3xl border border-[#eee5e1] bg-white p-10 text-center shadow-xl space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
          <CheckCircle2 size={44} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#b65b69]">
            <Sparkles size={14} /> Subscription Activated
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#292526]">
            Thank You for Upgrading!
          </h1>
          <p className="text-sm text-[#777174] leading-relaxed">
            Your Stripe Checkout session was completed successfully. Your subscription status is verified via Stripe Webhooks.
          </p>
        </div>

        <div className="rounded-2xl border border-[#ded3cf] bg-[#fdfbf9] p-5 space-y-2 text-xs text-[#514b4c]">
          <div className="flex items-center justify-between">
            <span className="text-[#777174]">Account Tier:</span>
            {user?.subscriptionPlan === "premium" ? (
              <Badge variant="premium">★ Premium Pro Vendor</Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Verifying Webhook...
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#777174]">Service Limit:</span>
            <span className="font-semibold text-[#292526]">Unlimited Active Services</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#777174]">Badge Benefit:</span>
            <span className="font-semibold text-[#292526]">Verified Premium Vendor Badge</span>
          </div>
        </div>

        <div className="pt-2">
          <Link href="/dashboard">
            <Button size="lg" className="w-full h-12 text-base font-semibold shadow-md">
              Return to Vendor Dashboard <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
