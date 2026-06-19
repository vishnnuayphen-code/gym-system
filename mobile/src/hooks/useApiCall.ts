import { useState, useEffect, useCallback } from 'react';

export function useApiCall<T>(
  apiFunc: () => Promise<T>,
  deps: any[]
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await apiFunc();
      setData(result);
    } catch (e: any) {
      setError(
        e?.response?.data?.message
        ?? e?.message
        ?? 'Something went wrong'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refreshing, refetch: () => fetchData(true) };
}
