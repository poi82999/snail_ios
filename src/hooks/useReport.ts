import { useMutation } from '@tanstack/react-query';
import { createReport, type ReportTargetType, type ReportReason } from '../api/reportApi';

export function useCreateReport() {
  return useMutation({
    mutationFn: ({
      targetType,
      targetId,
      reason,
      detail,
    }: {
      targetType: ReportTargetType;
      targetId: string;
      reason: ReportReason;
      detail?: string;
    }) =>
      createReport({
        target_type: targetType,
        target_id: targetId,
        reason,
        detail: detail || null,
      }),
  });
}
