import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Leaf, Wind, Droplets, Sparkles, Cloud, Crown, Box, 
  Triangle, Cat, Circle, Square, Hexagon, Pentagon, Globe,
  CircleDot, Orbit, FlaskConical, Landmark, Calculator, X,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const iconMap = {
  sun: Sun,
  leaf: Leaf,
  wind: Wind,
  droplets: Droplets,
  sparkles: Sparkles,
  cloud: Cloud,
  crown: Crown,
  box: Box,
  triangle: Triangle,
  cat: Cat,
  circle: Circle,
  square: Square,
  hexagon: Hexagon,
  pentagon: Pentagon,
  globe: Globe,
  'circle-dot': CircleDot,
  orbit: Orbit,
  planet: Globe,
  'flask-conical': FlaskConical,
  landmark: Landmark,
  calculator: Calculator,
};

const colorVariants = {
  primary: {
    bg: 'bg-primary',
    ring: 'ring-primary/40',
    glow: 'shadow-[0_0_20px_hsl(var(--primary)/0.5)]'
  },
  secondary: {
    bg: 'bg-secondary',
    ring: 'ring-secondary/40',
    glow: 'shadow-[0_0_20px_hsl(var(--secondary)/0.5)]'
  },
  accent: {
    bg: 'bg-accent',
    ring: 'ring-accent/40',
    glow: 'shadow-[0_0_20px_hsl(var(--accent)/0.5)]'
  },
  warning: {
    bg: 'bg-warning',
    ring: 'ring-warning/40',
    glow: 'shadow-[0_0_20px_hsl(var(--warning)/0.5)]'
  },
  muted: {
    bg: 'bg-muted-foreground',
    ring: 'ring-muted-foreground/40',
    glow: 'shadow-[0_0_20px_hsl(var(--muted-foreground)/0.3)]'
  },
  destructive: {
    bg: 'bg-destructive',
    ring: 'ring-destructive/40',
    glow: 'shadow-[0_0_20px_hsl(var(--destructive)/0.5)]'
  },
  history: {
    bg: 'bg-accent',
    ring: 'ring-accent/40',
    glow: 'shadow-[0_0_20px_hsl(var(--accent)/0.5)]'
  },
  math: {
    bg: 'bg-primary',
    ring: 'ring-primary/40',
    glow: 'shadow-[0_0_20px_hsl(var(--primary)/0.5)]'
  }
};

export const Hotspot = ({ 
  id,
  x, 
  y, 
  label, 
  icon = 'sparkles',
  color = 'primary',
  title,
  description,
  funFact,
  onActivate,
  isActive = false,
  index = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = iconMap[icon] || Sparkles;
  const colors = colorVariants[color] || colorVariants.primary;

  return (
    <motion.div
      className="absolute z-20"
      style={{ left: `${x}%`, top: `${y}%` }}
      data-testid={`hotspot-container-${id}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: 0.3 + (index * 0.1),
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      {/* Outer pulse ring */}
      <motion.div
        className={`absolute inset-0 rounded-full ${colors.bg} opacity-30`}
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.3, 0, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ width: 44, height: 44, marginLeft: -22, marginTop: -22 }}
      />
      
      {/* Main hotspot button */}
      <motion.button
        className={`
          relative flex items-center justify-center
          w-11 h-11 -ml-[22px] -mt-[22px]
          rounded-full ${colors.bg} ${colors.glow}
          cursor-pointer touch-target
          ring-4 ${colors.ring}
        `}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => onActivate?.(id)}
        aria-label={`Learn about ${label}`}
        data-testid={`hotspot-button-${id}`}
      >
        <IconComponent className="w-5 h-5 text-white" />
        
        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white"
            layoutId="activeHotspot"
          />
        )}
      </motion.button>

      {/* Label tooltip on hover */}
      <AnimatePresence>
        {isHovered && !isActive && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-full bg-foreground text-background text-xs font-semibold whitespace-nowrap shadow-medium"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {label}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const HotspotModal = ({
  isOpen,
  onClose,
  title,
  description,
  funFact,
  icon,
  color = 'primary'
}) => {
  const IconComponent = iconMap[icon] || Sparkles;
  const colors = colorVariants[color] || colorVariants.primary;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            data-testid="hotspot-modal-backdrop"
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 bottom-4 z-50 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            data-testid="hotspot-modal"
          >
            <Card className="overflow-hidden shadow-elevated border-0">
              {/* Header with icon */}
              <div className={`${colors.bg} px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-white">
                      {title}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={onClose}
                    className="rounded-full text-white hover:bg-white/20"
                    data-testid="hotspot-modal-close-button"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-6">
                <p className="text-foreground leading-relaxed mb-4">
                  {description}
                </p>
                
                {funFact && (
                  <motion.div
                    className="flex gap-3 p-4 rounded-xl bg-accent-muted"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-accent uppercase tracking-wide">
                        Fun Fact
                      </span>
                      <p className="text-sm text-foreground mt-1">
                        {funFact}
                      </p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
