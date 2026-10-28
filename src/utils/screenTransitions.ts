import { Transition, Variants } from 'framer-motion';

/**
 * Standardized Framer Motion Screen Transitions
 * Provides consistent, polished fade-and-slide entry and exit animations
 * for all top-level game screens (Menu, Campaign LevelSelect, GameBoard,
 * Shop, DailyMissions, TournamentHub, TechAcademy, BlueprintWorkshop).
 */

export const SCREEN_EASING: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const SCREEN_EXIT_EASING: [number, number, number, number] = [0.4, 0, 0.2, 1];

export const screenTransitionConfig: Transition = {
  duration: 0.3,
  ease: SCREEN_EASING,
};

export const screenFadeSlideVariants: Variants = {
  initial: {
    opacity: 0,
    y: 18,
    scale: 0.988,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: screenTransitionConfig,
  },
  exit: {
    opacity: 0,
    y: -14,
    scale: 0.988,
    transition: {
      duration: 0.22,
      ease: SCREEN_EXIT_EASING,
    },
  },
};
