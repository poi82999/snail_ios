// 비로그인 사용자가 게이트된 액션(찜/예약/스네일/팔로우)을 시도할 때 띄우는
// 전역 "로그인 필요" 모달의 표시 상태 저장소.
//
// React 밖(QueryClient의 MutationCache.onError 등)에서도 열 수 있어야 하므로
// 모듈 수준 스토어로 둔다. UI는 useLoginGate()로 구독한다.

type Listener = () => void;

let open = false;
const listeners = new Set<Listener>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function openLoginGate(): void {
  if (open) return; // 이미 열려 있으면 중복 통지하지 않는다
  open = true;
  emit();
}

export function closeLoginGate(): void {
  if (!open) return;
  open = false;
  emit();
}

export function getLoginGateState(): boolean {
  return open;
}

export function subscribeLoginGate(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
