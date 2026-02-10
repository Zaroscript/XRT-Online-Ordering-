import { useModalAction } from '@/components/ui/modal/modal.context';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';

interface ConfirmRedirectIfDirtyProps {
  isDirty: boolean;
  message?: string;
}

export function useConfirmRedirectIfDirty({
  isDirty,
  message = 'You have unsaved changes - are you sure you wish to leave this page?',
}: ConfirmRedirectIfDirtyProps) {
  const router = useRouter();
  const { openModal } = useModalAction();
  // use refs to store the values
  const isDirtyRef = useRef(isDirty);
  const messageRef = useRef(message);

  // update the refs only when the values change
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // use useCallback to memoize the functions
  const handleWindowClose = useCallback((e: BeforeUnloadEvent) => {
    if (!isDirtyRef.current) return;
    e.preventDefault();
    return (e.returnValue = messageRef.current);
  }, []);

  const handleBrowseAway = useCallback(
    (url: string) => {
      if (!isDirtyRef.current) return;
      openModal('CONFIRM_REDIRECT', {
        onConfirm: async () => {
          isDirtyRef.current = false;
          await router.push(url);
        },
      });
      router.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    },
    [router, openModal],
  );
  // ...

  // use the memoized functions as dependencies
  useEffect(() => {
    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [handleWindowClose, handleBrowseAway]);
}
