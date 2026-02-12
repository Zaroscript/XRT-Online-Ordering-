import { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setLoading(true);
        const { data } = await apiClient.get(API_ENDPOINTS.CATEGORIES);
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          // Fallback or empty if structure is unexpected
          setCategories([]);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
