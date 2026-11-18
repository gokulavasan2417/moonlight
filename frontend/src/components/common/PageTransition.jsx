import React, { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import RouteCurtain from './RouteCurtain';

// Tracks if the very first page has mounted so we don't curtain-wipe on initial direct landing
let hasMountedOnce = false;

/**
 * PageTransition: Wraps page content with a luxury fade + curtain wipe sequence.
 * Cleans up all transforms upon completion to avoid interfering with sticky elements,
 * fixed layouts, and getBoundingClientRect measurements.
 */
const PageTransition = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const isInitial = useRef(!hasMountedOnce).current;

  useEffect(() => {
    hasMountedOnce = true;
  }, []);

  // Respect prefers-reduced-motion: quick 0.2s opacity fade without curtain
  if (shouldReduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{ transform: 'none' }}
        className="w-full flex-1"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <>
      <RouteCurtain isInitial={isInitial} />

      {/* Outer Wrapper: Animates ONLY opacity, never transform, to preserve layout hierarchy */}
      <motion.div
        initial={{ opacity: isInitial ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
        }}
        transition={{
          duration: 0.5,
          delay: isInitial ? 0 : 0.25,
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{ transform: 'none' }}
        className="w-full flex-1"
      >
        {/* Inner Content: Subtle 16px -> 0 stagger, transform strictly cleared to 'none' on completion */}
        <motion.div
          initial={{ opacity: isInitial ? 1 : 0, y: isInitial ? 0 : 16 }}
          animate={{
            opacity: 1,
            y: 0,
            transitionEnd: { transform: 'none' }
          }}
          transition={{
            duration: 0.5,
            delay: isInitial ? 0 : 0.25,
            ease: [0.4, 0, 0.2, 1]
          }}
          onAnimationComplete={() => setIsAnimationComplete(true)}
          style={{ transform: isAnimationComplete ? 'none' : undefined }}
          className="w-full"
        >
          {children}
        </motion.div>
      </motion.div>
    </>
  );
};

export default PageTransition;
