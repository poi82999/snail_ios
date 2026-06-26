import { useMutation } from '@tanstack/react-query';
import { createShopInquiry } from '../api/inquiryApi';

export function useCreateShopInquiry() {
  return useMutation({
    mutationFn: ({ shopId, body, designId }: { shopId: string; body: string; designId?: string | null }) =>
      createShopInquiry(shopId, body, designId),
  });
}
