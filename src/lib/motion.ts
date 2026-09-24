import { type Variants, type Transition } from 'framer-motion'

// Unified Easing Presets
export const transitionPresets = {
  smooth: {
    duration: 0.35,
    ease: [0.16, 1, 0.3, 1],
  } as Transition,
  quick: {
    duration: 0.22,
    ease: [0.25, 1, 0.5, 1],
  } as Transition,
  spring: {
    type: 'spring',
    stiffness: 380,
    damping: 28,
  } as Transition,
  gentle: {
    duration: 0.5,
    ease: [0.25, 0.1, 0.25, 1],
  } as Transition,
}

// Page Transition Variants
export const pageVariants: Variants = {
  initialHeist: {
    opacity: 0,
    y: 10,
    filter: 'contrast(1.05)',
  },
  enterHeist: {
    opacity: 1,
    y: 0,
    filter: 'contrast(1)',
    transition: {
      duration: 0.32,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exitHeist: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },

  initialProfessional: {
    opacity: 0,
    y: 6,
  },
  enterProfessional: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exitProfessional: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.18,
      ease: 'easeIn',
    },
  },
}

// Staggered Container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
}

// Stagger Item
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

// Card Hover
export const cardHoverVariants: Variants = {
  initial: { y: 0 },
  hoverHeist: {
    y: -2,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  hoverProfessional: {
    y: -1.5,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
}

// Modal Animation Variants
export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.24, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } },
}

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 8,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
}

// Drawer Animation Variants
export const drawerVariants: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.24, ease: [0.7, 0, 0.84, 0] },
  },
}

// Tooltip / Dropdown Variants
export const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
}
