import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';

import {
  createComment,
  fetchComments,
  fetchSnapDetail,
  fetchSnails,
  toggleCommentLike,
  toggleFollow,
  toggleSnapLike,
  toggleSnapSave,
  type CommentLikeToggleResponse,
  type FollowToggleResponse,
  type SnailFeedPage,
  type SnapCommentsPage,
} from '../api/snailApi';
import type { ApiError } from '../api/errors';
import type { Snap, SnapComment, SnapFeedType } from '../types';

type SnailFeedQueryKey = readonly ['snails', SnapFeedType];
type ShopSnailsQueryKey = readonly ['snails', 'shop', string];
type DesignSnailsQueryKey = readonly ['snails', 'design', string];
type CommentsQueryKey = readonly ['snap', string, 'comments'];

type SnailFeedQueryResult = UseInfiniteQueryResult<
  InfiniteData<SnailFeedPage>,
  ApiError
>;
type CommentsQueryResult = UseInfiniteQueryResult<
  InfiniteData<SnapCommentsPage>,
  ApiError
>;

export type UseSnailFeedResult = SnailFeedQueryResult & {
  snaps: Snap[];
  query: SnailFeedQueryResult;
};

export type UseCommentsResult = CommentsQueryResult & {
  comments: SnapComment[];
  query: CommentsQueryResult;
};

export interface CreateCommentVariables {
  body: string;
  parentId?: string | null;
}

export function useSnailFeed(feedType: SnapFeedType): UseSnailFeedResult {
  const query = useInfiniteQuery<
    SnailFeedPage,
    ApiError,
    InfiniteData<SnailFeedPage>,
    SnailFeedQueryKey,
    string | null
  >({
    queryKey: ['snails', feedType],
    queryFn: ({ pageParam }) => fetchSnails({ feedType, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return {
    ...query,
    snaps: query.data?.pages.flatMap((page) => page.snaps) ?? [],
    query,
  };
}

export function useShopSnails(shopId: string): UseSnailFeedResult {
  const query = useInfiniteQuery<
    SnailFeedPage,
    ApiError,
    InfiniteData<SnailFeedPage>,
    ShopSnailsQueryKey,
    string | null
  >({
    queryKey: ['snails', 'shop', shopId],
    queryFn: ({ pageParam }) => fetchSnails({ taggedShopId: shopId, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(shopId),
  });

  return {
    ...query,
    snaps: query.data?.pages.flatMap((page) => page.snaps) ?? [],
    query,
  };
}

export function useDesignSnails(designId: string): UseSnailFeedResult {
  const query = useInfiniteQuery<
    SnailFeedPage,
    ApiError,
    InfiniteData<SnailFeedPage>,
    DesignSnailsQueryKey,
    string | null
  >({
    queryKey: ['snails', 'design', designId],
    queryFn: ({ pageParam }) => fetchSnails({ taggedDesignId: designId, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(designId),
  });

  return {
    ...query,
    snaps: query.data?.pages.flatMap((page) => page.snaps) ?? [],
    query,
  };
}

export function useSnapDetail(snapId: string) {
  return useQuery<Snap, ApiError>({
    queryKey: ['snap', snapId],
    queryFn: () => fetchSnapDetail(snapId),
    enabled: Boolean(snapId),
  });
}

export function useToggleSnapLike() {
  const queryClient = useQueryClient();

  return useMutation<Snap | void, ApiError, string>({
    mutationFn: (snapId) => toggleSnapLike(snapId),
    onSettled: (_data, _error, snapId) => {
      queryClient.invalidateQueries({ queryKey: ['snails'] });
      queryClient.invalidateQueries({ queryKey: ['snap', snapId] });
    },
  });
}

export function useToggleSnapSave() {
  const queryClient = useQueryClient();

  return useMutation<Snap | void, ApiError, string>({
    mutationFn: (snapId) => toggleSnapSave(snapId),
    onSettled: (_data, _error, snapId) => {
      queryClient.invalidateQueries({ queryKey: ['snails'] });
      queryClient.invalidateQueries({ queryKey: ['snap', snapId] });
    },
  });
}

export function useComments(snapId: string): UseCommentsResult {
  const query = useInfiniteQuery<
    SnapCommentsPage,
    ApiError,
    InfiniteData<SnapCommentsPage>,
    CommentsQueryKey,
    string | null
  >({
    queryKey: ['snap', snapId, 'comments'],
    queryFn: ({ pageParam }) => fetchComments(snapId, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(snapId),
  });

  return {
    ...query,
    comments: query.data?.pages.flatMap((page) => page.comments) ?? [],
    query,
  };
}

export function useCreateComment(snapId: string) {
  const queryClient = useQueryClient();

  return useMutation<SnapComment, ApiError, CreateCommentVariables>({
    mutationFn: ({ body, parentId }) => createComment(snapId, body, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snap', snapId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['snap', snapId] });
    },
  });
}

export function useToggleCommentLike(snapId: string) {
  const queryClient = useQueryClient();

  return useMutation<CommentLikeToggleResponse, ApiError, string>({
    mutationFn: (commentId) => toggleCommentLike(commentId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['snap', snapId, 'comments'] });
    },
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation<FollowToggleResponse, ApiError, string>({
    mutationFn: (userId) => toggleFollow(userId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['snails'] });
      queryClient.invalidateQueries({ queryKey: ['snap'] });
    },
  });
}
