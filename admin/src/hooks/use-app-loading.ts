import { useEffect } from 'react';
import { useAppLoading as useAppLoadingContext } from '@/contexts/app-loading.context';

interface UseAppLoadingProps {
  loadingStates: boolean[];
  loadingMessage?: string;
}

export const useDashboardLoading = ({ 
  loadingStates, 
  loadingMessage = 'Loading dashboard data...' 
}: UseAppLoadingProps) => {
  const { setLoading, setLoadingMessage } = useAppLoadingContext();

  useEffect(() => {
    // Only process if we have loading states to check
    if (loadingStates.length === 0) {
      setLoading(false);
      return;
    }

    const isAnyLoading = loadingStates.some(state => state);
    
    if (isAnyLoading) {
      setLoading(true);
      setLoadingMessage(loadingMessage);
    } else {
      setLoading(false);
    }
  }, [loadingStates, loadingMessage, setLoading, setLoadingMessage]);
};

export default useDashboardLoading;
