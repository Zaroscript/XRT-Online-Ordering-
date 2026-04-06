const STORAGE_KEY = 'xrt_checkout_customer';

/**
 * Load saved customer form data from localStorage (for returning visitors).
 * @returns {Object|null} { firstName, lastName, phone, email, acceptsMarketingMessages, acceptsOrderUpdates } or null
 */
export function loadSavedCustomer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return typeof data === 'object' && data !== null ? data : null;
  } catch {
    return null;
  }
}

/**
 * Save customer form data to localStorage.
 * @param {Object} data - { firstName, lastName, phone, email, acceptsMarketingMessages, acceptsOrderUpdates }
 */
export function saveCustomerData(data) {
  try {
    if (data && typeof data === 'object') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    // ignore
  }
}
