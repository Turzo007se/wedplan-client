"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [authorizedSession, setAuthorizedSession] = useState<string>();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      const destination = pathname + window.location.search;
      router.replace("/sign-in?redirect=" + encodeURIComponent(destination));
      return;
    }

    let active = true;
    api<{ user: { role: string } }>("/api/me").then(({ user }) => {
      if (!active) return;
      if (user.role === "vendor") setAuthorizedSession(session.session.id);
      else router.replace("/dashboard");
    }).catch(() => {
      if (active) router.replace("/dashboard");
    });

    return () => { active = false; };
  }, [isPending, pathname, router, session]);

  if (isPending || !session || authorizedSession !== session.session.id) {
    return <main className="container mx-auto px-4 py-20" role="status">Checking access?</main>;
  }

  return children;
}
