"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, uploadImage } from "@/lib/api";
import { Toast } from "@/components/Shell";
import { authClient, cacheApiToken, clearApiToken, getApiToken } from "@/lib/auth-client";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  Users,
  Settings,
  Plus,
  Check,
  X,
  Trash2,
  LogOut,
  ImagePlus,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Shield,
  Eye,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";

type User = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "vendor" | "admin";
  image?: string;
  businessName?: string;
  subscriptionPlan?: "free" | "premium";
  isBlocked?: boolean;
};

const CATEGORIES = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";

  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState(initialTab);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"success" | "error">("success");
  const [busy, setBusy] = useState(false);

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);

  // Add/Edit service form state
  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] = useState(CATEGORIES[0]);
  const [serviceDesc, setServiceDesc] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceLocation, setServiceLocation] = useState("");
  const [serviceImages, setServiceImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Admin filter states
  const [userQuery, setUserQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("all");
  const [serviceQuery, setServiceQuery] = useState("");

  // 1. Initial Authentication & User Verification
  async function loadUser() {
    try {
      const session: any = await authClient.getSession();
      if (!session?.data?.user) {
        router.replace("/sign-in");
        return;
      }
      await cacheApiToken();
      const meRes = await api<{ user: User }>("/api/me");
      if (meRes.user.isBlocked) {
        setNoticeType("error");
        setNotice("Your account has been suspended by an administrator.");
        await authClient.signOut();
        router.replace("/sign-in");
        return;
      }
      setUser(meRes.user);
      return meRes.user;
    } catch {
      router.replace("/sign-in");
      return null;
    }
  }

  // 2. Load tab-specific data based on user role
  async function loadTabData(currentUser?: User, currentTab?: string) {
    const u = currentUser || user;
    const t = currentTab || tab;
    if (!u) return;

    setLoading(true);
    try {
      if (u.role === "customer") {
        if (t === "overview") {
          const [stats, bookings] = await Promise.all([
            api<any>("/api/customer/stats"),
            api<{ bookings: any[] }>("/api/bookings/mine"),
          ]);
          setData({ ...(stats || {}), bookings: (bookings as any).bookings || [] });
        } else if (t === "bookings") {
          const res = await api<{ bookings: any[] }>("/api/bookings/mine");
          setData(res);
        }
      } else if (u.role === "vendor") {
        if (t === "overview") {
          const res = await api<any>("/api/vendor/stats");
          setData(res);
        } else if (t === "services") {
          const res = await api<{ services: any[] }>("/api/vendor/services");
          setData(res);
        } else if (t === "bookings") {
          const res = await api<{ bookings: any[] }>("/api/vendor/bookings");
          setData(res);
        }
      } else if (u.role === "admin") {
        if (t === "overview") {
          const res = await api<any>("/api/admin/stats");
          setData(res);
        } else if (t === "users") {
          const q = new URLSearchParams();
          if (userQuery) q.set("q", userQuery);
          if (userRoleFilter) q.set("role", userRoleFilter);
          const res = await api<{ users: any[] }>(`/api/admin/users?${q.toString()}`);
          setData(res);
        } else if (t === "services") {
          const q = new URLSearchParams();
          if (serviceStatusFilter !== "all") q.set("status", serviceStatusFilter);
          if (serviceQuery) q.set("q", serviceQuery);
          const res = await api<{ services: any[] }>(`/api/admin/services?${q.toString()}`);
          setData(res);
        } else if (t === "transactions") {
          const res = await api<{ transactions: any[] }>("/api/admin/transactions");
          setData(res);
        }
      }
    } catch (e: any) {
      setNoticeType("error");
      setNotice(e.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser().then((u) => {
      if (u) loadTabData(u, tab);
    });
  }, [tab]);

  // Debounced admin searches
  useEffect(() => {
    if (user?.role === "admin" && tab === "users") {
      const timer = setTimeout(() => loadTabData(user, "users"), 300);
      return () => clearTimeout(timer);
    }
  }, [userQuery, userRoleFilter]);

  useEffect(() => {
    if (user?.role === "admin" && tab === "services") {
      const timer = setTimeout(() => loadTabData(user, "services"), 300);
      return () => clearTimeout(timer);
    }
  }, [serviceQuery, serviceStatusFilter]);

  // Reusable action runner
  async function runAction(fn: () => Promise<any>, successMsg: string) {
    setBusy(true);
    setNotice("");
    try {
      await fn();
      setNoticeType("success");
      setNotice(successMsg);
      await loadTabData();
    } catch (e: any) {
      setNoticeType("error");
      setNotice(e.message || "Operation failed.");
    } finally {
      setBusy(false);
    }
  }

  // Handle Image Upload for Service via ImgBB
  async function handleImageUpload(file?: File) {
    if (!file) return;
    if (serviceImages.length >= 6) {
      setNoticeType("error");
      setNotice("You can upload a maximum of 6 images per service.");
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setServiceImages((prev) => [...prev, url]);
      setNoticeType("success");
      setNotice("Image uploaded successfully!");
    } catch (err: any) {
      setNoticeType("error");
      setNotice(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  // Handle Add Service Submission
  async function handleCreateService(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceName.trim() || !servicePrice || !serviceLocation.trim() || !serviceDesc.trim()) {
      setNoticeType("error");
      setNotice("Please fill in all required service details.");
      return;
    }
    if (serviceImages.length === 0) {
      setNoticeType("error");
      setNotice("Please upload at least one service photograph.");
      return;
    }

    await runAction(async () => {
      await api("/api/services", {
        method: "POST",
        body: JSON.stringify({
          serviceName: serviceName.trim(),
          category: serviceCategory,
          description: serviceDesc.trim(),
          price: Number(servicePrice),
          location: serviceLocation.trim(),
          images: serviceImages,
        }),
      });
      // Reset form
      setServiceName("");
      setServicePrice("");
      setServiceLocation("");
      setServiceDesc("");
      setServiceImages([]);
      setTab("services");
    }, "Service submitted successfully! It is now pending administrator review.");
  }

  // Handle Update Service Submission
  async function handleUpdateService(e: React.FormEvent) {
    e.preventDefault();
    if (!editingService) return;

    await runAction(async () => {
      await api(`/api/services/${editingService._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          serviceName: editingService.serviceName,
          category: editingService.category,
          price: Number(editingService.price),
          location: editingService.location,
          description: editingService.description,
          images: editingService.images,
        }),
      });
      setEditingService(null);
    }, "Service updated and resubmitted for admin review.");
  }

  // Role Navigation Config
  const menuConfig: Record<string, { id: string; label: string; icon: any }[]> = {
    customer: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "bookings", label: "My Bookings", icon: CalendarDays },
      { id: "profile", label: "Profile Settings", icon: Settings },
    ],
    vendor: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "services", label: "My Services", icon: BriefcaseBusiness },
      { id: "add", label: "Add Service", icon: Plus },
      { id: "bookings", label: "Booking Requests", icon: CalendarDays },
      { id: "subscription", label: "Subscription", icon: CreditCard },
      { id: "profile", label: "Profile Settings", icon: Settings },
    ],
    admin: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "users", label: "Manage Users", icon: Users },
      { id: "services", label: "Manage Services", icon: BriefcaseBusiness },
      { id: "transactions", label: "Transactions", icon: CreditCard },
      { id: "profile", label: "Profile Settings", icon: Settings },
    ],
  };

  if (!user) {
    return (
      <main className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-accent border-t-transparent" />
        <p className="mt-4 text-sm text-muted">Loading your dashboard...</p>
      </main>
    );
  }

  const currentNav = menuConfig[user.role] || [];

  return (
    <main className="container mx-auto px-4 sm:px-6 py-10 min-h-[80vh]">
      {/* Top Banner */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
            <Shield size={14} /> {user.role} Dashboard
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-1">
            Welcome, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Manage your {user.role === "vendor" ? "wedding services & customer inquiries" : user.role === "admin" ? "platform users, services & transactions" : "wedding booking requests & personal plans"}.
          </p>
        </div>

        {user.role === "vendor" && (
          <div className="flex items-center gap-2">
            <Badge variant={user.subscriptionPlan === "premium" ? "premium" : "secondary"}>
              {user.subscriptionPlan === "premium" ? "★ Premium Vendor" : "Free Plan (3 Services Max)"}
            </Badge>
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1 rounded-2xl border border-line bg-surface p-3 shadow-sm space-y-1 sticky top-28">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted">
            Navigation
          </div>
          {currentNav.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer text-left ${
                  active
                    ? "bg-tint text-accent-strong font-semibold"
                    : "text-secondary-ink hover:bg-cream hover:text-ink"
                }`}
              >
                <Icon size={18} className={active ? "text-accent" : "text-muted"} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="my-2 border-t border-line" />

          <button
            onClick={async () => {
              await authClient.signOut();
              clearApiToken();
              window.dispatchEvent(new Event("auth-changed"));
              router.push("/");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-danger hover:bg-danger-surface transition-colors cursor-pointer text-left"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* Content Area */}
        <section className="lg:col-span-3 min-w-0">
          {loading && !Object.keys(data).length ? (
            <div className="py-20 text-center">
              <Loader2 size={32} className="animate-spin text-accent mx-auto mb-2" />
              <p className="text-sm text-muted">Refreshing dashboard content...</p>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* CUSTOMER VIEWS                                           */}
              {/* ======================================================== */}
              {user.role === "customer" && (
                <>
                  {/* Customer Overview */}
                  {tab === "overview" && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-ink">Customer Overview</h2>
                        <p className="text-xs text-muted mt-0.5">Summary of your wedding booking requests</p>
                      </div>

                      {/* 4 Required Stats Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider">Total Requests</CardDescription>
                            <CardTitle className="text-3xl text-ink">{data.totalBookings ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider text-warning">Pending</CardDescription>
                            <CardTitle className="text-3xl text-warning">{data.pendingBookings ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider text-success">Accepted</CardDescription>
                            <CardTitle className="text-3xl text-success">{data.acceptedBookings ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider text-danger">Rejected</CardDescription>
                            <CardTitle className="text-3xl text-danger">{data.rejectedBookings ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                      </div>

                      {/* Recent Bookings preview */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-xl font-bold text-ink">Recent Booking Requests</h3>
                          <button
                            onClick={() => setTab("bookings")}
                            className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                          >
                            View all ({data.bookings?.length || 0})
                          </button>
                        </div>

                        {data.bookings && data.bookings.length > 0 ? (
                          <div className="grid gap-3">
                            {data.bookings.slice(0, 3).map((b: any) => (
                              <div
                                key={b._id}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4 hover:border-accent transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <img
                                    src={b.service?.images?.[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80"}
                                    alt="Service"
                                    className="h-14 w-14 rounded-lg object-cover"
                                  />
                                  <div>
                                    <h4 className="font-semibold text-sm text-ink">{b.service?.serviceName || "Wedding Service"}</h4>
                                    <p className="text-xs text-muted">
                                      Vendor: {b.vendor?.name || "Professional"} • Event: {new Date(b.eventDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant={
                                      b.status === "accepted" ? "success" : b.status === "pending" ? "warning" : "destructive"
                                    }
                                  >
                                    {b.status.toUpperCase()}
                                  </Badge>
                                  <Button size="sm" variant="outline" onClick={() => setSelectedBooking(b)}>
                                    Details
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-outline bg-cream p-8 text-center text-sm text-muted">
                            You haven't submitted any booking requests yet. <button onClick={() => router.push("/services")} className="text-accent underline font-semibold">Browse services</button> to get started.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Customer My Bookings */}
                  {tab === "bookings" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-ink">My Bookings</h2>
                        <p className="text-xs text-muted mt-0.5">Track and manage all your wedding service booking requests</p>
                      </div>

                      {data.bookings && data.bookings.length > 0 ? (
                        <div className="grid gap-4">
                          {data.bookings.map((b: any) => (
                            <div
                              key={b._id}
                              className="rounded-xl border border-line bg-surface p-5 shadow-sm space-y-4"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
                                <div className="flex items-center gap-3.5">
                                  <img
                                    src={b.service?.images?.[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80"}
                                    alt="Service"
                                    className="h-14 w-14 rounded-lg object-cover shrink-0"
                                  />
                                  <div>
                                    <h3 className="font-serif font-bold text-base text-ink">{b.service?.serviceName || "Wedding Service"}</h3>
                                    <p className="text-xs text-muted">
                                      Vendor: <span className="font-semibold text-ink">{b.vendor?.name || "Wedding Vendor"}</span> ({b.vendor?.email})
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <Badge
                                    variant={
                                      b.status === "accepted"
                                        ? "success"
                                        : b.status === "pending"
                                        ? "warning"
                                        : "destructive"
                                    }
                                  >
                                    {b.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-secondary-ink">
                                <div>
                                  <span className="text-muted">Event Date:</span>{" "}
                                  <b>{new Date(b.eventDate).toLocaleDateString()}</b>
                                </div>
                                <div>
                                  <span className="text-muted">Location:</span>{" "}
                                  <b>{b.eventLocation}</b>
                                </div>
                                <div>
                                  <span className="text-muted">Requested On:</span>{" "}
                                  <b>{new Date(b.createdAt).toLocaleDateString()}</b>
                                </div>
                              </div>

                              {b.message && (
                                <div className="rounded-lg bg-cream p-3 text-xs text-secondary-ink">
                                  <span className="font-semibold text-ink">Your Message:</span> "{b.message}"
                                </div>
                              )}

                              <div className="flex items-center justify-end gap-3 pt-2">
                                <Button size="sm" variant="outline" onClick={() => setSelectedBooking(b)}>
                                  <Eye size={14} /> View Details
                                </Button>
                                {b.status === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={busy}
                                    onClick={() =>
                                      runAction(
                                        () => api(`/api/bookings/${b._id}/cancel`, { method: "PATCH" }),
                                        "Booking request cancelled."
                                      )
                                    }
                                  >
                                    <X size={14} /> Cancel Request
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-outline bg-cream p-12 text-center text-sm text-muted">
                          No booking requests submitted yet.
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ======================================================== */}
              {/* VENDOR VIEWS                                             */}
              {/* ======================================================== */}
              {user.role === "vendor" && (
                <>
                  {/* Vendor Overview */}
                  {tab === "overview" && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-ink">Vendor Overview</h2>
                        <p className="text-xs text-muted mt-0.5">Summary of your published services & client inquiries</p>
                      </div>

                      {/* 5 Required Stats Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider">Total Services</CardDescription>
                            <CardTitle className="text-3xl text-ink">{data.totalServices ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider text-success">Active Services</CardDescription>
                            <CardTitle className="text-3xl text-success">{data.activeServices ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider text-warning">Pending Requests</CardDescription>
                            <CardTitle className="text-3xl text-warning">{data.pendingBookings ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider text-info">Accepted Bookings</CardDescription>
                            <CardTitle className="text-3xl text-info">{data.acceptedBookings ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider text-accent">Current Plan</CardDescription>
                            <CardTitle className="text-xl capitalize text-accent">{user.subscriptionPlan || "free"}</CardTitle>
                          </CardHeader>
                        </Card>
                      </div>

                      {/* Quick Action Banner */}
                      <div className="rounded-2xl border border-line bg-cream p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-ink">Publish a New Wedding Service</h3>
                          <p className="text-xs text-muted mt-1">
                            {user.subscriptionPlan === "premium"
                              ? "You have unlimited active listings with your Premium subscription."
                              : `Free Plan: You can publish up to 3 active services (${data.activeServices || 0}/3 used).`}
                          </p>
                        </div>
                        <Button onClick={() => setTab("add")} className="whitespace-nowrap">
                          <Plus size={16} /> Add New Service
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Vendor My Services */}
                  {tab === "services" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="font-serif text-2xl font-bold text-ink">My Services</h2>
                          <p className="text-xs text-muted mt-0.5">Manage your service listings, availability, and approval statuses</p>
                        </div>
                        <Button size="sm" onClick={() => setTab("add")}>
                          <Plus size={14} /> Add Service
                        </Button>
                      </div>

                      {data.services && data.services.length > 0 ? (
                        <div className="grid gap-4">
                          {data.services.map((s: any) => (
                            <div
                              key={s._id}
                              className="rounded-xl border border-line bg-surface p-5 shadow-sm space-y-4"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <img
                                    src={s.images?.[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80"}
                                    alt="Service"
                                    className="h-16 w-20 rounded-lg object-cover shrink-0"
                                  />
                                  <div>
                                    <h3 className="font-serif font-bold text-base text-ink">{s.serviceName}</h3>
                                    <p className="text-xs text-muted">{s.category} • Starting at ${Number(s.price).toLocaleString()} • {s.location}</p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Status Badge */}
                                  <Badge
                                    variant={
                                      s.status === "approved"
                                        ? "success"
                                        : s.status === "pending"
                                        ? "warning"
                                        : "destructive"
                                    }
                                  >
                                    Approval: {s.status.toUpperCase()}
                                  </Badge>

                                  {/* Availability Badge */}
                                  <Badge variant={s.availability === "active" ? "secondary" : "outline"}>
                                    {s.availability === "active" ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>

                              <p className="text-xs text-secondary-ink line-clamp-2">{s.description}</p>

                              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-3">
                                {/* Toggle Availability */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={busy || s.status !== "approved"}
                                  onClick={() =>
                                    runAction(
                                      () =>
                                        api(`/api/services/${s._id}`, {
                                          method: "PATCH",
                                          body: JSON.stringify({
                                            availability: s.availability === "active" ? "inactive" : "active",
                                          }),
                                        }),
                                      `Service set to ${s.availability === "active" ? "inactive" : "active"}.`
                                    )
                                  }
                                >
                                  {s.availability === "active" ? (
                                    <>
                                      <ToggleRight size={16} className="text-success" /> Set Inactive
                                    </>
                                  ) : (
                                    <>
                                      <ToggleLeft size={16} /> Set Active
                                    </>
                                  )}
                                </Button>

                                {/* Edit Button */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingService({ ...s })}
                                >
                                  Update Service
                                </Button>

                                {/* Delete Button */}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={busy}
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this service?")) {
                                      runAction(
                                        () => api(`/api/services/${s._id}`, { method: "DELETE" }),
                                        "Service deleted successfully."
                                      );
                                    }
                                  }}
                                >
                                  <Trash2 size={14} /> Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-outline bg-cream p-12 text-center text-sm text-muted">
                          You have not created any services yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vendor Add Service */}
                  {tab === "add" && (
                    <div className="max-w-2xl mx-auto rounded-2xl border border-line bg-surface p-8 shadow-sm space-y-6">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-ink">Add New Wedding Service</h2>
                        <p className="text-xs text-muted mt-0.5">
                          New services are submitted with <b>Pending</b> status until reviewed and approved by an administrator.
                        </p>
                      </div>

                      <form onSubmit={handleCreateService} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-ink mb-1">Service Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Cinematic Wedding Highlights & 4K Drone"
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
                            className="w-full rounded-lg border border-outline px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-ink mb-1">Service Category *</label>
                            <select
                              value={serviceCategory}
                              onChange={(e) => setServiceCategory(e.target.value)}
                              className="w-full rounded-lg border border-outline bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                            >
                              {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-ink mb-1">Base Price ($) *</label>
                            <input
                              type="number"
                              required
                              min={0}
                              placeholder="e.g. 750"
                              value={servicePrice}
                              onChange={(e) => setServicePrice(e.target.value)}
                              className="w-full rounded-lg border border-outline px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-ink mb-1">Location / Coverage Area *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Gulshan & Banani, Dhaka"
                            value={serviceLocation}
                            onChange={(e) => setServiceLocation(e.target.value)}
                            className="w-full rounded-lg border border-outline px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-ink mb-1">Service Description *</label>
                          <textarea
                            rows={4}
                            required
                            placeholder="Provide details about packages, equipment, team size, deliverables, etc."
                            value={serviceDesc}
                            onChange={(e) => setServiceDesc(e.target.value)}
                            className="w-full rounded-lg border border-outline p-3 text-sm text-ink focus:border-accent focus:outline-none resize-none"
                          />
                        </div>

                        {/* ImgBB Image Upload */}
                        <div>
                          <label className="block text-xs font-semibold text-ink mb-1">
                            Service Photographs * (Uploaded via ImgBB)
                          </label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleImageUpload(e.target.files?.[0])}
                            className="text-xs text-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-raised file:text-accent-strong hover:file:bg-raised cursor-pointer"
                          />
                          {uploadingImage && (
                            <p className="text-xs text-accent flex items-center gap-1 mt-1">
                              <Loader2 size={12} className="animate-spin" /> Uploading image to ImgBB...
                            </p>
                          )}

                          {serviceImages.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {serviceImages.map((url, i) => (
                                <div key={url + i} className="relative h-16 w-20 rounded-md overflow-hidden border border-line">
                                  <img src={url} alt="Uploaded" className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setServiceImages((prev) => prev.filter((_, idx) => idx !== i))}
                                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                          <Button type="submit" disabled={busy || uploadingImage} className="flex-1 h-11">
                            {busy ? "Submitting..." : "Submit for Admin Review"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setTab("services")} className="h-11">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Vendor Booking Requests */}
                  {tab === "bookings" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-ink">Customer Booking Requests</h2>
                        <p className="text-xs text-muted mt-0.5">Review and respond to client inquiries for your wedding services</p>
                      </div>

                      {data.bookings && data.bookings.length > 0 ? (
                        <div className="grid gap-4">
                          {data.bookings.map((b: any) => (
                            <div
                              key={b._id}
                              className="rounded-xl border border-line bg-surface p-5 shadow-sm space-y-4"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
                                <div>
                                  <h3 className="font-serif font-bold text-base text-ink">{b.service?.serviceName || "Wedding Service"}</h3>
                                  <p className="text-xs text-muted">
                                    Customer: <span className="font-semibold text-ink">{b.customer?.name || "Customer"}</span> ({b.customer?.email})
                                  </p>
                                </div>
                                <div>
                                  <Badge
                                    variant={
                                      b.status === "accepted"
                                        ? "success"
                                        : b.status === "pending"
                                        ? "warning"
                                        : "destructive"
                                    }
                                  >
                                    {b.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-secondary-ink">
                                <div>
                                  <span className="text-muted">Requested Event Date:</span>{" "}
                                  <b>{new Date(b.eventDate).toLocaleDateString()}</b>
                                </div>
                                <div>
                                  <span className="text-muted">Location:</span> <b>{b.eventLocation}</b>
                                </div>
                                <div>
                                  <span className="text-muted">Requested On:</span>{" "}
                                  <b>{new Date(b.createdAt).toLocaleDateString()}</b>
                                </div>
                              </div>

                              {b.message && (
                                <div className="rounded-lg bg-cream p-3 text-xs text-secondary-ink">
                                  <span className="font-semibold text-ink">Customer Note:</span> "{b.message}"
                                </div>
                              )}

                              {b.status === "pending" ? (
                                <div className="flex items-center justify-end gap-3 pt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={busy}
                                    onClick={() =>
                                      runAction(
                                        () =>
                                          api(`/api/bookings/${b._id}/status`, {
                                            method: "PATCH",
                                            body: JSON.stringify({ status: "rejected" }),
                                          }),
                                        "Booking request rejected."
                                      )
                                    }
                                  >
                                    <X size={14} className="text-danger" /> Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    disabled={busy}
                                    onClick={() =>
                                      runAction(
                                        () =>
                                          api(`/api/bookings/${b._id}/status`, {
                                            method: "PATCH",
                                            body: JSON.stringify({ status: "accepted" }),
                                          }),
                                        "Booking request accepted!"
                                      )
                                    }
                                  >
                                    <Check size={14} /> Accept Request
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-right text-xs text-muted italic">
                                  Request already processed ({b.status}).
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-outline bg-cream p-12 text-center text-sm text-muted">
                          No booking requests received yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vendor Subscription */}
                  {tab === "subscription" && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-ink">Vendor Subscription Plans</h2>
                        <p className="text-xs text-muted mt-0.5">Choose the plan that fits your wedding business scale</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Free Plan */}
                        <div className="rounded-2xl border border-line bg-surface p-7 shadow-sm space-y-5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted">Free Tier</span>
                            {user.subscriptionPlan !== "premium" && (
                              <Badge variant="secondary">Current Plan</Badge>
                            )}
                          </div>
                          <div>
                            <h3 className="font-serif text-2xl font-bold text-ink">Starter Vendor</h3>
                            <p className="font-serif text-3xl font-bold text-ink mt-2">$0 <span className="text-sm font-sans font-normal text-muted">/ forever</span></p>
                          </div>
                          <ul className="space-y-2.5 text-xs text-secondary-ink">
                            <li className="flex items-center gap-2"><Check size={14} className="text-success" /> Maximum 3 Active Services</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-success" /> Basic Vendor Dashboard</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-success" /> Booking Request Management</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-success" /> Public Profile & Inquiries</li>
                          </ul>
                        </div>

                        {/* Premium Plan */}
                        <div className="rounded-2xl border-2 border-accent bg-surface p-7 shadow-lg space-y-5 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-accent">Recommended</span>
                            {user.subscriptionPlan === "premium" && (
                              <Badge variant="premium">Active Plan</Badge>
                            )}
                          </div>
                          <div>
                            <h3 className="font-serif text-2xl font-bold text-ink">Premium Pro Vendor</h3>
                            <p className="font-serif text-3xl font-bold text-ink mt-2">$29 <span className="text-sm font-sans font-normal text-muted">/ month</span></p>
                          </div>
                          <ul className="space-y-2.5 text-xs text-secondary-ink">
                            <li className="flex items-center gap-2"><Check size={14} className="text-accent" /> <b>Unlimited Active Services</b></li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-accent" /> <b>Premium Verified Vendor Badge</b></li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-accent" /> Priority Featured Placement</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-accent" /> All Free Plan Features Included</li>
                          </ul>

                          {user.subscriptionPlan === "premium" ? (
                            <div className="space-y-3 pt-2">
                              <div className="rounded-lg bg-success-surface border border-success-line p-3 text-xs text-success font-medium">
                                ✓ Your vendor account is currently Premium.
                              </div>
                              <Button
                                variant="outline"
                                className="w-full text-xs"
                                disabled={busy}
                                onClick={() =>
                                  runAction(
                                    () => api("/api/payments/cancel", { method: "POST", body: "{}" }),
                                    "Renewal cancelled. Premium stays active until period end."
                                  )
                                }
                              >
                                Cancel Renewal
                              </Button>
                            </div>
                          ) : (
                            <Button
                              className="w-full h-11 text-sm font-semibold"
                              disabled={busy}
                              onClick={() =>
                                runAction(async () => {
                                  const res = await api<{ url: string }>("/api/payments/checkout", {
                                    method: "POST",
                                    body: "{}",
                                  });
                                  if (res?.url) window.location.href = res.url;
                                }, "Redirecting to secure Stripe Checkout...")
                              }
                            >
                              <Sparkles size={16} /> Upgrade to Premium
                            </Button>
                          )}
                          <p className="text-[11px] text-center text-muted">
                            Secured by Stripe Checkout. Upgraded via verified webhooks.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ======================================================== */}
              {/* ADMIN VIEWS                                              */}
              {/* ======================================================== */}
              {user.role === "admin" && (
                <>
                  {/* Admin Overview */}
                  {tab === "overview" && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-ink">Admin Overview</h2>
                        <p className="text-xs text-muted mt-0.5">Platform metrics and system health monitoring</p>
                      </div>

                      {/* 6 Required Stats Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider">Total Users</CardDescription>
                            <CardTitle className="text-2xl text-ink">{data.totalUsers ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider text-info">Vendors</CardDescription>
                            <CardTitle className="text-2xl text-info">{data.vendors ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider text-purple-600">Customers</CardDescription>
                            <CardTitle className="text-2xl text-purple-600">{data.customers ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider text-success">Total Services</CardDescription>
                            <CardTitle className="text-2xl text-success">{data.totalServices ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider text-warning">Pending Review</CardDescription>
                            <CardTitle className="text-2xl text-warning">{data.pendingServices ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider text-accent">Transactions</CardDescription>
                            <CardTitle className="text-2xl text-accent">{data.totalTransactions ?? 0}</CardTitle>
                          </CardHeader>
                        </Card>
                      </div>

                      {/* Admin Quick Action Shortcuts */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div
                          onClick={() => setTab("services")}
                          className="rounded-xl border border-line bg-surface p-5 hover:border-accent transition-all cursor-pointer space-y-2"
                        >
                          <h4 className="font-serif font-bold text-base text-ink">Review Pending Services</h4>
                          <p className="text-xs text-muted">Approve or reject vendor submissions across wedding categories.</p>
                          <span className="text-xs font-semibold text-accent inline-flex items-center gap-1">Manage services →</span>
                        </div>

                        <div
                          onClick={() => setTab("users")}
                          className="rounded-xl border border-line bg-surface p-5 hover:border-accent transition-all cursor-pointer space-y-2"
                        >
                          <h4 className="font-serif font-bold text-base text-ink">Manage Platform Users</h4>
                          <p className="text-xs text-muted">Inspect user details, filter by role, or block/unblock accounts.</p>
                          <span className="text-xs font-semibold text-accent inline-flex items-center gap-1">Manage users →</span>
                        </div>

                        <div
                          onClick={() => setTab("transactions")}
                          className="rounded-xl border border-line bg-surface p-5 hover:border-accent transition-all cursor-pointer space-y-2"
                        >
                          <h4 className="font-serif font-bold text-base text-ink">View Transactions</h4>
                          <p className="text-xs text-muted">Audit Stripe webhook payments, subscriptions, and vendor plans.</p>
                          <span className="text-xs font-semibold text-accent inline-flex items-center gap-1">View ledger →</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Manage Users */}
                  {tab === "users" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-ink">Manage Users</h2>
                        <p className="text-xs text-muted mt-0.5">View registered accounts, search, filter, and manage access</p>
                      </div>

                      {/* Search & Role Filter */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search size={15} className="absolute left-3 top-3 text-muted" />
                          <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            className="w-full rounded-xl border border-outline pl-9 pr-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                          />
                        </div>
                        <select
                          value={userRoleFilter}
                          onChange={(e) => setUserRoleFilter(e.target.value)}
                          className="rounded-xl border border-outline bg-surface px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                        >
                          <option value="">All Roles</option>
                          <option value="vendor">Vendors</option>
                          <option value="customer">Customers</option>
                          <option value="admin">Administrators</option>
                        </select>
                      </div>

                      {/* User List */}
                      {data.users && data.users.length > 0 ? (
                        <div className="grid gap-3">
                          {data.users.map((u: any) => (
                            <div
                              key={u._id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4 shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                {u.image ? (
                                  <img src={u.image} alt={u.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white font-bold text-sm">
                                    {(u.name || "U")[0].toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-sm text-ink">{u.name}</h4>
                                    {u.isBlocked && (
                                      <Badge variant="destructive">Blocked</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted">
                                    {u.email} • Role: <span className="capitalize font-medium text-ink">{u.role}</span>
                                    {u.subscriptionPlan === "premium" && " • Premium Pro"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      const res = await api<{ user: any; stats: any }>(`/api/admin/users/${u._id}`);
                                      setSelectedUser(res);
                                    } catch (e: any) {
                                      setNoticeType("error");
                                      setNotice(e.message);
                                    }
                                  }}
                                >
                                  View Details
                                </Button>

                                {u.role !== "admin" && (
                                  <Button
                                    size="sm"
                                    variant={u.isBlocked ? "outline" : "destructive"}
                                    disabled={busy}
                                    onClick={() =>
                                      runAction(
                                        () =>
                                          api(`/api/admin/users/${u._id}/block`, {
                                            method: "PATCH",
                                            body: JSON.stringify({ blocked: !u.isBlocked }),
                                          }),
                                        u.isBlocked ? "User account unblocked." : "User account blocked."
                                      )
                                    }
                                  >
                                    {u.isBlocked ? "Unblock" : "Block User"}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-outline bg-cream p-12 text-center text-sm text-muted">
                          No users found matching current filters.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admin Manage Services */}
                  {tab === "services" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-ink">Manage Services</h2>
                        <p className="text-xs text-muted mt-0.5">Review submissions, approve or reject listings, and moderate content</p>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search size={15} className="absolute left-3 top-3 text-muted" />
                          <input
                            type="text"
                            placeholder="Search by service name..."
                            value={serviceQuery}
                            onChange={(e) => setServiceQuery(e.target.value)}
                            className="w-full rounded-xl border border-outline pl-9 pr-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                          />
                        </div>
                        <select
                          value={serviceStatusFilter}
                          onChange={(e) => setServiceStatusFilter(e.target.value)}
                          className="rounded-xl border border-outline bg-surface px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                        >
                          <option value="all">All Statuses</option>
                          <option value="pending">Pending Review</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      {/* Services List */}
                      {data.services && data.services.length > 0 ? (
                        <div className="grid gap-4">
                          {data.services.map((s: any) => (
                            <div
                              key={s._id}
                              className="rounded-xl border border-line bg-surface p-5 shadow-sm space-y-4"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <img
                                    src={s.images?.[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80"}
                                    alt="Service"
                                    className="h-16 w-20 rounded-lg object-cover shrink-0"
                                  />
                                  <div>
                                    <h3 className="font-serif font-bold text-base text-ink">{s.serviceName}</h3>
                                    <p className="text-xs text-muted">
                                      Vendor: <span className="font-semibold text-ink">{s.vendor?.name || "Vendor"}</span> ({s.vendor?.email})
                                    </p>
                                    <p className="text-xs text-muted">
                                      {s.category} • ${Number(s.price).toLocaleString()} • {s.location}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      s.status === "approved"
                                        ? "success"
                                        : s.status === "pending"
                                        ? "warning"
                                        : "destructive"
                                    }
                                  >
                                    {s.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>

                              <p className="text-xs text-secondary-ink line-clamp-2">{s.description}</p>

                              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-3">
                                {s.status !== "approved" && (
                                  <Button
                                    size="sm"
                                    disabled={busy}
                                    onClick={() =>
                                      runAction(
                                        () =>
                                          api(`/api/admin/services/${s._id}/status`, {
                                            method: "PATCH",
                                            body: JSON.stringify({ status: "approved" }),
                                          }),
                                        "Service approved and published."
                                      )
                                    }
                                  >
                                    <Check size={14} /> Approve Service
                                  </Button>
                                )}

                                {s.status !== "rejected" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={busy}
                                    onClick={() =>
                                      runAction(
                                        () =>
                                          api(`/api/admin/services/${s._id}/status`, {
                                            method: "PATCH",
                                            body: JSON.stringify({ status: "rejected" }),
                                          }),
                                        "Service rejected."
                                      )
                                    }
                                  >
                                    <X size={14} className="text-danger" /> Reject Service
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={busy}
                                  onClick={() => {
                                    if (confirm("Delete this service permanently?")) {
                                      runAction(
                                        () => api(`/api/services/${s._id}`, { method: "DELETE" }),
                                        "Service deleted."
                                      );
                                    }
                                  }}
                                >
                                  <Trash2 size={14} /> Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-outline bg-cream p-12 text-center text-sm text-muted">
                          No services found matching current filters.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admin Transactions */}
                  {tab === "transactions" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-ink">Platform Transactions</h2>
                        <p className="text-xs text-muted mt-0.5">Audit log of verified Stripe subscription checkout sessions</p>
                      </div>

                      {data.transactions && data.transactions.length > 0 ? (
                        <div className="grid gap-3">
                          {data.transactions.map((t: any) => (
                            <div
                              key={t._id}
                              className="rounded-xl border border-line bg-surface p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="font-semibold text-sm text-ink">
                                  Vendor: {t.vendor?.name || "Vendor"} ({t.vendor?.email || t.vendorId})
                                </div>
                                <div className="text-muted">
                                  Stripe Session: <code className="bg-cream px-1.5 py-0.5 rounded">{t.stripeSessionId || "N/A"}</code>
                                </div>
                                <div className="text-muted">
                                  Date: {new Date(t.createdAt).toLocaleString()}
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="font-serif text-base font-bold text-ink">
                                    ${(t.amount / 100).toFixed(2)} {t.currency?.toUpperCase()}
                                  </div>
                                  <span className="text-[11px] uppercase tracking-wider text-muted">Plan: {t.plan}</span>
                                </div>
                                <Badge variant="success">{t.status.toUpperCase()}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-outline bg-cream p-12 text-center text-sm text-muted">
                          No completed transactions recorded yet.
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ======================================================== */}
              {/* PROFILE SETTINGS (Common to Customer & Vendor)           */}
              {/* ======================================================== */}
              {tab === "profile" && (
                <div className="max-w-xl mx-auto rounded-2xl border border-line bg-surface p-8 shadow-sm space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-ink">Profile Settings</h2>
                    <p className="text-xs text-muted mt-0.5">Update your personal account information and avatar</p>
                  </div>
                  <ProfileEditor user={user} onSaved={(msg) => { setNoticeType("success"); setNotice(msg); loadUser(); }} />
                  <DeleteAccount user={user} />
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title="Booking Details"
          description={`Reference ID: ${selectedBooking._id}`}
        >
          <div className="space-y-4 text-xs text-secondary-ink">
            <div className="rounded-lg bg-cream p-3 space-y-1">
              <p className="font-semibold text-sm text-ink">{selectedBooking.service?.serviceName || "Wedding Service"}</p>
              <p className="text-muted">Category: {selectedBooking.service?.category}</p>
              <p className="text-muted">Base Price: ${Number(selectedBooking.service?.price || 0).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted">Event Date:</span>
                <p className="font-semibold text-ink">{new Date(selectedBooking.eventDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted">Event Location:</span>
                <p className="font-semibold text-ink">{selectedBooking.eventLocation}</p>
              </div>
            </div>

            <div>
              <span className="text-muted">Customer Information:</span>
              <p className="font-semibold text-ink">{selectedBooking.customer?.name} ({selectedBooking.customer?.email})</p>
            </div>

            <div>
              <span className="text-muted">Vendor Information:</span>
              <p className="font-semibold text-ink">{selectedBooking.vendor?.name} ({selectedBooking.vendor?.email})</p>
            </div>

            {selectedBooking.message && (
              <div>
                <span className="text-muted">Message from Customer:</span>
                <p className="rounded-lg bg-cream p-2.5 mt-1 border border-outline">{selectedBooking.message}</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-line">
              <Badge variant={selectedBooking.status === "accepted" ? "success" : selectedBooking.status === "pending" ? "warning" : "destructive"}>
                Status: {selectedBooking.status.toUpperCase()}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title="User Account Details"
          description={`ID: ${selectedUser.user?._id}`}
        >
          <div className="space-y-4 text-xs text-secondary-ink">
            <div className="flex items-center gap-3 pb-2 border-b border-line">
              {selectedUser.user?.image ? (
                <img src={selectedUser.user.image} alt="User" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white font-bold text-base">
                  {(selectedUser.user?.name || "U")[0].toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="font-bold text-base text-ink">{selectedUser.user?.name}</h4>
                <p className="text-xs text-muted">{selectedUser.user?.email}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="capitalize">{selectedUser.user?.role}</Badge>
                  {selectedUser.user?.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                  {selectedUser.user?.subscriptionPlan === "premium" && <Badge variant="premium">Premium</Badge>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted">Registered Since:</span>
                <p className="font-semibold text-ink">{new Date(selectedUser.user?.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted">Associated Services:</span>
                <p className="font-semibold text-ink">{selectedUser.stats?.servicesCount ?? 0} published</p>
              </div>
              <div>
                <span className="text-muted">Booking History:</span>
                <p className="font-semibold text-ink">{selectedUser.stats?.bookingsCount ?? 0} total requests</p>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedUser(null)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Vendor Edit Service Modal */}
      {editingService && (
        <Modal
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          title="Update Service Details"
          description="Editing details will resubmit the service for administrator review."
        >
          <form onSubmit={handleUpdateService} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Service Name</label>
              <input
                type="text"
                required
                value={editingService.serviceName}
                onChange={(e) => setEditingService({ ...editingService, serviceName: e.target.value })}
                className="w-full rounded-lg border border-outline px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Category</label>
                <select
                  value={editingService.category}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                  className="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Base Price ($)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editingService.price}
                  onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                  className="w-full rounded-lg border border-outline px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Location</label>
              <input
                type="text"
                required
                value={editingService.location}
                onChange={(e) => setEditingService({ ...editingService, location: e.target.value })}
                className="w-full rounded-lg border border-outline px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={editingService.description}
                onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                className="w-full rounded-lg border border-outline p-2.5 text-sm text-ink focus:border-accent focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditingService(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving..." : "Save & Resubmit"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <Toast message={notice} type={noticeType} onClose={() => setNotice("")} />
    </main>
  );
}

// Profile Editor Component
function ProfileEditor({ user, onSaved }: { user: User; onSaved: (msg: string) => void }) {
  const [name, setName] = useState(user.name);
  const [businessName, setBusinessName] = useState(user.businessName || "");
  const [imagePreview, setImagePreview] = useState(user.image || "");
  const [imageUrl, setImageUrl] = useState(user.image || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAvatarUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      setImagePreview(url);
      onSaved("Avatar uploaded! Remember to click Save Profile.");
    } catch (e: any) {
      onSaved(e.message || "Failed to upload avatar.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          ...(user.role === "vendor" ? { businessName: businessName.trim() } : {}),
          ...(imageUrl ? { image: imageUrl } : {}),
        }),
      });
      window.dispatchEvent(new Event("auth-changed"));
      onSaved("Profile information updated successfully!");
    } catch (e: any) {
      onSaved(e.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar preview & change */}
      <div className="flex items-center gap-4 pb-2 border-b border-line">
        {imagePreview ? (
          <img src={imagePreview} alt="Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-accent" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white font-serif font-bold text-xl">
            {(name || "U")[0].toUpperCase()}
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">Change Profile Avatar</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
            className="text-xs text-muted file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-raised file:text-accent-strong cursor-pointer"
          />
          {uploading && <p className="text-[11px] text-accent mt-1">Uploading...</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Full Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-outline px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
        />
      </div>

      {user.role === "vendor" && (
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">Business Name</label>
          <input
            type="text"
            placeholder="e.g. Dream Weddings Photography"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full rounded-lg border border-outline px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Email Address (Read-only)</label>
        <input
          type="email"
          disabled
          value={user.email}
          className="w-full rounded-lg border border-outline bg-cream px-3.5 py-2.5 text-sm text-muted cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Account Role</label>
        <div className="rounded-lg border border-outline bg-cream px-3.5 py-2.5 text-sm text-muted capitalize">
          {user.role} {user.subscriptionPlan === "premium" && "• Premium Tier"}
        </div>
        <p className="text-[11px] text-muted mt-1">
          Roles and subscriptions cannot be modified from profile settings.
        </p>
      </div>

      <Button type="submit" disabled={saving || uploading} className="w-full h-11 text-sm font-semibold mt-2">
        {saving ? "Saving Changes..." : "Save Profile"}
      </Button>
    </form>
  );
}

function DeleteAccount({ user }: { user: User }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function closeDialog() {
    if (busy) return;
    setOpen(false);
    setPassword("");
    setError("");
  }

  async function deleteAccount(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const result = await authClient.deleteUser(password ? { password } : {});
      if (result.error) throw new Error(result.error.message || "Account deletion failed.");
      if (!result.data?.success) throw new Error("Account deletion could not be confirmed.");
      clearApiToken();
      window.dispatchEvent(new Event("auth-changed"));
      router.replace("/");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Account deletion failed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3 border-t border-line pt-6">
      <h3 className="font-serif text-lg font-bold text-ink">Delete account</h3>
      <p className="text-sm text-muted">Permanently remove your WedPlan account and sign out on all devices.</p>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        <Trash2 size={16} aria-hidden="true" /> Delete my account
      </Button>

      <Modal isOpen={open} onClose={closeDialog} title="Permanently delete your account?">
        <form onSubmit={deleteAccount} className="space-y-4">
          <p className="text-sm text-muted">
            Pending bookings will be cancelled. Other parties may still see booking and payment records.
            {user.role === "vendor" && " Your services will be removed from public listings."}
            {user.subscriptionPlan === "premium" && " Your Premium subscription will end immediately."}
          </p>
          <label className="block text-sm font-medium text-ink">
            Current password, if you sign in with a password
            <input type="password" autoComplete="current-password" value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-outline bg-surface px-3 py-2 text-ink" />
          </label>
          <p className="text-xs text-muted">If you use Google and your session has expired, sign in again before deleting your account.</p>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={busy}>
              {busy ? "Deleting?" : "Permanently delete"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-muted">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
