import { CommunityClient } from '@/components/ugc';
import { isAuthenticated } from '@/lib/auth';

interface PageProps {
  searchParams: Promise<{ post?: string }>;
}

export default async function UgcPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const isLoggedIn = await isAuthenticated();
  const initialPostId = params.post;

  return (
    <CommunityClient
      isLoggedIn={isLoggedIn}
      initialPostId={initialPostId}
    />
  );
}
