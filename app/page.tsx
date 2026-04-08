import Map from "@/components/Map";
import { HomeCityFilters } from "@/components/HomeCityFilters";
import { loadHomePageData } from "@/lib/queries/home";
import { Users, MapPin, Globe } from "lucide-react";
import Link from "next/link";

/** 避免首页被静态固化成「无 env」时的错误快照，每次请求拉取列表 */
export const dynamic = "force-dynamic";

/**
 * 首页：地图与城市列表（数据来自 Supabase）
 */
export default async function Home() {
  const { markers, cityCards, stats, error } = await loadHomePageData();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <section className="mb-16 text-center md:mb-20">
        <h1 className="mb-6 font-serif text-5xl font-bold text-near-black md:text-7xl">
          Your classmates&apos; living rooms, <br />
          <span className="italic-accent text-primary">the whole world.</span>
        </h1>
        <p className="mx-auto mb-4 max-w-2xl text-xl text-secondary">
          Remote this summer? Your classmates are scattered across the globe,
          <br />
          and some of them have a spare couch.
          <br />
          <br />
          Good people, great cities,
          <br />
          and friendships in a memorable summer.
        </p>
        <p className="mx-auto mb-10 max-w-2xl font-serif text-lg italic text-[#B47B2E]">
          Come for the couch. Stay for the connection.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="#explore"
            className="w-full rounded-md bg-primary px-8 py-4 text-center text-lg font-bold text-white transition-opacity hover:opacity-90 sm:w-auto"
          >
            Find a place to stay
          </Link>
          <Link
            href="/become-anchor"
            className="w-full rounded-md border border-near-black/10 bg-white px-8 py-4 text-center text-lg font-bold text-near-black transition-colors hover:bg-surface sm:w-auto"
          >
            Open my livingroom
          </Link>
        </div>
      </section>

      {error ? (
        <p className="mb-12 rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-4 text-sm text-[#D85A30]">
          Could not load listings. Please refresh and try again.{" "}
          <span className="text-xs">Details: {error}</span>
        </p>
      ) : null}

      <section id="explore" className="mb-12 md:mb-20">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-2xl font-bold">Explore cities</h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-available" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-pending" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-booked" />
              <span>Booked</span>
            </div>
          </div>
        </div>

        <div className="mb-8 hidden md:block">
          <Map markers={markers} />
        </div>

        <HomeCityFilters cityCards={cityCards} hasLoadError={Boolean(error)} />
      </section>

      <section className="flex flex-col items-center gap-8 rounded-xl border border-[#E2DDD4] bg-[#F0EDE6] p-8 md:flex-row md:justify-around">
        <div className="text-center">
          <div className="mb-1 flex items-center justify-center gap-2 text-primary">
            <Users size={24} />
            <span className="text-3xl font-bold">{stats.anchors}</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Active Anchors
          </p>
        </div>
        <div className="hidden h-12 w-px bg-near-black/10 md:block" />
        <div className="text-center">
          <div className="mb-1 flex items-center justify-center gap-2 text-primary">
            <MapPin size={24} />
            <span className="text-3xl font-bold">{stats.cities}</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Cities represented
          </p>
        </div>
        <div className="hidden h-12 w-px bg-near-black/10 md:block" />
        <div className="text-center">
          <div className="mb-1 flex items-center justify-center gap-2 text-primary">
            <Globe size={24} />
            <span className="text-xl font-bold">GSB Class of 2027</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Verified community
          </p>
        </div>
      </section>
    </div>
  );
}
