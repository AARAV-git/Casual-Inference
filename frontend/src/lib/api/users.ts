import { apiClient, safeCall } from './client';

export interface UserListItem {
  id: string;
  activity_level: string;
  subscription_type: string;
}

export interface UserDetail {
  id: string;
  preference_vector: Record<string, number>;
}

export interface UserInteraction {
  timestamp: string;
  item_id: string;
  event_type: string;
  watch_duration: number;
}

const FALLBACK_LIST: UserListItem[] = [
  { id: 'usr-001', activity_level: 'high', subscription_type: 'premium' },
  { id: 'usr-002', activity_level: 'medium', subscription_type: 'free' },
  { id: 'usr-003', activity_level: 'low', subscription_type: 'premium' },
  { id: 'usr-004', activity_level: 'high', subscription_type: 'basic' },
  { id: 'usr-005', activity_level: 'medium', subscription_type: 'premium' },
  { id: 'usr-006', activity_level: 'low', subscription_type: 'free' },
  { id: 'usr-007', activity_level: 'high', subscription_type: 'premium' },
  { id: 'usr-008', activity_level: 'medium', subscription_type: 'basic' },
];

const FALLBACK_DETAIL: UserDetail = {
  id: 'usr-001',
  preference_vector: { comedy: 0.82, drama: 0.45, action: 0.67, documentary: 0.33, horror: 0.12, romance: 0.58, scifi: 0.74, thriller: 0.51 },
};

const FALLBACK_INTERACTIONS: UserInteraction[] = [
  { timestamp: '2024-12-01T10:15:00Z', item_id: 'item-101', event_type: 'watch', watch_duration: 3420 },
  { timestamp: '2024-12-01T11:30:00Z', item_id: 'item-205', event_type: 'watch', watch_duration: 1820 },
  { timestamp: '2024-12-01T12:00:00Z', item_id: 'item-102', event_type: 'skip', watch_duration: 15 },
  { timestamp: '2024-12-02T09:00:00Z', item_id: 'item-310', event_type: 'watch', watch_duration: 4560 },
  { timestamp: '2024-12-02T14:20:00Z', item_id: 'item-415', event_type: 'like', watch_duration: 2700 },
  { timestamp: '2024-12-03T08:45:00Z', item_id: 'item-102', event_type: 'watch', watch_duration: 5100 },
  { timestamp: '2024-12-03T16:00:00Z', item_id: 'item-520', event_type: 'watch', watch_duration: 900 },
];

export async function listUsers(params?: { search?: string }): Promise<UserListItem[]> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/users', { params });
    return data;
  }, FALLBACK_LIST);
}

export async function getUser(id: string): Promise<UserDetail> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  }, { ...FALLBACK_DETAIL, id });
}

export async function getUserInteractions(
  id: string,
  params?: { start_date?: string; end_date?: string; limit?: number }
): Promise<UserInteraction[]> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/users/${id}/interactions`, { params });
    return data;
  }, FALLBACK_INTERACTIONS);
}
