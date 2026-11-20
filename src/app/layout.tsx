import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/Shell";

export const metadata: Metadata = {
  title: "WedPlan — Wedding Planning Platform",
  description: "Discover trusted wedding venues, photography, catering, decoration, makeup, and styling services. Direct bookings and verified vendors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-surface text-ink antialiased">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
