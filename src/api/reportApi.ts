import apiClient from './client';
import type { components } from '../types/api';

type ReportCreate = components['schemas']['ReportCreate'];
type ReportPublic = components['schemas']['ReportPublic'];
export type ReportTargetType = components['schemas']['ReportTargetType'];

export const REPORT_REASONS = [
  '스팸/광고',
  '부적절/혐오',
  '허위정보',
  '사칭',
  '저작권 침해',
  '기타',
] as const;

export type ReportReason = typeof REPORT_REASONS[number];

export async function createReport(payload: ReportCreate): Promise<ReportPublic> {
  const res = await apiClient.post<ReportPublic>('/reports', payload);
  return res.data;
}
