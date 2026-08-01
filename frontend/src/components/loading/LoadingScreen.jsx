import { motion, AnimatePresence } from 'framer-motion';
import { Scene } from './Scene';
import { useState, useEffect } from 'react';

const LoadingDots = () => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span className="inline-block w-8">{dots}</span>;
};

export function LoadingScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [canTransition, setCanTransition] = useState(false);

  useEffect(() => {
    // Allow transition after 3 seconds minimum for premium feel
    const timer = setTimeout(() => {
      setCanTransition(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleTransition = () => {
    if (canTransition && onComplete) {
      setIsVisible(false);
      // Call onComplete after fade out animation
      setTimeout(() => {
        onComplete();
      }, 800);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #fdfbf9 0%, #f5f0eb 50%, #ebe4de 100%)'
          }}
        >
          {/* 3D Scene Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-full h-64 md:h-80 relative"
          >
            <Scene />
          </motion.div>

          {/* App Name */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="text-4xl md:text-5xl font-bold text-[#1a1b22] mt-8 tracking-tight"
          >
            SETU
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="text-lg md:text-xl font-medium text-[#5b3f47] mt-2"
          >
            Connecting Rural Care
          </motion.p>

          {/* Description with animated dots */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="text-sm md:text-base text-[#5b3f47] mt-4 flex items-center gap-1"
          >
            Preparing intelligent emergency coordination
            <LoadingDots />
          </motion.div>

          {/* Progress indicator (subtle) */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: canTransition ? '100%' : '60%', opacity: 1 }}
            transition={{ duration: 2, delay: 1, ease: [0.4, 0, 0.2, 1] }}
            className="w-48 h-0.5 bg-[#b50063]/20 rounded-full mt-8 overflow-hidden"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 1.5, delay: 1.2, ease: [0.4, 0, 0.2, 1] }}
              className="h-full bg-[#b50063] rounded-full"
            />
          </motion.div>

          {/* Tap to continue indicator (when ready) */}
          {canTransition && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onClick={handleTransition}
              className="mt-8 px-6 py-2 bg-[#b50063] text-white rounded-full text-sm font-semibold hover:bg-[#8e004c] transition-colors"
            >
              Tap to Continue
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
