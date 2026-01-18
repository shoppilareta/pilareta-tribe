import Link from 'next/link';

export default function UgcPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="badge-coming-soon mb-4">Coming Soon</span>
          <h1 className="mb-4">Community</h1>
          <p className="text-muted max-w-md mx-auto">
            Share your Pilates journey. Connect with fellow enthusiasts and
            inspire others with your progress.
          </p>
        </div>

        <div className="card mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-[rgba(246,237,221,0.1)] rounded-full" />
            <div className="flex-1">
              <input
                type="text"
                placeholder="Share your Pilates moment..."
                disabled
                className="opacity-60"
              />
            </div>
            <button className="btn btn-primary opacity-60" disabled>
              Post
            </button>
          </div>

          <div className="flex gap-4 text-sm text-muted">
            <button className="flex items-center gap-2 opacity-60" disabled>
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Photo
            </button>
            <button className="flex items-center gap-2 opacity-60" disabled>
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Video
            </button>
          </div>
        </div>

        <h2 className="text-lg font-medium mb-4">Community Feed</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className="card p-0 overflow-hidden opacity-50"
            >
              <div className="aspect-square bg-[rgba(246,237,221,0.05)]" />
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-[rgba(246,237,221,0.1)] rounded-full" />
                  <div className="h-3 bg-[rgba(246,237,221,0.1)] rounded w-20" />
                </div>
                <div className="h-2 bg-[rgba(246,237,221,0.1)] rounded w-full mb-1" />
                <div className="h-2 bg-[rgba(246,237,221,0.1)] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/" className="btn btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
