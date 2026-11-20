"use client";
import Link from "next/link";
import { XCircle, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-20 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-lg w-full rounded-3xl border border-line bg-surface p-10 text-center shadow-xl space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-warning-surface text-warning ring-8 ring-warning-surface/50">
          <XCircle size={44} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted">
            <Shield size={14} /> Checkout Cancelled
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink">
            No Charges Were Made
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Your Stripe checkout session was cancelled. Your current vendor subscription plan remains unchanged, and you can upgrade whenever you are ready.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/dashboard?tab=subscription">
            <Button size="lg" className="w-full h-12 text-base font-semibold shadow-md">
              <ArrowLeft size={16} /> Return to Subscription Page
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
