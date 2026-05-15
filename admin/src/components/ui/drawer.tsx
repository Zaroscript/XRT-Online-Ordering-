import { FC, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock';
import cn from 'classnames';
import { fadeInRight } from '@/utils/motion/fade-in-right';
import { fadeInLeft } from '@/utils/motion/fade-in-left';
import { fadeInOut } from '@/utils/motion/fade-in-out';
import { useRouter } from 'next/router';
import { Dialog } from '@headlessui/react';

// Allow touch-move events that originate inside a scrollable child element.
// Without this, body-scroll-lock prevents ALL touch scrolling inside the drawer on iOS.
function isScrollable(el: Element): boolean {
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  return (
    (overflowY === 'scroll' || overflowY === 'auto') &&
    el.scrollHeight > el.clientHeight
  );
}

function allowTouchMove(el: EventTarget | null): boolean {
  let node = el as Element | null;
  while (node && node !== document.body) {
    if (isScrollable(node)) return true;
    node = node.parentElement;
  }
  return false;
}

interface SidebarProps {
  children: any;
  open: boolean;
  variant?: 'left' | 'right';
  useBlurBackdrop?: boolean;
  onClose: () => void;
}
type DivElementRef = React.MutableRefObject<HTMLDivElement>;

const Drawer: FC<SidebarProps> = ({
  children,
  open = false,
  variant = 'right',
  useBlurBackdrop,
  onClose,
}) => {
  const { locale } = useRouter();
  const dir = locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr';
  const ref = useRef() as DivElementRef;
  useEffect(() => {
    if (ref.current) {
      if (open) {
        // allowTouchMove lets inner scrollable panels (sidebar menu) still scroll on iOS/Android.
        disableBodyScroll(ref.current, { allowTouchMove });
      } else {
        enableBodyScroll(ref.current);
      }
    }
    return () => {
      clearAllBodyScrollLocks();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <Dialog static as={motion.div} open={open} onClose={onClose}>
          <motion.aside
            ref={ref}
            key="drawer"
            initial="from"
            animate="to"
            exit="from"
            variants={variant === 'right' ? fadeInRight() : fadeInLeft()}
            className="fixed inset-0 z-50 h-full overflow-hidden" // overflow-hidden here is intentional — inner panels handle their own scroll
            dir={dir}
          >
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                initial="from"
                animate="to"
                exit="from"
                variants={fadeInOut(0.35)}
                onClick={onClose}
                className={cn(
                  'absolute inset-0 bg-dark bg-opacity-40',
                  useBlurBackdrop && 'use-blur-backdrop',
                )}
              />
              <div
                className={cn(
                  'absolute inset-y-0 flex max-w-full outline-none',
                  variant === 'right'
                    ? 'ltr:right-0 rtl:left-auto'
                    : 'ltr:left-0 rtl:right-auto',
                )}
              >
                <div className="w-screen h-full max-w-md">
                  <div className="flex flex-col h-full shadow-xl bg-light text-body">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
