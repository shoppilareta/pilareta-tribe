import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudioFavorites, addStudioFavorite, removeStudioFavorite } from '@/api/studios';
import { useAuthStore } from '@/stores/authStore';

export function useStudioFavorites() {
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['studioFavorites'],
    queryFn: getStudioFavorites,
    enabled: isAuthenticated,
    staleTime: 30_000, // Consider data fresh for 30s to reduce refetches
  });

  const favoriteIds = data?.studioIds ?? [];
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const toggleMutation = useMutation({
    mutationFn: async (studioId: string) => {
      if (favoriteSet.has(studioId)) {
        return removeStudioFavorite(studioId);
      }
      return addStudioFavorite(studioId);
    },
    onMutate: async (studioId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['studioFavorites'] });
      const prev = queryClient.getQueryData<{ studioIds: string[] }>(['studioFavorites']);
      queryClient.setQueryData<{ studioIds: string[] }>(['studioFavorites'], (old) => {
        if (!old) return { studioIds: [studioId] };
        const exists = old.studioIds.includes(studioId);
        return {
          studioIds: exists
            ? old.studioIds.filter((id) => id !== studioId)
            : [studioId, ...old.studioIds],
        };
      });
      return { prev };
    },
    onError: (_err, _studioId, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['studioFavorites'], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['studioFavorites'] });
    },
  });

  const isFavorited = useCallback(
    (studioId: string) => favoriteSet.has(studioId),
    [favoriteSet],
  );

  const toggleFavorite = useCallback(
    (studioId: string) => toggleMutation.mutate(studioId),
    [toggleMutation],
  );

  return { isFavorited, toggleFavorite, favoriteIds };
}
