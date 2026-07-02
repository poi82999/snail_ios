import apiClient from './client';
import type { components, paths } from '../types/api';

function makeIdempotencyKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

type CreateOp = paths['/api/v1/shops/{shop_id}/inquiries']['post'];
type CreateBody = components['schemas']['ShopInquiryCreate'];
type InquiryPublic = components['schemas']['ShopInquiryPublic'];
type CreateResponse = CreateOp['responses'][201]['content']['application/json'];

export async function createShopInquiry(
  shopId: string,
  body: string,
  designId?: string | null
): Promise<InquiryPublic> {
  const payload: CreateBody = { body };
  if (designId) payload.design_id = designId;

  const response = await apiClient.post<CreateResponse>(
    `/shops/${shopId}/inquiries`,
    payload,
    { headers: { 'Idempotency-Key': makeIdempotencyKey() } }
  );
  return response.data;
}
