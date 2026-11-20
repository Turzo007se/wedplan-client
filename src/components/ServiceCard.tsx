"use client";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";

export type ServiceCardData = {
  _id: string;
  serviceName: string;
  category: string;
  price: number;
  location: string;
  images: string[];
  vendorName?: string;
  vendorPremium?: boolean;
};

export function ServiceCard({ service }: { service: ServiceCardData }) {
  const router = useRouter();

  async function handleCardClick(e: React.MouseEvent) {
    e.preventDefault();
    try {
      const session: any = await authClient.getSession();
      if (!session?.data?.user) {
        router.push(`/sign-in?redirect=/services/${service._id}`);
      } else {
        router.push(`/services/${service._id}`);
      }
    } catch {
      router.push(`/sign-in?redirect=/services/${service._id}`);
    }
  }

  const mainPhoto = service.images?.[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80";

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#eee5e1] bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Service Image & Category Badge */}
      <div className="relative h-56 w-full overflow-hidden bg-stone-100">
        <img
          src={mainPhoto}
          alt={service.serviceName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-[#8f3e4d] font-semibold text-xs shadow-sm">
            {service.category}
          </Badge>
        </div>
      </div>

      {/* Body Information */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#777174] mb-1.5 font-medium">
            <MapPin size={13} className="text-[#b65b69] shrink-0" />
            <span className="truncate">{service.location}</span>
          </div>

          <h3 className="font-serif text-xl font-semibold text-[#292526] line-clamp-1 group-hover:text-[#b65b69] transition-colors">
            {service.serviceName}
          </h3>

          <p className="mt-1 text-xs text-[#777174]">
            by <span className="font-medium text-[#292526]">{service.vendorName || "Wedding Professional"}</span>
          </p>
          {service.vendorPremium && <Badge variant="premium" className="mt-2">Premium Vendor</Badge>}
        </div>

        {/* Foot: Price & View Details CTA */}
        <div className="mt-5 flex items-center justify-between border-t border-[#eee5e1] pt-3.5 text-sm">
          <div>
            <span className="text-xs text-[#777174]">Starting at</span>
            <div className="font-serif text-lg font-bold text-[#292526]">
              ${Number(service.price).toLocaleString()}
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b65b69] group-hover:translate-x-0.5 transition-transform">
            View Details <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
}
