import AnchorCard from "@/components/AnchorCard";
import { loadCityBySlug } from "@/lib/queries/city";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * 城市详情：按 slug 展示该城所有活跃 Anchors
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { cityLabel } = await loadCityBySlug(slug);
  return {
    title: `${cityLabel} | Open Livingroom`,
    description: `Summer stays with GSB classmates in ${cityLabel}.`,
  };
}

export default async function CityPage({ params }: PageProps) {
  const { slug } = await params;
  const { cityLabel, anchors, error } = await loadCityBySlug(slug);

  let isHostForThisCity = false;
  if (!error && anchors.length === 1) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userEmail = user?.email?.toLowerCase();
      const hostEmail = anchors[0].contact_email?.toLowerCase();
      isHostForThisCity = Boolean(userEmail && hostEmail && userEmail === hostEmail);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <div className="mb-12">
        <h1 className="mb-4 font-serif text-4xl font-bold text-near-black md:text-5xl">
          {cityLabel}
        </h1>
        {error ? (
          <p className="text-[#D85A30]">
            Could not load this city. Please refresh and try again.{" "}
            <span className="text-xs">Details: {error}</span>
          </p>
        ) : (
          <p className="text-lg text-secondary">
            {anchors.length} classmate{anchors.length === 1 ? "" : "s"}{" "}
            {anchors.length === 1 ? "is" : "are"} opening their{" "}
            home{anchors.length === 1 ? "" : "s"} in {cityLabel} this summer.
          </p>
        )}
      </div>

      {!error && anchors.length > 0 ? (
        <div
          className={
            anchors.length === 1
              ? "mx-auto grid max-w-2xl grid-cols-1 gap-8"
              : "grid grid-cols-1 gap-8 xl:grid-cols-2"
          }
        >
          {anchors.map((anchor) => (
            <AnchorCard
              key={anchor.id}
              anchor={anchor}
              citySlug={slug}
              cityLabel={cityLabel}
            />
          ))}
        </div>
      ) : null}

      {!error && anchors.length === 1 ? (
        <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-[#E2DDD4] bg-[#F0EDE6] px-6 py-5 text-center">
          <p className="text-secondary">
            {isHostForThisCity ? (
              <>
                This is your listing in {cityLabel}.{" "}
                <Link
                  href="/my-anchor"
                  className="font-semibold text-[#B47B2E] transition-opacity hover:opacity-90"
                >
                  Manage availability →
                </Link>
              </>
            ) : (
              <>
                Interning in {cityLabel}?{" "}
                <Link
                  href="/become-anchor"
                  className="font-semibold text-[#B47B2E] transition-opacity hover:opacity-90"
                >
                  Open your livingroom →
                </Link>
              </>
            )}
          </p>
        </div>
      ) : null}

      {!error && anchors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E2DDD4] bg-[#F0EDE6] py-20 text-center">
          <p className="text-lg italic text-secondary">
            No Anchors yet in this city. Be the first.
          </p>
          <Link
            href="/become-anchor"
            className="mt-6 inline-block rounded-lg bg-[#B47B2E] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Open my livingroom
          </Link>
        </div>
      ) : null}
    </div>
  );
}
