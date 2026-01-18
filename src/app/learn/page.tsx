import Link from 'next/link';

const categories = [
  {
    name: 'Beginner',
    description: 'Start your Pilates journey',
    icon: '🌱',
  },
  {
    name: 'Intermediate',
    description: 'Build on your foundation',
    icon: '🌿',
  },
  {
    name: 'Advanced',
    description: 'Challenge yourself',
    icon: '🌳',
  },
  {
    name: 'Mat Work',
    description: 'Classic floor exercises',
    icon: '🧘',
  },
  {
    name: 'Reformer',
    description: 'Equipment-based training',
    icon: '💪',
  },
  {
    name: 'Recovery',
    description: 'Gentle restoration',
    icon: '🌸',
  },
];

export default function LearnPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="badge-coming-soon mb-4">Coming Soon</span>
          <h1 className="mb-4">Learn Pilates</h1>
          <p className="text-muted max-w-md mx-auto">
            Explore tutorials and techniques for all levels. From beginner
            basics to advanced sequences.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {categories.map((category) => (
            <div
              key={category.name}
              className="card opacity-60 cursor-not-allowed"
            >
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="font-medium mb-1">{category.name}</h3>
              <p className="text-sm text-muted">{category.description}</p>
            </div>
          ))}
        </div>

        <div className="card mb-8">
          <h2 className="text-lg font-medium mb-4">Featured Content</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-lg bg-[rgba(246,237,221,0.05)] opacity-50"
              >
                <div className="w-20 h-14 bg-[rgba(246,237,221,0.1)] rounded flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3 bg-[rgba(246,237,221,0.1)] rounded w-3/4 mb-2" />
                  <div className="h-2 bg-[rgba(246,237,221,0.1)] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
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
