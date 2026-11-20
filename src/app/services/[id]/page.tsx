"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, CalendarDays, ArrowLeft, Heart, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { Toast } from "@/components/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [service, setService] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState("");
  const [eventDate, setDate] = useState("");
  const [place, setPlace] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"success" | "error">("success");
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState(0);

  // 1. Verify Authentication - Redirect unauthenticated users to Sign In
  useEffect(() => {
    authClient.getSession()
      .then((session: any) => {
        if (!session?.data?.user) {
          router.replace(`/sign-in?redirect=/services/${id}`);
        } else {
          setUser(session.data.user);
          setAuthChecking(false);
        }
      })
      .catch(() => {
        router.replace(`/sign-in?redirect=/services/${id}`);
      });
  }, [id, router]);

  // 2. Fetch Service Details
  useEffect(() => {
    if (!id) return;
    api<{ service: any }>(`/api/services/${id}`)
      .then((d) => setService(d.service))
      .catch((e) => setError(e.message || "Service not found or currently unavailable."));
  }, [id]);

  // 3. Handle Booking Submission
  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push(`/sign-in?redirect=/services/${id}`);
      return;
    }
    if (user.role === "vendor") {
      setNoticeType("error");
      setNotice("Vendors cannot submit booking requests. Please use a Customer account.");
      return;
    }
    if (user.role === "admin") {
      setNoticeType("error");
      setNotice("Admins cannot submit customer booking requests.");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          serviceId: id,
          eventDate,
          eventLocation: place,
          message,
        }),
      });
      setNoticeType("success");
      setNotice("Booking request submitted successfully! The vendor will review it from their dashboard.");
      setDate("");
      setPlace("");
      setMessage("");
    } catch (e: any) {
      setNoticeType("error");
      setNotice(e.message || "Failed to submit booking request.");
    } finally {
      setBusy(false);
    }
  }

  if (authChecking) {
    return (
      <main className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-accent border-t-transparent" />
        <p className="mt-4 text-sm text-muted">Checking authentication...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-20 min-h-[60vh]">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent mb-6">
          <ArrowLeft size={16} /> Back to services
        </Link>
        <div className="max-w-lg rounded-2xl border border-danger-line bg-danger-surface/50 p-8 text-center mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h1 className="font-serif text-2xl font-bold text-ink">Unable to Load Service</h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <Button variant="outline" className="mt-6" onClick={() => router.push("/services")}>
            Browse Other Services
          </Button>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-accent border-t-transparent" />
        <p className="mt-4 text-sm text-muted">Loading service details...</p>
      </main>
    );
  }

  const images = service.images && service.images.length > 0 ? service.images : ["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"];

  return (
    <main className="container mx-auto px-4 sm:px-6 py-10 min-h-[75vh]">
      <Link href="/services" className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors mb-6">
        <ArrowLeft size={16} /> All Services
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left 2 Cols: Service Gallery, Details, Vendor Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo */}
          <div className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-cream shadow-md">
            <img
              src={images[photo]}
              alt={service.serviceName}
              className="h-full w-full object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-surface/95 backdrop-blur-md px-3 py-1 font-semibold text-xs shadow-sm">
                {service.category}
              </Badge>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((url: string, index: number) => (
                <button
                  type="button"
                  key={url + index}
                  onClick={() => setPhoto(index)}
                  className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                    photo === index ? "border-accent ring-2 ring-accent/30" : "border-line opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Heading & Meta */}
          <div className="border-b border-line pb-6">
            <div className="text-xs font-bold tracking-widest uppercase text-accent mb-1">
              {service.category}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              {service.serviceName}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted">
              <MapPin size={16} className="text-accent" />
              <span>{service.location}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold text-ink">About this Service</h2>
            <p className="text-base leading-relaxed text-secondary-ink whitespace-pre-line">
              {service.description}
            </p>
          </div>

          {/* Vendor Information Box */}
          <div className="rounded-xl border border-line bg-cream p-6 space-y-3">
            <h3 className="font-serif text-lg font-semibold text-ink">About the Wedding Vendor</h3>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white font-serif font-bold text-lg">
                {(service.vendorName || "V")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-ink">{service.vendorName || "Verified Wedding Vendor"}</p>
                <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={14} className="text-success" /> Platform Verified Wedding Professional
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Booking Request Form Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 rounded-2xl border border-line bg-surface p-7 shadow-lg space-y-6">
            {/* Price Header */}
            <div>
              <span className="text-xs text-muted uppercase tracking-wider font-semibold">Pricing Starts At</span>
              <div className="font-serif text-3xl font-bold text-ink mt-1">
                ${Number(service.price).toLocaleString()}
              </div>
            </div>

            <div className="border-t border-line" />

            <h2 className="font-serif text-xl font-semibold text-ink">
              Request Booking Date
            </h2>

            {/* Role-specific messages or Booking Form */}
            {user?.role === "vendor" ? (
              <div className="rounded-xl bg-warning-surface p-4 border border-warning-line text-xs text-warning leading-relaxed">
                You are currently signed in with a <b>Vendor</b> account. Vendors cannot book services. To submit a booking request, please sign in with a Customer account.
              </div>
            ) : user?.role === "admin" ? (
              <div className="rounded-xl bg-purple-50 p-4 border border-purple-200 text-xs text-purple-800 leading-relaxed">
                You are currently signed in as an <b>Admin</b>. Booking requests are reserved for customer accounts.
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={eventDate}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-outline bg-surface px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Event Location / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radisson Blu / Gulshan Club, Dhaka"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="w-full rounded-lg border border-outline bg-surface px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell the vendor about guest count, wedding theme, or timing..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-lg border border-outline bg-surface p-3 text-sm focus:border-accent focus:outline-none resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 text-base font-semibold"
                >
                  <CalendarDays size={16} />
                  {busy ? "Submitting Request..." : "Submit Booking Request"}
                </Button>

                <p className="text-center text-[11px] text-muted">
                  No upfront charge. The vendor will confirm their availability.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <Toast message={notice} type={noticeType} onClose={() => setNotice("")} />
    </main>
  );
}
