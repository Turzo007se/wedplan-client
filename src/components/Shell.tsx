"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Menu, X, UserRound, LogOut, LayoutDashboard, Settings, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { authClient, cacheApiToken, clearApiToken } from "@/lib/auth-client";
import { api } from "@/lib/api";

export function Header() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const path = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshUser = () => {
    authClient.getSession()
      .then(async (r: any) => {
        if (r?.data?.user) {
          setUser(r.data.user);
          await cacheApiToken();
          // Also fetch extra profile info like role & image if not in basic session
          api<{ user: any }>("/api/me")
            .then(res => {
              if (res?.user) setUser((prev: any) => ({ ...prev, ...res.user }));
            })
            .catch(() => {});
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  };

  useEffect(() => {
    refreshUser();
    const handleAuthChange = () => refreshUser();
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, [path]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function logout() {
    await authClient.signOut();
    clearApiToken();
    setUser(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#eee5e1] bg-white/95 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-2xl font-serif font-bold text-[#292526] tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fbf0f2] text-[#b65b69]">
            <Heart size={20} fill="currentColor" />
          </span>
          <span>Wed<span className="text-[#b65b69]">Plan</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#292526]">
          <Link href="/" className="hover:text-[#b65b69] transition-colors">
            Home
          </Link>
          <Link href="/services" className="hover:text-[#b65b69] transition-colors">
            Browse Services
          </Link>
          <a href="/#how" className="hover:text-[#b65b69] transition-colors">
            How It Works
          </a>

          {user ? (
            /* Authenticated User Profile Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 rounded-full border border-[#eee5e1] bg-[#fbf7f3] py-1.5 pl-2 pr-3.5 hover:bg-[#f5eeeb] transition-colors cursor-pointer"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-[#b65b69]/20"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b65b69] text-white text-xs font-semibold">
                    {(user.name || "U")[0].toUpperCase()}
                  </div>
                )}
                <span className="max-w-[130px] truncate text-xs font-semibold text-[#292526]">
                  {user.name || "My Account"}
                </span>
                <ChevronDown size={14} className={`text-[#777174] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#eee5e1] bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="border-b border-[#eee5e1] px-3 py-2.5 mb-1">
                    <p className="text-xs font-medium text-[#777174]">Signed in as</p>
                    <p className="truncate text-sm font-semibold text-[#292526]">{user.name}</p>
                    <p className="truncate text-xs text-[#777174]">{user.email}</p>
                    <span className="inline-block mt-1.5 rounded bg-[#f4ebe6] px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-[#8f3e4d]">
                      {user.role || "Member"}
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#292526] hover:bg-[#fbf7f3] hover:text-[#b65b69] transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/dashboard?tab=profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#292526] hover:bg-[#fbf7f3] hover:text-[#b65b69] transition-colors"
                  >
                    <Settings size={16} />
                    <span>Profile Settings</span>
                  </Link>

                  <div className="my-1 border-t border-[#eee5e1]" />

                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Links */
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-semibold text-[#292526] hover:text-[#b65b69] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-[#b65b69] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#8f3e4d] transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <button
          type="button"
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-[#eee5e1] text-[#292526]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-t border-[#eee5e1] bg-white px-6 py-5 shadow-lg space-y-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block text-base font-medium text-[#292526] hover:text-[#b65b69]"
          >
            Home
          </Link>
          <Link
            href="/services"
            onClick={() => setOpen(false)}
            className="block text-base font-medium text-[#292526] hover:text-[#b65b69]"
          >
            Browse Services
          </Link>
          <a
            href="/#how"
            onClick={() => setOpen(false)}
            className="block text-base font-medium text-[#292526] hover:text-[#b65b69]"
          >
            How It Works
          </a>

          {user ? (
            <div className="border-t border-[#eee5e1] pt-4 space-y-3">
              <div className="flex items-center gap-3 pb-2">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b65b69] text-white font-bold">
                    {(user.name || "U")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-[#292526]">{user.name}</div>
                  <div className="text-xs text-[#777174] capitalize">{user.role} Dashboard</div>
                </div>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 font-medium text-[#292526] hover:text-[#b65b69]"
              >
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link
                href="/dashboard?tab=profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 font-medium text-[#292526] hover:text-[#b65b69]"
              >
                <Settings size={18} /> Profile Settings
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 font-medium text-rose-600 pt-2"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t border-[#eee5e1] pt-4 flex flex-col gap-3">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="w-full text-center py-2.5 rounded-lg border border-[#ded3cf] font-semibold text-[#292526]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-[#b65b69] font-semibold text-white"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#241f20] text-white pt-16 pb-8 border-t border-[#3a3435] mt-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#3e3839]">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-2xl font-serif font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b65b69] text-white">
                <Heart size={16} fill="currentColor" />
              </span>
              <span>WedPlan</span>
            </Link>
            <p className="text-sm text-[#b8b0b1] leading-relaxed">
              Your comprehensive wedding planning platform. Connecting couples with verified wedding professionals for venues, photography, styling, catering, and floral decor.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#d9959d] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-[#b8b0b1]">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Browse All Services
                </Link>
              </li>
              <li>
                <a href="/#how" className="hover:text-white transition-colors">
                  How WedPlan Works
                </a>
              </li>
              <li>
                <a href="/#why" className="hover:text-white transition-colors">
                  Why Choose Us
                </a>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-white transition-colors">
                  Join as a Vendor
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#d9959d] mb-4">
              Contact Us
            </h4>
            <div className="space-y-2.5 text-sm text-[#b8b0b1]">
              <p>Email: support@wedplan.example</p>
              <p>Phone: +880 1700-000000</p>
              <p>Location: Gulshan-2, Dhaka 1212, Bangladesh</p>
              <p>Hours: Mon - Sat (9:00 AM - 8:00 PM)</p>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-[#d9959d] mb-4">
              Follow Us
            </h4>
            <p className="text-xs text-[#b8b0b1] mb-3">
              Get wedding inspiration and vendor highlights on our social channels.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#352f30] px-3 py-1.5 hover:bg-[#b65b69] transition-colors">
                Instagram
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#352f30] px-3 py-1.5 hover:bg-[#b65b69] transition-colors">
                Pinterest
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#352f30] px-3 py-1.5 hover:bg-[#b65b69] transition-colors">
                Facebook
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#352f30] px-3 py-1.5 hover:bg-[#b65b69] transition-colors">
                Twitter
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9d9394]">
          <p>© {new Date().getFullYear()} WedPlan. All rights reserved.</p>
          <p>Designed with care for your forever moments.</p>
        </div>
      </div>
    </footer>
  );
}

export function Toast({ message, type = "info", onClose }: { message: string; type?: "info" | "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    if (message) {
      const t = setTimeout(onClose, 4000);
      return () => clearTimeout(t);
    }
  }, [message, onClose]);

  if (!message) return null;

  const isError = type === "error" || message.toLowerCase().includes("fail") || message.toLowerCase().includes("error") || message.toLowerCase().includes("invalid");

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-[#282526] text-white px-5 py-3.5 shadow-2xl border border-white/10 animate-in slide-in-from-bottom-5 duration-200">
      {isError ? (
        <AlertCircle size={18} className="text-rose-400 shrink-0" />
      ) : (
        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-white/60 hover:text-white cursor-pointer">
        <X size={15} />
      </button>
    </div>
  );
}
