import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { lookupPoints, joinLoyalty, redeemPoints } from '../api/loyalty';
import { useToast } from './ToastContext';

export const LoyaltyContext = createContext();

const STORAGE_KEYS = {
  enrolled: 'xrt_loyalty_enrolled',
  phone: 'xrt_loyalty_phone',
  points: 'xrt_loyalty_points',
  settings: 'xrt_loyalty_settings',
};

const DEFAULT_SETTINGS = {
  is_active: false,
  redeem_rate: 0,
  min_points_to_redeem: 0,
  earn_rate: 0,
  max_discount_percent: 0,
};

const MIN_LOYALTY_PHONE_DIGITS = 7;
const REDEEM_SESSION_TIMEOUT_MS = 30 * 60 * 1000;

const normalizePhoneInput = (phone) => String(phone || '').replace(/\D/g, '');

const readStoredJson = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch (error) {
    console.warn(`[LoyaltyContext] Failed to parse ${key} from localStorage`, error);
    return fallback;
  }
};

const readStoredNumber = (key, fallback = 0) => {
  if (typeof window === 'undefined') return fallback;

  const raw = localStorage.getItem(key);
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
};

const readStoredBoolean = (key, fallback = false) => {
  if (typeof window === 'undefined') return fallback;

  const raw = localStorage.getItem(key);
  if (raw == null) return fallback;
  return raw === 'true';
};

const readStoredString = (key, fallback = '') => {
  if (typeof window === 'undefined') return fallback;
  return localStorage.getItem(key) || fallback;
};

const normalizeSettings = (data = {}) => ({
  is_active: data.is_active === true,
  redeem_rate: Number(data.redeem_rate ?? 0) || 0,
  min_points_to_redeem: Number(data.min_points_to_redeem ?? 0) || 0,
  earn_rate: Number(data.earn_rate ?? 0) || 0,
  max_discount_percent: Number(data.max_discount_percent ?? 0) || 0,
});

export const LoyaltyProvider = ({ children }) => {
  const storedSettings = readStoredJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  const initialStoredPhone = normalizePhoneInput(readStoredString(STORAGE_KEYS.phone, ''));
  const [isActive, setIsActive] = useState(storedSettings.is_active);
  const [isEnrolled, setIsEnrolled] = useState(() =>
    readStoredBoolean(STORAGE_KEYS.enrolled, false)
  );
  const [pointsBalance, setPointsBalance] = useState(() =>
    readStoredNumber(STORAGE_KEYS.points, 0)
  );
  const [discountValue, setDiscountValue] = useState(0);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [redeemRate, setRedeemRate] = useState(storedSettings.redeem_rate);
  const [minPointsToRedeem, setMinPointsToRedeem] = useState(
    storedSettings.min_points_to_redeem
  );
  const [earnRate, setEarnRate] = useState(storedSettings.earn_rate);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(
    storedSettings.max_discount_percent
  );
  const [lastPhone, setLastPhone] = useState(() =>
    initialStoredPhone
  );
  const [error, setError] = useState(null);
  const lastPhoneRef = useRef(initialStoredPhone);
  const redeemInFlightRef = useRef(false);
  const redeemExpiryTimerRef = useRef(null);
  
  const { showToast } = useToast() || { showToast: () => {} };

  const clearRedeemExpiryTimer = useCallback(() => {
    if (redeemExpiryTimerRef.current) {
      clearTimeout(redeemExpiryTimerRef.current);
      redeemExpiryTimerRef.current = null;
    }
  }, []);

  const resetCheckoutRedeemState = useCallback(() => {
    clearRedeemExpiryTimer();
    setDiscountValue(0);
    setPointsRedeemed(0);
    redeemInFlightRef.current = false;
  }, [clearRedeemExpiryTimer]);

  const persistSettings = useCallback((settingsPayload = {}) => {
    const nextSettings = normalizeSettings(settingsPayload);

    setIsActive(nextSettings.is_active);
    setRedeemRate(nextSettings.redeem_rate);
    setMinPointsToRedeem(nextSettings.min_points_to_redeem);
    setEarnRate(nextSettings.earn_rate);
    setMaxDiscountPercent(nextSettings.max_discount_percent);
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(nextSettings));

    return nextSettings;
  }, []);

  const persistMemberState = useCallback(({ phone = '', enrolled = false, points = 0 }) => {
    const normalizedPhone = normalizePhoneInput(phone);
    const hasValidPhone = normalizedPhone.length >= MIN_LOYALTY_PHONE_DIGITS;
    const nextPoints = Number(points) || 0;
    const nextPhone = hasValidPhone ? normalizedPhone : '';
    const phoneChanged = lastPhoneRef.current !== nextPhone;

    if (phoneChanged) {
      resetCheckoutRedeemState();
    }

    setIsEnrolled(Boolean(enrolled));
    setPointsBalance(nextPoints);
    setLastPhone(nextPhone);
    lastPhoneRef.current = nextPhone;

    if (hasValidPhone) {
      localStorage.setItem(STORAGE_KEYS.phone, nextPhone);
    } else {
      localStorage.removeItem(STORAGE_KEYS.phone);
    }

    localStorage.setItem(STORAGE_KEYS.enrolled, Boolean(enrolled).toString());
    localStorage.setItem(STORAGE_KEYS.points, String(nextPoints));

    if (!enrolled) {
      resetCheckoutRedeemState();
    }
  }, [resetCheckoutRedeemState]);

  const refreshBalanceForPhone = useCallback(async (phone) => {
    const normalizedPhone = normalizePhoneInput(phone);
    if (!normalizedPhone || normalizedPhone.length < MIN_LOYALTY_PHONE_DIGITS) return;

    try {
      const result = await lookupPoints(normalizedPhone);
      const data = result || {};
      persistSettings(data);
      persistMemberState({
        phone: normalizedPhone,
        enrolled: Boolean(data.isEnrolled),
        points: data.points_balance ?? 0,
      });
    } catch (error) {
      console.warn('[LoyaltyContext] Failed to refresh loyalty balance after order', error);
    }
  }, [persistMemberState, persistSettings]);

  const lookup = useCallback(async (phone) => {
    const rawPhone = String(phone || '').trim();
    const normalizedPhone = normalizePhoneInput(rawPhone);
    
    setIsLoading(true);
    setError(null);

    if (rawPhone && normalizedPhone.length < MIN_LOYALTY_PHONE_DIGITS) {
      persistMemberState({ phone: '', enrolled: false, points: 0 });
      setIsLoading(false);
      return;
    }

    if (normalizedPhone && normalizedPhone !== lastPhoneRef.current) {
      setIsEnrolled(false);
      setPointsBalance(0);
      resetCheckoutRedeemState();
    }

    try {
      const result = await lookupPoints(normalizedPhone);
      const data = result || {};

      persistSettings(data);

      if (!normalizedPhone) {
        persistMemberState({ phone: '', enrolled: false, points: 0 });
        return;
      }

      persistMemberState({
        phone: normalizedPhone,
        enrolled: Boolean(data.isEnrolled),
        points: data.points_balance ?? 0,
      });
    } catch (err) {
      console.error('Loyalty lookup failed:', err);
      const msg = err.response?.data?.message || 'Failed to load loyalty data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [persistMemberState, persistSettings, resetCheckoutRedeemState]);

  // Initial status check
  useEffect(() => {
    lookup(readStoredString(STORAGE_KEYS.phone, ''));
  }, [lookup]);

  const join = useCallback(async ({ phone, name, email }) => {
    const normalizedPhone = normalizePhoneInput(phone);
    const trimmedName = String(name || '').trim();
    const trimmedEmail = String(email || '').trim();

    if (normalizedPhone.length < MIN_LOYALTY_PHONE_DIGITS) {
      const msg = 'Please enter a valid phone number first';
      setError(msg);
      showToast(msg);
      return false;
    }

    if (!trimmedName) {
      const msg = 'Please enter your name first';
      setError(msg);
      showToast(msg);
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await joinLoyalty({
        phone: normalizedPhone,
        name: trimmedName,
        email: trimmedEmail || undefined,
      });
      const data = result || {};

      persistMemberState({
        phone: normalizedPhone,
        enrolled: true,
        points: data.points_balance ?? 0,
      });

      await lookup(normalizedPhone);
      showToast('Welcome to our Rewards Program!');
      return true;
    } catch (err) {
      console.error('Failed to join loyalty program:', err);
      const msg = err.response?.data?.message || 'Could not join loyalty program';
      showToast(msg);
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [lookup, persistMemberState, showToast]);

  const redeem = useCallback(async (phone, points, subtotal) => {
    const normalizedPhone = normalizePhoneInput(phone);
    const normalizedPoints = Math.floor(Number(points));
    const normalizedSubtotal = Number(subtotal);

    if (
      redeemInFlightRef.current ||
      !normalizedPhone ||
      !Number.isFinite(normalizedPoints) ||
      normalizedPoints <= 0 ||
      !Number.isFinite(normalizedSubtotal) ||
      normalizedSubtotal < 0
    ) {
      return false;
    }

    redeemInFlightRef.current = true;
    setIsLoading(true);
    try {
      const result = await redeemPoints({
        phone: normalizedPhone,
        points_to_redeem: normalizedPoints,
        subtotal: normalizedSubtotal,
      });
      const data = result || {};
      setDiscountValue(data.discount_value || 0);
      setPointsRedeemed(normalizedPoints);
      clearRedeemExpiryTimer();
      redeemExpiryTimerRef.current = setTimeout(() => {
        resetCheckoutRedeemState();
      }, REDEEM_SESSION_TIMEOUT_MS);
      return true;
    } catch (err) {
      console.error('Failed to redeem points:', err);
      const msg = err.response?.data?.message || 'Failed to redeem points';
      showToast(msg);
      return msg; // Return string so widget can display the exact rejection reason
    } finally {
      redeemInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [clearRedeemExpiryTimer, resetCheckoutRedeemState, showToast]);

  const resetDiscount = useCallback(() => {
    resetCheckoutRedeemState();
  }, [resetCheckoutRedeemState]);

  const handleOrderCompleted = useCallback(async (phone) => {
    const normalizedPhone =
      normalizePhoneInput(phone) || lastPhoneRef.current;

    resetCheckoutRedeemState();
    await refreshBalanceForPhone(normalizedPhone);
  }, [refreshBalanceForPhone, resetCheckoutRedeemState]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onCartCleared = () => resetCheckoutRedeemState();
    const onCartEmptied = () => resetCheckoutRedeemState();
    const onCustomerLoggedOut = () => resetCheckoutRedeemState();
    const onCustomerSwitched = () => resetCheckoutRedeemState();

    window.addEventListener('xrt:cart-cleared', onCartCleared);
    window.addEventListener('xrt:cart-emptied', onCartEmptied);
    window.addEventListener('xrt:customer-logged-out', onCustomerLoggedOut);
    window.addEventListener('xrt:customer-switched', onCustomerSwitched);

    return () => {
      window.removeEventListener('xrt:cart-cleared', onCartCleared);
      window.removeEventListener('xrt:cart-emptied', onCartEmptied);
      window.removeEventListener('xrt:customer-logged-out', onCustomerLoggedOut);
      window.removeEventListener('xrt:customer-switched', onCustomerSwitched);
      clearRedeemExpiryTimer();
    };
  }, [clearRedeemExpiryTimer, resetCheckoutRedeemState]);

  return (
    <LoyaltyContext.Provider value={{
      isActive,
      isEnrolled,
      pointsBalance,
      discountValue,
      pointsRedeemed,
      isLoading,
      redeemRate,
      minPointsToRedeem,
      earnRate,
      maxDiscountPercent,
      lastPhone,
      error,
      lookup,
      join,
      redeem,
      resetDiscount,
      resetCheckoutRedeemState,
      handleOrderCompleted
    }}>
      {children}
    </LoyaltyContext.Provider>
  );
};
