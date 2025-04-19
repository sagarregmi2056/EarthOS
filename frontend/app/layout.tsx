import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "EarthOS - Planetary Monitoring System",
    description: "Open-source platform for monitoring and visualizing planetary data",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-slate-900 text-white min-h-screen">
                {children}
            </body>
        </html>
    );
} 