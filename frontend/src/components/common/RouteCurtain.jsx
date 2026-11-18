import React from 'react';
import { motion } from 'framer-motion';
import { Moon } from 'lucide-react';

const CurtainBrand = () => (
  <div className="relative z-10 flex flex-col items-center justify-center select-none pointer-events-none">
    {/* Crescent Moon Badge */}
    <div className="w-14 h-14 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-950/60 mb-3.5">
      <Moon className="w-7 h-7 fill-amber-400/20 text-amber-400" />
    </div>

    {/* Brand Title */}
    <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.25em] text-slate-100 block text-center">
      MOON LIGHT
    </span>
    <span className="text-[10px] uppercase tracking-[0.4em] text-amber-400 font-semibold block mt-1 text-center">
      Villa & Estate
    </span>

    {/* Thin Gold Gradient Accent Line */}
    <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-4" />
  </div>
);

/**
 * RouteCurtain: Full-screen luxury wipe overlay for route transitions.
 * - Exit curtain wipes UP from bottom (100% -> 0%) covering the screen.
 * - Enter curtain holds then wipes UPWARD/OFF (0% -> -100%) revealing the new page.
 */
const RouteCurtain = ({ isInitial = false }) => {
  return (
    <>
      {/* Enter Curtain: Reveals the new page by wiping upward and away */}
      {!isInitial && (
        <motion.div
          initial={{ y: '0%' }}
          animate={{ y: '-100%' }}
          transition={{
            duration: 0.6,
            delay: 0.15,
            ease: [0.76, 0, 0.24, 1]
          }}
          className="fixed inset-0 z-[100] pointer-events-none bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
          style={{ willChange: 'transform' }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_60%)] pointer-events-none" />
          <CurtainBrand />
        </motion.div>
      )}

      {/* Exit Curtain: Wipes UP from bottom to cover the old page */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: '100%' }}
        exit={{ y: '0%' }}
        transition={{
          duration: 0.5,
          ease: [0.76, 0, 0.24, 1]
        }}
        className="fixed inset-0 z-[100] pointer-events-none bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
        style={{ willChange: 'transform' }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_60%)] pointer-events-none" />
        <CurtainBrand />
      </motion.div>
    </>
  );
};

export default RouteCurtain;
