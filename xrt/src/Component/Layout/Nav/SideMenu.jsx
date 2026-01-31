import React from 'react';

// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { nav_links } from '../../../config/constants';
import { Link } from 'react-router-dom';

export default function SideMenu({ open, setclosefun }) {
  const variants = {
    hidden: { x: '-100%' , transition: { duration: 0.45, ease: 'easeInOut' } },
    visible: { x: 0, transition: { duration: 0.45, ease: 'easeInOut' } },
    exit: { x: '-100%', transition: { duration: 0.35, ease: 'easeInOut' } }
  };

  const overlayVariants = {
    hidden: { opacity: 0, pointerEvents: 'none' },
    visible: { opacity: 0.4, pointerEvents: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, pointerEvents: 'none', transition: { duration: 0.2 } }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setclosefun()}
            />

            
            <motion.aside
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              className="fixed top-0 left-0 h-screen w-[280px] bg-[#FFFFFF] z-50"
              role="dialog"
            >
              <div className='flex justify-between px-[20px] w-[280px] bg-[#F7F7F7] py-[20px]'>
                <h4 className='cursor-pointer'>main menu</h4>
                <button
                  className='cursor-pointer'
                  onClick={() => setclosefun()}
                >
                  <i className="fa-thin fa-circle-xmark"></i>
                </button>
              </div>

              <ul>
                {nav_links.map(link => (
                  <li key={link.name} className="ml-[30px] flex justify-between w-[230px] mt-2 mb-4 text-black cursor-pointer group relative font-[400]">
                    <Link to={link.path}>{link.name}</Link>
                    <i className='fa-thin fa-chevron-down'></i>
                    <span className="block w-0 border-b-[1px] border-white transition-all duration-300 group-hover:w-full absolute left-0 -bottom-1"></span>
                  </li>
                ))}
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
