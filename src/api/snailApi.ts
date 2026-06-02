import apiClient from './client';
import type {
  Snap,
  SnapAuthor,
  SnapComment,
  SnapFeedType,
} from '../types';
import type { components, paths } from '../types/api';

type SnailsOperation = paths['/api/v1/snails']['get'];
type SnailsQuery = NonNullable<SnailsOperation['parameters']['query']>;
type SnailsResponse =
  SnailsOperation['responses'][200]['content']['application/json'];

type SnapDetailOperation = paths['/api/v1/snails/{snap_id}']['get'];
type SnapDetailResponse =
  SnapDetailOperation['responses'][200]['content']['application/json'];

type ToggleSnapLikeOperation = paths['/api/v1/snails/{snap_id}/like']['post'];
type SnapLikeToggleResponse =
  ToggleSnapLikeOperation['responses'][200]['content']['application/json'];

type ToggleSnapSaveOperation = paths['/api/v1/snails/{snap_id}/save']['post'];
type SnapSaveToggleResponse =
  ToggleSnapSaveOperation['responses'][200]['content']['application/json'];

type CommentsOperation = paths['/api/v1/snails/{snap_id}/comments']['get'];
type CommentsQuery = NonNullable<CommentsOperation['parameters']['query']>;
type CommentsResponse =
  CommentsOperation['responses'][200]['content']['application/json'];

type CreateCommentOperation = paths['/api/v1/snails/{snap_id}/comments']['post'];
type CreateCommentPayload =
  CreateCommentOperation['requestBody']['content']['application/json'];
type CreateCommentResponse =
  CreateCommentOperation['responses'][201]['content']['application/json'];

type ToggleCommentLikeOperation =
  paths['/api/v1/comments/{comment_id}/like']['post'];
export type CommentLikeToggleResponse =
  ToggleCommentLikeOperation['responses'][200]['content']['application/json'];

type ToggleFollowOperation = paths['/api/v1/users/{user_id}/follow']['post'];
export type FollowToggleResponse =
  ToggleFollowOperation['responses'][200]['content']['application/json'];

type SnapPublic = components['schemas']['SnapPublic'];
type CommentPublic = components['schemas']['CommentPublic'];
type UserPublic = components['schemas']['UserPublic'];

export interface SnailFeedPage {
  snaps: Snap[];
  nextCursor: string | null;
}

export interface SnapCommentsPage {
  comments: SnapComment[];
  nextCursor: string | null;
}

const SNAP_LIST_LIMIT = 20;
const COMMENT_LIST_LIMIT = 20;

function getSnapPath(snapId: string): string {
  return `/snails/${encodeURIComponent(snapId)}`;
}

function getSnapCommentsPath(snapId: string): string {
  return `${getSnapPath(snapId)}/comments`;
}

function mapAuthorToUi(author: UserPublic): SnapAuthor {
  return {
    id: author.id,
    nickname: author.nickname,
    profileImageUri: author.profile_image_url ?? '',
    bio: author.bio ?? undefined,
  };
}

function isSnapPublicResponse(
  response: SnapLikeToggleResponse | SnapSaveToggleResponse | SnapPublic
): response is SnapPublic {
  return 'author' in response && 'liked_by_me' in response && 'saved_by_me' in response;
}

export function mapSnapToUi(snap: SnapPublic): Snap {
  return {
    id: snap.id,
    author: mapAuthorToUi(snap.author),
    body: snap.body ?? '',
    tags: [...(snap.tags ?? [])],
    images: [...(snap.images ?? [])],
    taggedDesignId: snap.tagged_design_id ?? null,
    isReservationVerified: snap.is_reservation_verified,
    likeCount: snap.like_count,
    commentCount: snap.comment_count,
    saveCount: snap.save_count,
    viewCount: snap.view_count,
    likedByMe: snap.liked_by_me,
    savedByMe: snap.saved_by_me,
    createdAt: snap.created_at,
  };
}

export function mapCommentToUi(comment: CommentPublic): SnapComment {
  return {
    id: comment.id,
    snapId: comment.snap_id,
    parentId: comment.parent_id ?? null,
    authorName: comment.author.display_name,
    body: comment.body,
    depth: comment.depth,
    likeCount: comment.like_count,
    likedByMe: comment.liked_by_me,
    createdAt: comment.created_at,
  };
}

export async function fetchSnails(
  feedType: SnapFeedType,
  cursor?: string | null
): Promise<SnailFeedPage> {
  const params: SnailsQuery = {
    feed_type: feedType,
    limit: SNAP_LIST_LIMIT,
  };

  if (cursor !== undefined && cursor !== null) {
    params.cursor = cursor;
  }

  const response = await apiClient.get<SnailsResponse>('/snails', { params });

  return {
    snaps: response.data.items.map(mapSnapToUi),
    nextCursor: response.data.next_cursor ?? null,
  };
}

export async function fetchSnapDetail(snapId: string): Promise<Snap> {
  const response = await apiClient.get<SnapDetailResponse>(getSnapPath(snapId));

  return mapSnapToUi(response.data);
}

export async function toggleSnapLike(
  snapId: string
): Promise<Snap | void> {
  const response = await apiClient.post<SnapLikeToggleResponse | SnapPublic>(
    `${getSnapPath(snapId)}/like`
  );

  if (isSnapPublicResponse(response.data)) {
    return mapSnapToUi(response.data);
  }

  return undefined;
}

export async function toggleSnapSave(
  snapId: string
): Promise<Snap | void> {
  const response = await apiClient.post<SnapSaveToggleResponse | SnapPublic>(
    `${getSnapPath(snapId)}/save`
  );

  if (isSnapPublicResponse(response.data)) {
    return mapSnapToUi(response.data);
  }

  return undefined;
}

export async function fetchComments(
  snapId: string,
  cursor?: string | null
): Promise<SnapCommentsPage> {
  const params: CommentsQuery = {
    limit: COMMENT_LIST_LIMIT,
  };

  if (cursor !== undefined && cursor !== null) {
    params.cursor = cursor;
  }

  const response = await apiClient.get<CommentsResponse>(
    getSnapCommentsPath(snapId),
    { params }
  );

  // 현재 OpenAPI는 댓글 목록을 배열로 내려준다. next_cursor가 추가되면 생성 타입 갱신 후 매핑을 확장한다.
  return {
    comments: response.data.map(mapCommentToUi),
    nextCursor: null,
  };
}

export async function createComment(
  snapId: string,
  body: string,
  parentId?: string | null
): Promise<SnapComment> {
  const payload: CreateCommentPayload =
    parentId !== undefined ? { body, parent_id: parentId } : { body };
  const response = await apiClient.post<CreateCommentResponse>(
    getSnapCommentsPath(snapId),
    payload
  );

  return mapCommentToUi(response.data);
}

export async function toggleCommentLike(
  commentId: string
): Promise<CommentLikeToggleResponse> {
  const response = await apiClient.post<CommentLikeToggleResponse>(
    `/comments/${encodeURIComponent(commentId)}/like`
  );

  return response.data;
}

export async function toggleFollow(userId: string): Promise<FollowToggleResponse> {
  const response = await apiClient.post<FollowToggleResponse>(
    `/users/${encodeURIComponent(userId)}/follow`
  );

  return response.data;
}
