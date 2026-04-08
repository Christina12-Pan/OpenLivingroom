import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { SiteAuthNav } from "@/components/SiteAuthNav";
import { SupabaseBrowserProvider } from "@/lib/supabase/SupabaseBrowserProvider";
import { getSupabasePublicEnv } from "@/lib/supabase/publicEnv";
import { GEOGRAPHIC_ATTRIBUTION_SHORT } from "@/lib/data/geographicAttribution";
import "./globals.css";

/** 根 layout 每次请求再读环境变量，避免预渲染/增量编译时拿不到 `.env.local` */
export const dynamic = "force-dynamic";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Open Livingroom",
  description:
    "Your classmates' living rooms, the whole world. Find a stay with Stanford GSB classmates or open your livingroom as an Anchor.",
  openGraph: {
    title: "Open Livingroom",
    description:
      "Your classmates' living rooms, the whole world. Find a stay with Stanford GSB classmates or open your livingroom as an Anchor.",
    type: "website",
  },
};

/**
 * 根布局组件
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  const supabaseEnv = getSupabasePublicEnv();

  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} font-sans antialiased`}>
        <SupabaseBrowserProvider
          url={supabaseEnv?.url ?? null}
          anonKey={supabaseEnv?.anonKey ?? null}
        >
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <Link href="/" className="text-primary font-serif text-2xl font-bold italic shrink-0">
              Open Livingroom
            </Link>
            <nav className="flex flex-wrap items-center justify-end gap-x-2 gap-y-2 text-sm sm:text-base">
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-secondary transition-colors hover:bg-surface hover:text-near-black"
              >
                Find a stay
              </Link>
              <Link
                href="/become-anchor"
                className="rounded-md px-3 py-2 text-secondary transition-colors hover:bg-surface hover:text-near-black"
              >
                Open my livingroom
              </Link>
              <SiteAuthNav />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t mt-20 py-12 bg-surface">
          <div className="max-w-7xl mx-auto px-4 text-center text-secondary">
            <p className="font-serif italic text-xl mb-4 text-near-black">Be someone's Anchor. Find your own.</p>
            <p>© 2026 Open Livingroom — GSB Class of 2027 only</p>
            <p className="mt-6 max-w-2xl mx-auto text-[11px] leading-relaxed text-secondary">
              {GEOGRAPHIC_ATTRIBUTION_SHORT}
            </p>
          </div>
        </footer>
        </SupabaseBrowserProvider>
      </body>
    </html>
  );
}
