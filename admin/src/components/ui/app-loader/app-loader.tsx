import cn from 'classnames';
import styles from './app-loader.module.css';
import { useTranslation } from 'next-i18next';
import { useAppLoading } from '@/contexts/app-loading.context';

const AppLoader = () => {
  const { t, i18n } = useTranslation('common');
  const { loadingMessage, isLoading } = useAppLoading();

  if (!i18n.isInitialized) {
    return null;
  }

  // Only render loader when loading is true
  if (!isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 w-full h-screen flex flex-col items-center justify-center bg-white z-50'
      )}
    >
      <div className="flex flex-col items-center space-y-8">
        {/* Main loader animation */}
        <div className={styles.app_loader}></div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-body">
            {t('text-loading')}
          </h3>
          <p className="text-sm text-gray-600 italic">
            {loadingMessage}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex space-x-2">
          <div className={styles.progress_dot}></div>
          <div className={styles.progress_dot} style={{ animationDelay: '0.2s' }}></div>
          <div className={styles.progress_dot} style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default AppLoader;
