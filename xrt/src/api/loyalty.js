import { apiClient } from './client';

const unwrapResponseData = (payload) => payload?.data ?? payload ?? {};

export const lookupPoints = async (phone) => {
  const { data } = await apiClient.post('/loyalty/lookup', { phone });
  return unwrapResponseData(data);
};

export const joinLoyalty = async ({ phone, name, email }) => {
  const { data } = await apiClient.post('/loyalty/join', { phone, name, email });
  return unwrapResponseData(data);
};

export const redeemPoints = async ({ phone, points_to_redeem, subtotal }) => {
  const { data } = await apiClient.post('/loyalty/redeem', { phone, points_to_redeem, subtotal });
  return unwrapResponseData(data);
};
