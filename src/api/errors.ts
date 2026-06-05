import axios, { type AxiosError } from 'axios';

export interface ApiErrorBody {
  code: string;
  message: string;
  field_errors?: Record<string, string> | null;
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
  request_id?: string;
}

export interface ApiErrorOptions {
  code: string;
  message: string;
  status?: number;
  requestId?: string;
  fieldErrors?: Record<string, string> | null;
  original?: unknown;
}

export class ApiError extends Error {
  code: string;
  status?: number;
  requestId?: string;
  fieldErrors: Record<string, string> | null;
  original?: unknown;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    Object.setPrototypeOf(this, ApiError.prototype);

    this.name = 'ApiError';
    this.code = options.code;
    this.status = options.status;
    this.requestId = options.requestId;
    this.fieldErrors = options.fieldErrors ?? null;
    this.original = options.original;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFieldErrors(value: unknown): value is Record<string, string> {
  if (!isRecord(value)) return false;

  return Object.keys(value).every((key) => typeof value[key] === 'string');
}

function parseApiErrorResponse(data: unknown): ApiErrorResponse | null {
  if (!isRecord(data) || !isRecord(data.error)) return null;

  const code = data.error.code;
  const message = data.error.message;

  if (typeof code !== 'string' || typeof message !== 'string') return null;

  const fieldErrors = isFieldErrors(data.error.field_errors)
    ? data.error.field_errors
    : null;
  const requestId = typeof data.request_id === 'string' ? data.request_id : undefined;

  return {
    error: {
      code,
      message,
      field_errors: fieldErrors,
    },
    request_id: requestId,
  };
}

function fromAxiosError(error: AxiosError<unknown>): ApiError {
  const status = error.response?.status ?? error.status;
  const apiErrorResponse = parseApiErrorResponse(error.response?.data);

  if (apiErrorResponse) {
    return new ApiError({
      code: apiErrorResponse.error.code,
      message: apiErrorResponse.error.message,
      status,
      requestId: apiErrorResponse.request_id,
      fieldErrors: apiErrorResponse.error.field_errors,
      original: error,
    });
  }

  return new ApiError({
    code: status ? 'HTTP_ERROR' : error.code ?? 'NETWORK_ERROR',
    message: error.message || '요청 처리 중 오류가 발생했습니다.',
    status,
    original: error,
  });
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<unknown>(error)) {
    return fromAxiosError(error);
  }

  if (error instanceof Error) {
    return new ApiError({
      code: 'UNKNOWN_ERROR',
      message: error.message,
      original: error,
    });
  }

  return new ApiError({
    code: 'UNKNOWN_ERROR',
    message: '알 수 없는 오류가 발생했습니다.',
    original: error,
  });
}

export { getErrorMessage, ERROR_MESSAGES } from './errorMessages';
