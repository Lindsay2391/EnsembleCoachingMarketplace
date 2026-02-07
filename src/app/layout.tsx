import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ensemble Coach - Find Your Perfect Coaching Match",
  description:
    "A marketplace connecting ensemble groups with qualified coaches. Find the right coach, book with confidence, and take your group to the next level.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
