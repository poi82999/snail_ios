import apiClient from './client';
import { toApiError } from './errors';

function getFavoritePath(designId: string): string {
  return `/designs/${encodeURIComponent(designId)}/favorite`;
}

export async function addFavorite(designId: string): Promise<void> {
  try {
    await apiClient.post(getFavoritePath(designId));
  } catch (error) {
    throw toApiError(error);
  }
}

export async function removeFavorite(designId: string): Promise<void> {
  try {
    await apiClient.delete(getFavoritePath(designId));
  } catch (error) {
    throw toApiError(error);
  }
}
