"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  ShieldCheck,
  Sparkles,
  CalendarDays,
  Camera,
  Building2,
  Flower2,
  Utensils,
  Sparkle,
  Shirt,
  CheckCircle2,
  Star,
  Clock,
  Award
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ServiceCard, ServiceCardData } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { name: "Photography & Videography", icon: Camera, desc: "Capture every timeless glance & tear" },
  { name: "Wedding Venues", icon: Building2, desc: "Romantic gardens, ballrooms & resorts" },
  { name: "Decoration & Florist", icon: Flower2, desc: "Bespoke floral styling & dreamy stages" },
  { name: "Catering Services", icon: Utensils, desc: "Gourmet dining & artisanal dessert tables" },
  { name: "Makeup & Styling", icon: Sparkle, desc: "Flawless bridal glam & relaxing trials" },
  { name: "Wedding Fashion", icon: Shirt, desc: "Custom bridal wear, sarees & tuxedos" },
];

const TESTIMONIALS = [
  {
    quote: "WedPlan made finding our venue and photographer completely stress-free. The booking requests were answered promptly and communication was seamless!",
    author: "Nabila & Farhan",
    location: "Celebrated in Dhaka",
    rating: 5,
  },
  {
    quote: "As a floral designer, upgrading to WedPlan Premium gave my studio immense visibility. We booked 14 weddings in our very first season!",
    author: "Tariqul Islam (Floral Vendor)",
    location: "Petal & Pine Studios",
    rating: 5,
  },
  {
    quote: "The transparent pricing and verified profiles gave us peace of mind. Every detail of our wedding catering turned out delicious and magical.",
    author: "Sarah & David",
    location: "Celebrated in Chattogram",
    rating: 5,
  },
];

const TIPS = [
  {
    title: "12-Month Wedding Timeline",
    description: "When to secure your key venue, photographer, and bridal attire without stress.",
    tag: "Planning Guide",
  },
  {
    title: "Crafting a Cohesive Floral Palette",
    description: "How to match season blooms with your wedding attire and evening lighting.",
    tag: "Floral & Decor",
  },
  {
    title: "Essential Questions for Caterers",
    description: "Tastings, dietary accommodations, and live station logistics to discuss early.",
    tag: "Catering",
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<ServiceCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ services: ServiceCardData[] }>("/api/services?limit=6")
      .then((d) => setFeatured(d.services || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-24 pb-12">
      {/* 1. Hero Banner Section */}
      <section className="relative min-h-[640px] flex items-center justify-center overflow-hidden bg-[#1e191a] text-white">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(30, 25, 26, 0.92) 0%, rgba(30, 25, 26, 0.72) 50%, rgba(30, 25, 26, 0.45) 100%), url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=90')",
          }}
        />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-surface/10 px-4 py-1 text-xs font-semibold tracking-wider uppercase text-[#f5c8c8] backdrop-blur-md">
              <Sparkles size={14} /> The Premier Wedding Network
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              Plan Your Dream Wedding With Trusted Professionals.
            </h1>

            <p className="text-base sm:text-lg text-raised leading-relaxed max-w-xl">
              Connect with top-rated wedding venues, photographers, caterers, decorators, and stylists. Request bookings directly and track your plans with ease.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/services">
                <Button size="lg" className="h-13 px-8 text-base font-semibold shadow-xl">
                  Explore Wedding Services <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="outline" size="lg" className="h-13 px-7 text-base font-semibold bg-surface/10 text-white border-white/30 hover:bg-surface/20">
                  Join as a Vendor
                </Button>
              </Link>
            </div>

            {/* Highlights */}
            <div className="flex flex-wrap gap-6 pt-6 text-xs text-raised">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#f5c8c8]" /> Verified Professionals
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#f5c8c8]" /> Transparent Pricing
              </span>
              <span className="flex items-center gap-2">
                <Award size={16} className="text-[#f5c8c8]" /> Direct Booking Inquiries
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Dynamic Section 1: Featured Wedding Services */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-accent mb-1">
              Curated Highlights
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Featured Wedding Services
            </h2>
            <p className="text-sm text-muted mt-1">
              Explore handpicked, verified services from our top wedding specialists.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            Browse all services <ArrowUpRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-xl bg-cream animate-pulse border border-outline" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.slice(0, 6).map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-outline bg-cream p-12 text-center text-muted">
            New wedding services are being reviewed by administrators and will appear here shortly.
          </div>
        )}
      </section>

      {/* 3. Dynamic Section 2: Wedding Service Categories */}
      <section className="bg-cream py-20 border-y border-line">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-accent mb-1">
              Complete Categories
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Explore by Wedding Category
            </h2>
            <p className="text-sm text-muted mt-2">
              Browse tailored offerings across every essential discipline of your big day.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/services?category=${encodeURIComponent(cat.name)}`}
                  className="group flex items-start gap-4 rounded-xl border border-outline bg-surface p-6 shadow-sm hover:border-accent hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tint text-accent group-hover:bg-brand group-hover:text-white transition-colors">
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-semibold text-ink group-hover:text-accent transition-colors">
                        {cat.name}
                      </h3>
                      <ArrowUpRight size={16} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{cat.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Why Choose WedPlan? (Required Section) */}
      <section id="why" className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-accent mb-1">
            The WedPlan Difference
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            Why Couples & Vendors Choose Us
          </h2>
          <p className="text-sm text-muted mt-2">
            A secure, role-based platform built to remove the chaos of wedding vendor coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tint text-accent">
              <ShieldCheck size={26} />
            </div>
            <h3 className="font-serif text-xl font-semibold text-ink">Verified Quality Vendors</h3>
            <p className="text-sm text-muted leading-relaxed">
              Every vendor profile and service undergoes administrative review before appearing in public listings, guaranteeing authentic portfolios and professional standards.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tint text-accent">
              <CalendarDays size={26} />
            </div>
            <h3 className="font-serif text-xl font-semibold text-ink">Direct Booking Tracking</h3>
            <p className="text-sm text-muted leading-relaxed">
              Submit your desired date and venue location directly to the vendor. Receive status updates (Accepted, Rejected, Pending) directly inside your private dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tint text-accent">
              <Sparkles size={26} />
            </div>
            <h3 className="font-serif text-xl font-semibold text-ink">Fair Tiered Growth</h3>
            <p className="text-sm text-muted leading-relaxed">
              Vendors enjoy a free tier to publish up to 3 active services, with seamless Stripe-backed Premium upgrades for unlimited listings and verified badges.
            </p>
          </div>
        </div>
      </section>

      {/* 5. How WedPlan Works Section */}
      <section id="how" className="bg-cream py-20 border-y border-line">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-widest text-accent mb-1">
              Easy 3-Step Process
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              How WedPlan Works
            </h2>
            <p className="text-sm text-muted mt-2">
              From discovery to confirmation, planning your wedding has never been smoother.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-2xl border border-outline bg-surface p-8">
              <span className="font-serif text-4xl font-bold text-accent/20 absolute top-6 right-6">
                01
              </span>
              <h3 className="font-serif text-xl font-bold text-ink mb-2">Explore & Discover</h3>
              <p className="text-sm text-muted leading-relaxed">
                Filter by category, wedding venue location, and price. View high-resolution galleries and transparent base prices.
              </p>
            </div>

            <div className="relative rounded-2xl border border-outline bg-surface p-8">
              <span className="font-serif text-4xl font-bold text-accent/20 absolute top-6 right-6">
                02
              </span>
              <h3 className="font-serif text-xl font-bold text-ink mb-2">Send Booking Request</h3>
              <p className="text-sm text-muted leading-relaxed">
                Select your celebration date, input your wedding venue, and send a personalized note to the vendor without any upfront charges.
              </p>
            </div>

            <div className="relative rounded-2xl border border-outline bg-surface p-8">
              <span className="font-serif text-4xl font-bold text-accent/20 absolute top-6 right-6">
                03
              </span>
              <h3 className="font-serif text-xl font-bold text-ink mb-2">Confirm & Celebrate</h3>
              <p className="text-sm text-muted leading-relaxed">
                Vendors review and accept requests in their dashboard. Track all confirmed bookings in your customer dashboard in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-accent mb-1">
            Love Letters
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            Couples & Vendors Love WedPlan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="rounded-2xl border border-line bg-surface p-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-secondary-ink italic leading-relaxed">"{t.quote}"</p>
              </div>
              <div className="mt-6 pt-4 border-t border-line">
                <p className="font-semibold text-sm text-ink">{t.author}</p>
                <p className="text-xs text-muted">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Wedding Planning Tips */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-accent mb-1">
              Helpful Guides
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Wedding Planning Tips
            </h2>
          </div>
          <Link href="/services" className="text-sm font-semibold text-accent hover:underline">
            Read more advice
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TIPS.map((tip, idx) => (
            <div key={idx} className="rounded-xl border border-line bg-surface p-6 shadow-sm hover:shadow-md transition-all">
              <span className="inline-block rounded bg-raised px-2.5 py-0.5 text-xs font-semibold text-accent-strong mb-3">
                {tip.tag}
              </span>
              <h3 className="font-serif text-lg font-bold text-ink mb-2">{tip.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Vendor Callout CTA */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#292526] to-[#3a3435] text-white p-10 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold tracking-widest uppercase text-[#d9959d]">
              Grow Your Wedding Business
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Are You a Professional Wedding Vendor?
            </h2>
            <p className="text-sm text-[#c9c0c0] leading-relaxed">
              Showcase your portfolio, receive organized booking requests, and connect with couples actively planning their weddings.
            </p>
          </div>
          <Link href="/sign-up">
            <Button size="lg" className="h-13 px-8 text-base font-semibold whitespace-nowrap shadow-lg">
              Join WedPlan as a Vendor <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
