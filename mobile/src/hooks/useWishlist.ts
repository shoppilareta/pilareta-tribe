import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlist, addToWishlist, removeFromWishlist } from '@/api/shop';
import { useAuthStore } from '@/stores/authStore';

export function useWishlist() {
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
    enabled: isAuthenticated,
  });

  const wishlistHandles = data?.handles ?? [];
  const wishlistSet = new Set(wishlistHandles);

  const toggleMutation = useMutation({
    mutationFn: async (handle: string) => {
      if (wishlistSet.has(handle)) {
        return removeFromWishlist(handle);
      }
      return addToWishlist(handle);
    },
    onMutate: async (handle) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const prev = queryClient.getQueryData<{ handles: string[] }>(['wishlist']);
      queryClient.setQueryData<{ handles: string[] }>(['wishlist'], (old) => {
        if (!old) return { handles: [handle] };
        const exists = old.handles.includes(handle);
        return {
          handles: exists
            ? old.handles.filter((h) => h !== handle)
            : [handle, ...old.handles],
        };
      });
      return { prev };
    },
    onError: (_err, _handle, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['wishlist'], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const isWishlisted = useCallback(
    (handle: string) => wishlistSet.has(handle),
    [wishlistHandles],
  );

  const toggleWishlist = useCallback(
    (handle: string) => toggleMutation.mutate(handle),
    [toggleMutation],
  );

  return { isWishlisted, toggleWishlist, wishlistHandles };
}
