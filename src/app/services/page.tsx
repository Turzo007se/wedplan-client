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
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#b65b69] mb-2">
          <Sparkles size={14} /> Curated Wedding Collections
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#292526]">
          Explore Wedding Services
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#777174] max-w-2xl">
          Discover vetted professionals to bring every dream detail of your celebration to life.
        </p>
      </div>

      {/* Advanced Search & Filter Bar */}
      <div className="mb-10 rounded-2xl border border-[#eee5e1] bg-[#fbf7f3] p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-[#8b8180]" />
            <input
              type="text"
              placeholder="Search by service or keywords..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border border-[#ded3cf] bg-white pl-10 pr-4 py-2.5 text-sm text-[#292526] focus:border-[#b65b69] focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-[#ded3cf] bg-white px-3.5 py-2.5 text-sm text-[#292526] focus:border-[#b65b69] focus:outline-none"
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
            <MapPin size={16} className="absolute left-3.5 top-3.5 text-[#8b8180]" />
            <input
              type="text"
              placeholder="Filter by city / location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-[#ded3cf] bg-white pl-10 pr-4 py-2.5 text-sm text-[#292526] focus:border-[#b65b69] focus:outline-none"
            />
          </div>

          {/* Price Sorting */}
          <div className="relative">
            <ArrowUpDown size={15} className="absolute left-3.5 top-3.5 text-[#8b8180]" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-xl border border-[#ded3cf] bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#292526] focus:border-[#b65b69] focus:outline-none"
            >
              <option value="">Sort: Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-[#ede4e0]">
          <span className="text-xs font-semibold text-[#777174] mr-1">Popular:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? "" : cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                category === cat
                  ? "bg-[#b65b69] text-white shadow-sm"
                  : "bg-white text-[#514b4c] border border-[#ded3cf] hover:bg-[#f4ebe6]"
              }`}
            >
              {cat}
            </button>
          ))}
          {(q || category || location || sort) && (
            <button
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs text-[#b65b69] hover:underline cursor-pointer"
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
            <div key={n} className="h-80 rounded-xl bg-stone-100 animate-pulse border border-stone-200" />
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
        <div className="rounded-2xl border border-dashed border-[#ded3cf] bg-[#fbf7f3] p-16 text-center">
          <SlidersHorizontal size={36} className="mx-auto text-[#b65b69] mb-3" />
          <h2 className="font-serif text-2xl font-bold text-[#292526]">No Services Found</h2>
          <p className="mt-1 text-sm text-[#777174] max-w-md mx-auto">
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
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-sm text-[#777174]">Loading services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
