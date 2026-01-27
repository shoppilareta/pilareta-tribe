import Link from 'next/link';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

// Force dynamic rendering to check session state
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();
  const isLoggedIn = !!session.userId;

  // Fetch some stats for the tiles
  const [studioCount, exerciseCount, programCount, postCount, recentPosts, userWorkoutStats] = await Promise.all([
    prisma.studio.count(),
    prisma.exercise.count(),
    prisma.program.count({ where: { isPublished: true } }),
    prisma.ugcPost.count({ where: { status: 'approved' } }),
    prisma.ugcPost.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        mediaUrl: true,
        mediaType: true,
        thumbnailUrl: true,
        instagramUrl: true,
        postType: true,
        workoutRecap: {
          select: {
            id: true,
            workoutDate: true,
            durationMinutes: true,
            workoutType: true,
            rpe: true,
            calorieEstimate: true,
            focusAreas: true,
          },
        },
      },
    }),
    isLoggedIn && session.userId
      ? prisma.userWorkoutStats.findUnique({
          where: { userId: session.userId },
          select: {
            currentStreak: true,
            totalWorkouts: true,
            weeklyMinutes: true,
          },
        })
      : null,
  ]);

  // Helper to transform media URLs
  const transformMediaUrl = (url: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith('/uploads/')) {
      return '/api' + url;
    }
    return url;
  };

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
      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        {/* Studio Locator */}
        <section className="card">
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6eddd" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>Studio Locator</h2>
            </div>
            <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', margin: 0 }}>
              Discover Pilates studios near you with Google Maps integration
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                background: 'rgba(246, 237, 221, 0.05)',
                padding: '1rem',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 500, color: '#f6eddd' }}>
                {studioCount > 0 ? studioCount : '50+'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.5)' }}>Studios Listed</div>
            </div>
            <div
              style={{
                background: 'rgba(246, 237, 221, 0.05)',
                padding: '1rem',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 500, color: '#f6eddd' }}>10+</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.5)' }}>Cities</div>
            </div>
          </div>

          {/* Features */}
          <ul style={{ margin: '0 0 1.5rem', padding: 0, listStyle: 'none' }}>
            {['Search by location or near me', 'View ratings & opening hours', 'Claim or suggest edits'].map((feature) => (
              <li
                key={feature}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'rgba(246, 237, 221, 0.7)',
                  marginBottom: '0.5rem',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href="/studio-locator"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.875rem', padding: '0.75rem' }}
          >
            Find Studios
          </Link>
        </section>

        {/* Learn Pilates */}
        <section className="card">
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6eddd" strokeWidth="1.5">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>Learn Pilates</h2>
            </div>
            <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', margin: 0 }}>
              Exercise library, programs, and guided sessions
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                background: 'rgba(246, 237, 221, 0.05)',
                padding: '0.75rem',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 500, color: '#f6eddd' }}>{exerciseCount}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Exercises</div>
            </div>
            <div
              style={{
                background: 'rgba(246, 237, 221, 0.05)',
                padding: '0.75rem',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 500, color: '#f6eddd' }}>{programCount}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Programs</div>
            </div>
            <div
              style={{
                background: 'rgba(246, 237, 221, 0.05)',
                padding: '0.75rem',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 500, color: '#f6eddd' }}>4</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Weeks Each</div>
            </div>
          </div>

          {/* Features */}
          <ul style={{ margin: '0 0 1.5rem', padding: 0, listStyle: 'none' }}>
            {['Detailed exercise instructions', 'Beginner to advanced programs', 'Custom session builder'].map((feature) => (
              <li
                key={feature}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'rgba(246, 237, 221, 0.7)',
                  marginBottom: '0.5rem',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href="/learn"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.875rem', padding: '0.75rem' }}
          >
            Start Learning
          </Link>
        </section>

        {/* Track My Workouts */}
        <section className="card">
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: userWorkoutStats?.currentStreak
                    ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(239, 68, 68, 0.2) 100%)'
                    : 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {userWorkoutStats?.currentStreak ? (
                  <span style={{ fontSize: '1.25rem' }}>🔥</span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6eddd" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                )}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>Track My Workouts</h2>
            </div>
            <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', margin: 0 }}>
              Log workouts, build streaks, and track your progress
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                background: userWorkoutStats?.currentStreak
                  ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)'
                  : 'rgba(246, 237, 221, 0.05)',
                padding: '0.75rem',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 500, color: '#f6eddd' }}>
                {userWorkoutStats?.currentStreak || 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Day Streak</div>
            </div>
            <div
              style={{
                background: 'rgba(246, 237, 221, 0.05)',
                padding: '0.75rem',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 500, color: '#f6eddd' }}>
                {userWorkoutStats?.totalWorkouts || 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Workouts</div>
            </div>
            <div
              style={{
                background: 'rgba(246, 237, 221, 0.05)',
                padding: '0.75rem',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 500, color: '#f6eddd' }}>
                {userWorkoutStats?.weeklyMinutes || 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Min/Week</div>
            </div>
          </div>

          {/* Features */}
          <ul style={{ margin: '0 0 1.5rem', padding: 0, listStyle: 'none' }}>
            {['Quick 10-second logging', 'Streak tracking with goals', 'Share recap cards to Community'].map((feature) => (
              <li
                key={feature}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'rgba(246, 237, 221, 0.7)',
                  marginBottom: '0.5rem',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href="/track"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.875rem', padding: '0.75rem' }}
          >
            {userWorkoutStats?.totalWorkouts ? 'View My Progress' : 'Start Tracking'}
          </Link>
        </section>

        {/* Community */}
        <section className="card">
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(246, 237, 221, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6eddd" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>Community</h2>
            </div>
            <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem', margin: 0 }}>
              Share your Pilates journey with the tribe
            </p>
          </div>

          {/* Feed preview */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              marginBottom: '1rem',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            {recentPosts.length > 0
              ? recentPosts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      aspectRatio: '1',
                      background: 'rgba(246, 237, 221, 0.05)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {post.postType === 'workout_recap' && post.workoutRecap ? (
                      // Workout recap mini preview
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: post.mediaUrl
                            ? undefined
                            : 'linear-gradient(145deg, #3D3426 0%, #2A2520 50%, #1F1B17 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        {post.mediaUrl && (
                          <>
                            <img
                              src={transformMediaUrl(post.mediaUrl)!}
                              alt=""
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(145deg, rgba(61, 52, 38, 0.85) 0%, rgba(42, 37, 32, 0.9) 50%, rgba(31, 27, 23, 0.95) 100%)',
                              }}
                            />
                          </>
                        )}
                        <div
                          style={{
                            position: 'relative',
                            zIndex: 2,
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#F6EDDD',
                            lineHeight: 1,
                          }}
                        >
                          {post.workoutRecap.durationMinutes}
                          <span style={{ fontSize: '0.6rem', fontWeight: 500, marginLeft: '2px' }}>min</span>
                        </div>
                        <div
                          style={{
                            position: 'relative',
                            zIndex: 2,
                            fontSize: '0.5rem',
                            color: '#9CAF88',
                            textTransform: 'uppercase',
                            marginTop: '4px',
                          }}
                        >
                          {post.workoutRecap.workoutType}
                        </div>
                      </div>
                    ) : post.mediaType === 'instagram' ? (
                      post.thumbnailUrl ? (
                        <img
                          src={post.thumbnailUrl}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="1.5"
                          >
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                        </div>
                      )
                    ) : (
                      <img
                        src={
                          post.mediaType === 'video' && post.thumbnailUrl
                            ? transformMediaUrl(post.thumbnailUrl)!
                            : transformMediaUrl(post.mediaUrl)!
                        }
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                  </div>
                ))
              : [1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1',
                      background: `rgba(246, 237, 221, ${0.03 + i * 0.01})`,
                    }}
                  />
                ))}
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginBottom: '1.5rem',
              padding: '0.75rem',
              background: 'rgba(246, 237, 221, 0.03)',
              borderRadius: '4px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 500, color: '#f6eddd' }}>
                {postCount > 0 ? postCount : 'New'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Posts</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 500, color: '#f6eddd' }}>10</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.5)' }}>Tags</div>
            </div>
          </div>

          {/* Features */}
          <ul style={{ margin: '0 0 1.5rem', padding: 0, listStyle: 'none' }}>
            {['Share photos & videos', 'Like, comment & save', 'Tag studios'].map((feature) => (
              <li
                key={feature}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'rgba(246, 237, 221, 0.7)',
                  marginBottom: '0.5rem',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href="/ugc"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.875rem', padding: '0.75rem' }}
          >
            Join the Community
          </Link>
        </section>

      </div>

      {/* Bottom CTA - only show when not logged in */}
      {!isLoggedIn && (
        <section style={{ textAlign: 'center', marginTop: '4rem' }}>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '1rem' }}>
            Already a Pilareta customer?
          </p>
          <a href="/api/auth/login" className="btn btn-outline">
            Sign in with your Pilareta account
          </a>
        </section>
      )}
    </div>
  );
}
