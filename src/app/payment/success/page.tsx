"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<"pending" | "confirmed" | "error">("pending");

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    async function check(attempt: number) {
      try {
        const { confirmed } = await api<{ confirmed: boolean }>(
          "/api/payments/confirmation?session_id=" + encodeURIComponent(sessionId!),
        );
        if (cancelled) return;
        if (confirmed) setStatus("confirmed");
        else if (attempt < 20) timer = setTimeout(() => void check(attempt + 1), 2500);
        else setStatus("error");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void check(1);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <main className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg space-y-6 rounded-3xl border border-[#eee5e1] bg-white p-10 text-center shadow-xl">
        {status === "confirmed" && <CheckCircle2 className="mx-auto text-emerald-600" size={44} />}
        {status === "pending" && <Loader2 className="mx-auto animate-spin text-[#b65b69]" size={36} />}
        <h1 className="font-serif text-3xl font-bold text-[#292526]">
          {status === "confirmed" ? "Premium activated" : status === "pending" ? "Verifying your payment" : "Payment confirmation unavailable"}
        </h1>
        <p role="status" className="text-sm text-[#777174]">
          {status === "confirmed" && "Stripe confirmed your payment. Your Premium plan is active."}
          {status === "pending" && "We are waiting for Stripe to confirm this Checkout session."}
          {status === "error" && "Check your subscription in the dashboard or reload this page to retry."}
        </p>
        <Link href="/dashboard?tab=subscription"><Button>Return to Subscription</Button></Link>
      </div>
    </main>
  );
}
