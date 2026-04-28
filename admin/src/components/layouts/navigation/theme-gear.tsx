import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsIcon } from '@/components/icons/sidebar/settings';
import { HexColorPicker } from 'react-colorful';
import Button from '@/components/ui/button';
import { useSettingsQuery, useUpdateSettingsMutation } from '@/data/settings';
import { useTranslation } from 'next-i18next';
import {
  applyAdminBrandTheme,
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
} from '@/utils/theme-utils';
import { useClickAway } from 'react-use';
import cn from 'classnames';
import throttle from 'lodash/throttle';

export default function ThemeGear() {
  const { t } = useTranslation('common');
  const { settings } = useSettingsQuery({ language: 'en' });
  const { mutate: updateSettings, isPending: isUpdating } =
    useUpdateSettingsMutation();

  const [isOpen, setIsOpen] = useState(false);

  // Memoize initial theme values
  const initialTheme = useMemo(
    () => ({
      primary: settings?.options?.primary_color || DEFAULT_PRIMARY_COLOR,
      secondary: settings?.options?.secondary_color || DEFAULT_SECONDARY_COLOR,
    }),
    [settings],
  );

  const [primaryColor, setPrimaryColor] = useState(initialTheme.primary);
  const [secondaryColor, setSecondaryColor] = useState(initialTheme.secondary);
  const panelRef = useRef(null);

  // Throttled function to apply theme without lagging the UI
  const throttledApplyTheme = useMemo(
    () =>
      throttle((p: string, s: string) => {
        applyAdminBrandTheme({ primary_color: p, secondary_color: s });
      }, 60), // ~16fps refresh rate for smooth preview
    [],
  );

  // Sync state with settings once loaded
  useEffect(() => {
    setPrimaryColor(initialTheme.primary);
    setSecondaryColor(initialTheme.secondary);
  }, [initialTheme]);

  // Apply changes live with throttling
  useEffect(() => {
    if (isOpen) {
      throttledApplyTheme(primaryColor, secondaryColor);
    }
  }, [primaryColor, secondaryColor, throttledApplyTheme, isOpen]);

  const hasChanges = useMemo(
    () =>
      primaryColor.toLowerCase() !== initialTheme.primary.toLowerCase() ||
      secondaryColor.toLowerCase() !== initialTheme.secondary.toLowerCase(),
    [primaryColor, secondaryColor, initialTheme],
  );

  const handleSave = () => {
    updateSettings(
      {
        options: {
          ...settings?.options,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
        },
      },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
      },
    );
  };

  const handleReset = () => {
    setPrimaryColor(DEFAULT_PRIMARY_COLOR);
    setSecondaryColor(DEFAULT_SECONDARY_COLOR);
  };

  useClickAway(panelRef, () => {
    if (!isOpen) return;

    if (hasChanges) {
      // Revert live preview if not saved
      setPrimaryColor(initialTheme.primary);
      setSecondaryColor(initialTheme.secondary);
      applyAdminBrandTheme({
        primary_color: initialTheme.primary,
        secondary_color: initialTheme.secondary,
      });
    }
    setIsOpen(false);
  });

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      <div className="relative" ref={panelRef}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl transition-all duration-300 focus:outline-none',
            isOpen
              ? 'bg-red-500 text-white rotate-90'
              : 'bg-white dark:bg-dark-250 text-accent border border-gray-100 dark:border-gray-800',
          )}
        >
          {isOpen ? (
            <span className="text-xl font-bold">×</span>
          ) : (
            <SettingsIcon className="h-6 w-6 animate-spin-slow" />
          )}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="absolute bottom-16 right-0 w-[280px] overflow-hidden rounded-[32px] border border-white/40 dark:border-white/10 bg-white/80 dark:bg-dark-250/80 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-heading">
                      {t('Theme')}
                    </h3>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-body/60">
                      {t('Customizer')}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="group p-2 text-body/40 transition-colors hover:text-accent"
                    title={t('Reset')}
                  >
                    <svg
                      className="h-4 w-4 transition-transform group-hover:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Primary Color */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-heading">
                        {t('Primary Color')}
                      </label>
                      <span className="font-mono text-[10px] text-body/40 uppercase">
                        {primaryColor}
                      </span>
                    </div>
                    <div className="custom-color-picker overflow-hidden rounded-xl border border-gray-100 dark:border-white/5 shadow-inner bg-white/50">
                      <HexColorPicker
                        color={primaryColor}
                        onChange={setPrimaryColor}
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-heading">
                        {t('Secondary Color')}
                      </label>
                      <span className="font-mono text-[10px] text-body/40 uppercase">
                        {secondaryColor}
                      </span>
                    </div>
                    <div className="custom-color-picker overflow-hidden rounded-xl border border-gray-100 dark:border-white/5 shadow-inner bg-white/50">
                      <HexColorPicker
                        color={secondaryColor}
                        onChange={setSecondaryColor}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isUpdating}
                    loading={isUpdating}
                    className="h-12 w-full text-white rounded-2xl bg-accent text-sm font-bold shadow-lg shadow-accent/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isUpdating ? t('Saving...') : t('Apply Theme')}
                  </Button>
                  
                  {hasChanges && !isUpdating && (
                    <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-widest text-accent/80 animate-pulse">
                      {t('Previewing Changes')}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-color-picker .react-colorful {
          width: 100% !important;
          height: 100px !important;
        }
        .custom-color-picker .react-colorful__saturation {
          border-radius: 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .custom-color-picker .react-colorful__hue {
          height: 12px !important;
          border-radius: 0 !important;
        }
        .custom-color-picker .react-colorful__pointer {
          width: 16px !important;
          height: 16px !important;
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
