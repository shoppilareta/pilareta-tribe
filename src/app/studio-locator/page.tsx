import Link from 'next/link';

export default function StudioLocatorPage() {
  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto text-center">
        <span className="badge-coming-soon mb-4">Coming Soon</span>
        <h1 className="mb-4">Studio Locator</h1>
        <p className="text-muted mb-8 max-w-md mx-auto">
          Find Pilates studios near you. Search by location, filter by
          amenities, and discover your perfect practice space.
        </p>

        <div className="card mb-8">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your location..."
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              {['Reformer', 'Mat Classes', 'Private Sessions', 'Group Classes'].map(
                (filter) => (
                  <span
                    key={filter}
                    className="px-3 py-1.5 text-xs bg-[rgba(246,237,221,0.05)] rounded-full opacity-60"
                  >
                    {filter}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card text-left opacity-50">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-[rgba(246,237,221,0.1)] rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-[rgba(246,237,221,0.1)] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[rgba(246,237,221,0.1)] rounded w-1/2 mb-1" />
                  <div className="h-3 bg-[rgba(246,237,221,0.1)] rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/" className="btn btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
