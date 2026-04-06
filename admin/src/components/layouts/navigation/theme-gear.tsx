import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsIcon } from '@/components/icons/sidebar/settings';
import ColorPicker from '@/components/ui/color-picker/color-picker';
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

type ThemeOptions = {
  primary_color?: string | null;
  secondary_color?: string | null;
};

export default function ThemeGear() {
  const { t } = useTranslation('common');
  const { settings } = useSettingsQuery({ language: 'en' });
  const { mutate: updateSettings, isPending: isUpdating } =
    useUpdateSettingsMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY_COLOR);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY_COLOR);
  const [hasChanges, setHasChanges] = useState(false);
  const panelRef = useRef(null);

  const getSavedTheme = useCallback(
    (): Required<ThemeOptions> => ({
      primary_color: settings?.options?.primary_color || DEFAULT_PRIMARY_COLOR,
      secondary_color:
        settings?.options?.secondary_color || DEFAULT_SECONDARY_COLOR,
    }),
    [settings],
  );

  const resetToSavedTheme = useCallback(() => {
    const savedTheme = getSavedTheme();
    setPrimaryColor(savedTheme.primary_color);
    setSecondaryColor(savedTheme.secondary_color);
    applyAdminBrandTheme(savedTheme);
  }, [getSavedTheme]);

  useClickAway(panelRef, () => {
    if (!isOpen) {
      return;
    }

    resetToSavedTheme();
    setIsOpen(false);
  });

  useEffect(() => {
    const savedTheme = getSavedTheme();
    setPrimaryColor(savedTheme.primary_color);
    setSecondaryColor(savedTheme.secondary_color);
  }, [getSavedTheme]);

  useEffect(() => {
    const savedTheme = getSavedTheme();

    setHasChanges(
      primaryColor.toLowerCase() !== savedTheme.primary_color.toLowerCase() ||
        secondaryColor.toLowerCase() !== savedTheme.secondary_color.toLowerCase(),
    );

    applyAdminBrandTheme({
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    });
  }, [getSavedTheme, primaryColor, secondaryColor]);

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

  const handleToggle = () => {
    if (isOpen) {
      resetToSavedTheme();
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      <div className="relative" ref={panelRef}>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggle}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-colors focus:outline-none',
            isOpen ? 'bg-red-500 text-white' : 'bg-accent text-white',
          )}
        >
          {isOpen ? (
            <span className="text-2xl font-bold">x</span>
          ) : (
            <SettingsIcon className="h-7 w-7" />
          )}
        </motion.button>

        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              layoutId="theme-panel"
              initial={{ opacity: 0, scale: 0.95, y: 15, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, y: 15, filter: 'blur(10px)' }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="absolute bottom-20 right-0 w-80 overflow-hidden rounded-[40px] border border-white/40 bg-white/70 p-8 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] backdrop-blur-3xl"
            >
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-heading">
                      {t('Aesthetics')}
                    </h3>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-accent opacity-80">
                      {t('Brand Personality')}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 180, scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleReset}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100/50 bg-gray-50/50 text-gray-400 transition-colors hover:bg-gray-100/50 hover:text-gray-600"
                    title={t('Reset to Defaults')}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </motion.button>
                </div>

                <div className="space-y-5 pr-2">

                  {[
                    {
                      label: 'Primary Color',
                      value: primaryColor,
                      setter: setPrimaryColor,
                      id: 'primary',
                    },
                    {
                      label: 'Secondary Color',
                      value: secondaryColor,
                      setter: setSecondaryColor,
                      id: 'secondary',
                    },
                  ].map((color, index) => (
                    <motion.div
                      key={color.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 * index }}
                      className="group relative rounded-[24px] border border-white/80 bg-white/50 p-5 shadow-sm transition-all hover:bg-white/80 hover:shadow-md"
                    >
                      <ColorPicker
                        label={color.label}
                        name={color.id}
                        value={color.value}
                        onChange={(event) => color.setter(event.target.value)}
                      />
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-mono text-[10px] font-black uppercase tracking-tight text-gray-400">
                          {color.value}
                        </span>
                        <div
                          className="h-2.5 w-12 rounded-full shadow-inner"
                          style={{ backgroundColor: color.value }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-4 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isUpdating}
                    loading={isUpdating}
                    className="h-16 w-full rounded-2xl border-0 bg-accent text-lg font-black shadow-2xl shadow-accent/40 transition-all active:scale-[0.97] hover:brightness-110 ltr:tracking-wide"
                  >
                    {isUpdating ? t('Publishing...') : t('Save Branding')}
                  </Button>

                  <AnimatePresence>
                    {hasChanges && !isUpdating && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center justify-center gap-3"
                      >
                        <span className="h-2 w-2 animate-ping rounded-full bg-accent" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent opacity-90">
                          {t('Live Synchronizing')}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
