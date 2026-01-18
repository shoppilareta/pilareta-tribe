import { HomeTile } from '@/components/HomeTile';
import { getSession } from '@/lib/session';

// Force dynamic rendering to check session state
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();
  const isLoggedIn = !!session.userId;

  return (
    <div className="container py-8 md:py-12">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Welcome to the Tribe</h1>
        <p style={{ color: 'rgba(246, 237, 221, 0.6)', maxWidth: '36rem', margin: '0 auto' }}>
          Your Pilates community. Find studios, learn new techniques,
          and share your journey with fellow enthusiasts.
        </p>
      </section>

      {/* Feature Tiles */}
      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        {/* Studio Locator */}
        <HomeTile
          title="Studio Locator"
          description="Find Pilates studios near you"
          href="/studio-locator"
        >
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search studios..."
                className="pr-10"
                disabled
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select disabled className="opacity-60">
              <option>Select city...</option>
            </select>
          </div>
        </HomeTile>

        {/* Learn Pilates */}
        <HomeTile
          title="Learn Pilates"
          description="Tutorials and techniques for all levels"
          href="/learn"
        >
          <div className="grid grid-cols-2 gap-2">
            {['Beginner', 'Intermediate', 'Advanced', 'Equipment', 'Mat Work', 'Reformer'].map(
              (category) => (
                <div
                  key={category}
                  className="bg-[rgba(246,237,221,0.05)] rounded-lg p-3 text-center text-xs opacity-60"
                >
                  {category}
                </div>
              )
            )}
          </div>
        </HomeTile>

        {/* UGC / Community */}
        <HomeTile
          title="Community"
          description="Share your Pilates journey"
          href="/ugc"
        >
          <div className="space-y-3">
            {/* Mock feed grid */}
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-[rgba(246,237,221,0.05)] rounded-md"
                />
              ))}
            </div>
            {/* Upload CTA */}
            <button
              className="btn btn-outline w-full text-xs py-2.5"
              disabled
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Share Your Story
            </button>
          </div>
        </HomeTile>
      </div>

      {/* Bottom CTA - only show when not logged in */}
      {!isLoggedIn && (
        <section style={{ textAlign: 'center', marginTop: '4rem' }}>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1rem' }}>
            Already a Pilareta customer?
          </p>
          <a href="/api/auth/login" className="btn btn-primary">
            Sign in with your Pilareta account
          </a>
        </section>
      )}
    </div>
  );
}
