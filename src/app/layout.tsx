import type {Metadata} from "next";import "./globals.css";import {Header,Footer} from "@/components/Shell";
export const metadata:Metadata={title:"WedPlan — Find your wedding team",description:"Discover and book wedding services with WedPlan."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/>{children}<Footer/></body></html>}
