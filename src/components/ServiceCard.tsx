import Link from "next/link";
import {MapPin} from "lucide-react";

export type ServiceCardData={_id:string;serviceName:string;category:string;price:number;location:string;images:string[];vendorName?:string};

export function ServiceCard({service}:{service:ServiceCardData}){
  return <Link className="card" href={service._id?`/services/${service._id}`:"/services"}>
    <div className="card-photo" style={{backgroundImage:`url(${service.images?.[0]||""})`}}><span className="badge">{service.category}</span></div>
    <div className="card-body">
      <div style={{fontSize:12,color:"var(--muted)"}}><MapPin size={13} style={{verticalAlign:"middle"}}/> {service.location}</div>
      <h3>{service.serviceName}</h3>
      <div style={{fontSize:13,color:"var(--muted)"}}>by {service.vendorName||"Wedding professional"}</div>
      <div className="card-foot"><span>Starting at <b>${Number(service.price).toLocaleString()}</b></span><span style={{color:"var(--rose)"}}>View details →</span></div>
    </div>
  </Link>
}
