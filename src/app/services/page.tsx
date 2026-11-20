"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, SlidersHorizontal, ArrowUpDown, Sparkles, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { ServiceCard, ServiceCardData } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
];

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [services, setServices] = useState<ServiceCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("");

  const fetchServices = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (location.trim()) params.set("location", location.trim());
    if (sort) params.set("sort", sort);

    api<{ services: ServiceCardData[] }>(`/api/services?${params.toString()}`)
      .then((d) => setServices(d.services || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 250);
    return () => clearTimeout(timer);
  }, [q, category, location, sort]);

  function resetFilters() {
    setQ("");
    setCategory("");
    setLocation("");
    setSort("");
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 py-12 min-h-[75vh]">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-accent mb-2">
          <Sparkles size={14} /> Curated Wedding Collections
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">
          Explore Wedding Services
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl">
          Discover vetted professionals to bring every dream detail of your celebration to life.
        </p>
      </div>

      {/* Advanced Search & Filter Bar */}
      <div className="mb-10 rounded-2xl border border-line bg-cream p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search by service or keywords..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border border-outline bg-surface pl-10 pr-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-3.5 text-muted" />
            <input
              type="text"
              placeholder="Filter by city / location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-outline bg-surface pl-10 pr-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          {/* Price Sorting */}
          <div className="relative">
            <ArrowUpDown size={15} className="absolute left-3.5 top-3.5 text-muted" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-xl border border-outline bg-surface pl-10 pr-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="">Sort: Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-raised">
          <span className="text-xs font-semibold text-muted mr-1">Popular:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? "" : cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                category === cat
                  ? "bg-brand text-white shadow-sm"
                  : "bg-surface text-secondary-ink border border-outline hover:bg-raised"
              }`}
            >
              {cat}
            </button>
          ))}
          {(q || category || location || sort) && (
            <button
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs text-accent hover:underline cursor-pointer"
            >
              <RotateCcw size={12} /> Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Services List Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-xl bg-cream animate-pulse border border-outline" />
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((item) => (
            <ServiceCard key={item._id} service={item} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-outline bg-cream p-16 text-center">
          <SlidersHorizontal size={36} className="mx-auto text-accent mb-3" />
          <h2 className="font-serif text-2xl font-bold text-ink">No Services Found</h2>
          <p className="mt-1 text-sm text-muted max-w-md mx-auto">
            We couldn't find any approved services matching your current filters. Try adjusting your search keywords or location.
          </p>
          <Button variant="outline" className="mt-5" onClick={resetFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </main>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-sm text-muted">Loading services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
