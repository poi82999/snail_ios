import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import type { RootStackParamList, SnapComment } from '../types';
import {
  useComments,
  useCreateComment,
  useSnapDetail,
  useToggleCommentLike,
  useToggleFollow,
  useToggleSnapLike,
  useToggleSnapSave,
} from '../hooks/useSnail';
import { getErrorMessage } from '../api/errors';
import { colors, shadows } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SnapDetail'>;

interface CommentLikeOverride {
  liked: boolean;
  likeCount: number;
}

function formatRelativeTime(createdAt: string): string {
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return '';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - createdTime) / 1000));
  if (diffSeconds < 60) return '방금 전';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  const date = new Date(createdAt);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}.${month}.${day}`;
}

function formatTag(tag: string): string {
  return tag.startsWith('#') ? tag : `#${tag}`;
}

function getOptimisticCount(baseCount: number, serverValue: boolean, currentValue: boolean): number {
  if (serverValue === currentValue) return baseCount;

  return Math.max(0, baseCount + (currentValue ? 1 : -1));
}

export default function SnapDetailScreen({ route, navigation }: Props) {
  const { snapId } = route.params;
  const { width } = useWindowDimensions();
  const {
    data: snap,
    isLoading,
    isError,
    refetch,
  } = useSnapDetail(snapId);
  const commentsQuery = useComments(snapId);
  const createComment = useCreateComment(snapId);
  const toggleSnapLike = useToggleSnapLike();
  const toggleSnapSave = useToggleSnapSave();
  const toggleCommentLike = useToggleCommentLike(snapId);
  const toggleFollow = useToggleFollow();

  const [galleryIndex, setGalleryIndex] = useState<number>(0);
  const [likedOverride, setLikedOverride] = useState<boolean | null>(null);
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
  const [followedOverride, setFollowedOverride] = useState<boolean | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentLikeOverrides, setCommentLikeOverrides] = useState<Record<string, CommentLikeOverride>>({});

  useEffect(() => {
    setGalleryIndex(0);
    setLikedOverride(null);
    setSavedOverride(null);
    setFollowedOverride(null);
    setCommentText('');
    setCommentError(null);
    setCommentLikeOverrides({});
  }, [snapId]);

  if (isLoading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white items-center justify-center`} edges={['top']}>
        <ActivityIndicator color={colors.secondary} />
      </SafeAreaView>
    );
  }

  if (isError || !snap) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white items-center justify-center`} edges={['top']}>
        <Text style={{ color: colors.secondary50, fontSize: 14 }}>불러오기에 실패했어요</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={tw`mt-[12px] px-[20px] py-[10px] rounded-[8px]`}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.secondary, fontSize: 14 }}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentSnap = snap;
  const galleryImages = currentSnap.images;
  const galleryCount = galleryImages.length;

  // 좋아요/저장은 서버값 위에 로컬 오버라이드를 얹어 탭 직후 수치를 반영한다.
  const liked = likedOverride ?? currentSnap.likedByMe;
  const likeCount = getOptimisticCount(currentSnap.likeCount, currentSnap.likedByMe, liked);
  const saved = savedOverride ?? currentSnap.savedByMe;
  const saveCount = getOptimisticCount(currentSnap.saveCount, currentSnap.savedByMe, saved);
  const commentBody = commentText.trim();
  const canSubmitComment = commentBody.length > 0 && !createComment.isPending;

  function handleGalleryMomentumEnd(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    if (galleryCount === 0 || width <= 0) return;

    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setGalleryIndex(Math.min(Math.max(nextIndex, 0), galleryCount - 1));
  }

  function handleToggleSnapLike(): void {
    const nextLiked = !liked;
    setLikedOverride(nextLiked);
    toggleSnapLike.mutate(currentSnap.id, {
      onError: () => setLikedOverride(null),
    });
  }

  function handleToggleSnapSave(): void {
    const nextSaved = !saved;
    setSavedOverride(nextSaved);
    toggleSnapSave.mutate(currentSnap.id, {
      onError: () => setSavedOverride(null),
    });
  }

  function handleToggleFollow(): void {
    const nextFollowed = !(followedOverride ?? false);
    setFollowedOverride(nextFollowed);
    toggleFollow.mutate(currentSnap.author.id, {
      onSuccess: (data) => setFollowedOverride(data.followed),
      onError: () => setFollowedOverride(null),
    });
  }

  function removeCommentLikeOverride(commentId: string): void {
    setCommentLikeOverrides((prev) => {
      const next = { ...prev };
      delete next[commentId];
      return next;
    });
  }

  function handleToggleCommentLike(comment: SnapComment): void {
    const current = commentLikeOverrides[comment.id] ?? {
      liked: comment.likedByMe,
      likeCount: comment.likeCount,
    };
    const nextLiked = !current.liked;
    const nextLikeCount = Math.max(0, current.likeCount + (nextLiked ? 1 : -1));

    setCommentLikeOverrides((prev) => ({
      ...prev,
      [comment.id]: {
        liked: nextLiked,
        likeCount: nextLikeCount,
      },
    }));
    toggleCommentLike.mutate(comment.id, {
      onSuccess: (data) => {
        setCommentLikeOverrides((prev) => ({
          ...prev,
          [comment.id]: {
            liked: data.liked,
            likeCount: data.like_count,
          },
        }));
      },
      onError: () => removeCommentLikeOverride(comment.id),
    });
  }

  function handleSubmitComment(): void {
    if (!canSubmitComment) return;

    createComment.mutate(
      { body: commentBody },
      {
        onSuccess: () => {
          setCommentText('');
          setCommentError(null);
        },
        onError: (error) => setCommentError(getErrorMessage(error)),
      }
    );
  }

  function renderAvatar(uri: string, size: number): React.ReactElement {
    if (uri.length > 0) {
      return (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.disabled }}
          resizeMode="cover"
        />
      );
    }

    return (
      <View
        style={[
          tw`items-center justify-center`,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.disabled },
        ]}
      >
        <Ionicons name="person-outline" size={Math.floor(size * 0.55)} color={colors.secondary50} />
      </View>
    );
  }

  function renderGalleryImage({ item }: { item: string }): React.ReactElement {
    return (
      <Image
        source={{ uri: item }}
        style={{ width, aspectRatio: 1, backgroundColor: colors.disabled }}
        resizeMode="cover"
      />
    );
  }

  function renderGallery(): React.ReactElement {
    if (galleryCount === 0) {
      return (
        <View style={[tw`items-center justify-center`, { width, aspectRatio: 1, backgroundColor: colors.disabled }]}>
          <Ionicons name="image-outline" size={40} color={colors.secondary50} />
        </View>
      );
    }

    return (
      <View>
        <FlatList
          data={galleryImages}
          horizontal
          pagingEnabled
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={renderGalleryImage}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleGalleryMomentumEnd}
        />
        <View
          style={[
            tw`absolute right-[14px] bottom-[14px] px-[9px] py-[4px] rounded-[12px]`,
            { backgroundColor: 'rgba(0,0,0,0.45)' },
          ]}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
            {galleryIndex + 1}/{galleryCount}
          </Text>
        </View>
      </View>
    );
  }

  function renderTags(): React.ReactElement | null {
    if (currentSnap.tags.length === 0) return null;

    return (
      <View style={tw`flex-row flex-wrap gap-[8px] mt-[12px]`}>
        {currentSnap.tags.map((tag, index) => (
          <View
            key={`${tag}-${index}`}
            style={[
              tw`px-[10px] py-[5px] rounded-[12px]`,
              { backgroundColor: colors.secondary50 },
            ]}
          >
            <Text style={{ color: colors.background, fontSize: 12 }}>{formatTag(tag)}</Text>
          </View>
        ))}
      </View>
    );
  }

  function renderTaggedDesign(): React.ReactElement | null {
    const taggedDesignId = currentSnap.taggedDesignId;
    if (!taggedDesignId) return null;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('DesignDetail', { designId: taggedDesignId })}
        activeOpacity={0.85}
        style={[
          tw`mx-[20px] mb-[18px] p-[14px] rounded-[8px] flex-row items-center justify-between`,
          { backgroundColor: colors.background, borderColor: colors.line, borderWidth: 1 },
          shadows.card,
        ]}
      >
        <View style={tw`flex-row items-center flex-1 pr-[12px]`}>
          <View
            style={[
              tw`w-[44px] h-[44px] rounded-[8px] items-center justify-center mr-[11px]`,
              { backgroundColor: colors.disabled },
            ]}
          >
            <Ionicons name="color-palette-outline" size={23} color={colors.secondary} />
          </View>
          <View style={tw`flex-1`}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>태그된 디자인</Text>
            <Text style={{ color: colors.text, fontSize: 12, marginTop: 3 }} numberOfLines={1}>
              마음에 들면 바로 예약으로 이어갈 수 있어요
            </Text>
          </View>
        </View>
        <View style={[tw`h-[34px] px-[13px] rounded-[5px] items-center justify-center`, { backgroundColor: colors.secondary }]}>
          <Text style={{ color: colors.background, fontSize: 12, fontWeight: '700' }}>이 디자인 받기</Text>
        </View>
      </TouchableOpacity>
    );
  }

  function renderListHeader(): React.ReactElement {
    return (
      <View>
        <View style={tw`flex-row items-center justify-between px-[20px] py-[14px]`}>
          <View style={tw`flex-row items-center flex-1 pr-[12px]`}>
            {renderAvatar(currentSnap.author.profileImageUri, 42)}
            <View style={tw`ml-[10px] flex-1`}>
              <View style={tw`flex-row items-center`}>
                <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                  {currentSnap.author.nickname}
                </Text>
                {currentSnap.isReservationVerified && (
                  <View
                    style={[
                      tw`ml-[7px] px-[7px] py-[3px] rounded-[10px] flex-row items-center`,
                      { backgroundColor: colors.secondary },
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={11} color={colors.background} />
                    <Text style={{ color: colors.background, fontSize: 10, fontWeight: '700', marginLeft: 3 }}>예약 인증</Text>
                  </View>
                )}
              </View>
              <Text style={{ color: colors.secondary50, fontSize: 12, marginTop: 3 }}>
                {formatRelativeTime(currentSnap.createdAt)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleToggleFollow}
            disabled={toggleFollow.isPending}
            activeOpacity={0.75}
            style={[
              tw`h-[32px] px-[14px] rounded-[16px] items-center justify-center`,
              {
                backgroundColor: followedOverride ? colors.secondary : colors.background,
                borderColor: colors.secondary,
                borderWidth: 1,
                opacity: toggleFollow.isPending ? 0.55 : 1,
              },
            ]}
          >
            <Text style={{ color: followedOverride ? colors.background : colors.secondary, fontSize: 12, fontWeight: '700' }}>
              {followedOverride ? '팔로잉' : '팔로우'}
            </Text>
          </TouchableOpacity>
        </View>

        {renderGallery()}

        <View style={[tw`flex-row items-center justify-between px-[20px] py-[13px]`, shadows.subtle]}>
          <View style={tw`flex-row items-center gap-[18px]`}>
            <TouchableOpacity
              onPress={handleToggleSnapLike}
              disabled={toggleSnapLike.isPending}
              activeOpacity={0.7}
              style={tw`items-center gap-y-[2px]`}
            >
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={28} color={liked ? colors.danger : colors.secondary} />
              <Text style={{ color: colors.secondary, fontSize: 9 }}>{likeCount.toLocaleString('ko-KR')}</Text>
            </TouchableOpacity>
            <View style={tw`items-center gap-y-[2px]`}>
              <Ionicons name="chatbubble-outline" size={27} color={colors.secondary} />
              <Text style={{ color: colors.secondary, fontSize: 9 }}>{currentSnap.commentCount.toLocaleString('ko-KR')}</Text>
            </View>
            <TouchableOpacity
              onPress={handleToggleSnapSave}
              disabled={toggleSnapSave.isPending}
              activeOpacity={0.7}
              style={tw`items-center gap-y-[2px]`}
            >
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={27} color={saved ? colors.secondary : colors.secondary} />
              <Text style={{ color: colors.secondary, fontSize: 9 }}>{saveCount.toLocaleString('ko-KR')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.7} style={tw`items-center gap-y-[2px]`}>
            <Ionicons name="share-social-outline" size={27} color={colors.secondary} />
            <Text style={{ color: colors.secondary, fontSize: 9 }}>공유</Text>
          </TouchableOpacity>
        </View>

        <View style={tw`px-[20px] py-[16px]`}>
          {currentSnap.body.length > 0 && (
            <Text style={{ color: colors.primary, fontSize: 15, lineHeight: 22 }}>
              {currentSnap.body}
            </Text>
          )}
          {renderTags()}
        </View>

        {renderTaggedDesign()}

        <View style={[tw`px-[20px] pt-[16px] pb-[10px]`, { borderTopColor: colors.line, borderTopWidth: 1 }]}>
          <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>
            댓글 {currentSnap.commentCount.toLocaleString('ko-KR')}
          </Text>
        </View>
      </View>
    );
  }

  const renderComment: ListRenderItem<SnapComment> = ({ item }) => {
    const override = commentLikeOverrides[item.id];
    const commentLiked = override?.liked ?? item.likedByMe;
    const commentLikeCount = override?.likeCount ?? item.likeCount;
    const depth = Math.min(Math.max(item.depth, 0), 2);

    return (
      <View
        style={[
          tw`py-[12px] pr-[20px]`,
          {
            paddingLeft: 20 + depth * 18,
            borderBottomColor: colors.line,
            borderBottomWidth: 1,
          },
        ]}
      >
        <View style={tw`flex-row items-start`}>
          {depth > 0 && (
            <Ionicons
              name="return-down-forward-outline"
              size={14}
              color={colors.secondary50}
              style={{ marginRight: 6, marginTop: 3 }}
            />
          )}
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center flex-1 pr-[8px]`}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
                  {item.authorName}
                </Text>
                <Text style={{ color: colors.secondary50, fontSize: 11, marginLeft: 7 }}>
                  {formatRelativeTime(item.createdAt)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleToggleCommentLike(item)}
                activeOpacity={0.7}
                style={tw`flex-row items-center`}
              >
                <Ionicons
                  name={commentLiked ? 'heart' : 'heart-outline'}
                  size={18}
                  color={commentLiked ? colors.danger : colors.secondary50}
                />
                <Text style={{ color: colors.secondary50, fontSize: 11, marginLeft: 3 }}>
                  {commentLikeCount.toLocaleString('ko-KR')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 5 }}>
              {item.body}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  function renderCommentsEmpty(): React.ReactElement | null {
    if (commentsQuery.isLoading) {
      return (
        <View style={tw`py-[28px] items-center justify-center`}>
          <ActivityIndicator color={colors.secondary} />
        </View>
      );
    }

    if (commentsQuery.isError) {
      return (
        <View style={tw`py-[28px] items-center justify-center`}>
          <Text style={{ color: colors.secondary50, fontSize: 14 }}>댓글을 불러오지 못했어요</Text>
          <TouchableOpacity onPress={() => void commentsQuery.refetch()} activeOpacity={0.7} style={tw`mt-[10px] px-[16px] py-[8px]`}>
            <Text style={{ color: colors.secondary, fontSize: 13, fontWeight: '700' }}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={tw`py-[28px] items-center justify-center`}>
        <Text style={{ color: colors.secondary50, fontSize: 14 }}>첫 댓글을 남겨보세요</Text>
      </View>
    );
  }

  function renderCommentsFooter(): React.ReactElement {
    return (
      <View style={tw`pb-[18px]`}>
        {commentsQuery.hasNextPage && (
          <TouchableOpacity
            onPress={() => void commentsQuery.fetchNextPage()}
            disabled={commentsQuery.isFetchingNextPage}
            activeOpacity={0.75}
            style={tw`mx-[20px] mt-[14px] h-[38px] rounded-[8px] items-center justify-center`}
          >
            {commentsQuery.isFetchingNextPage ? (
              <ActivityIndicator color={colors.secondary} />
            ) : (
              <Text style={{ color: colors.secondary, fontSize: 13, fontWeight: '700' }}>댓글 더 보기</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={tw`flex-row items-center justify-between px-[22px] h-[54px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={commentsQuery.comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderCommentsEmpty}
        ListFooterComponent={renderCommentsFooter}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={() => {
          if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
            void commentsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[tw`px-[14px] pt-[10px] pb-[10px]`, { backgroundColor: colors.background, ...shadows.bar }]}>
          {commentError && (
            <Text style={{ color: colors.danger, fontSize: 12, marginBottom: 7 }}>
              {commentError}
            </Text>
          )}
          <View style={tw`flex-row items-center gap-[8px]`}>
            <TextInput
              value={commentText}
              onChangeText={(text) => {
                setCommentText(text);
                if (commentError) setCommentError(null);
              }}
              placeholder="댓글을 입력하세요"
              placeholderTextColor={colors.disabled}
              returnKeyType="send"
              onSubmitEditing={() => handleSubmitComment()}
              editable={!createComment.isPending}
              style={[
                tw`flex-1 min-h-[38px] max-h-[88px] px-[12px] py-[8px] rounded-[8px]`,
                {
                  borderColor: colors.line,
                  borderWidth: 1,
                  color: colors.primary,
                  fontSize: 14,
                },
              ]}
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!canSubmitComment}
              activeOpacity={0.75}
              style={[
                tw`h-[38px] px-[13px] rounded-[8px] flex-row items-center justify-center`,
                { backgroundColor: canSubmitComment ? colors.secondary : colors.disabled },
              ]}
            >
              {createComment.isPending ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={15} color={colors.background} />
                  <Text style={{ color: colors.background, fontSize: 13, fontWeight: '700', marginLeft: 5 }}>보내기</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
