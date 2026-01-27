import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navigation = ({
  onPrevious,
  onNext,
  onTableOfContents,
  canGoPrevious = true,
  canGoNext = true,
  currentPage = 1,
  totalPages = 1
}) => {
  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass border-t border-border/50">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          {/* Previous Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="rounded-full touch-target"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Center - Table of Contents & Page Indicator */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onTableOfContents}
              className="rounded-full gap-2"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Contents</span>
            </Button>
            
            {/* Page Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                const pageIdx = totalPages > 5 
                  ? Math.max(0, Math.min(currentPage - 3, totalPages - 5)) + idx
                  : idx;
                const isActive = pageIdx + 1 === currentPage;
                
                return (
                  <motion.div
                    key={idx}
                    className={`rounded-full transition-all duration-200 ${
                      isActive 
                        ? 'w-6 h-2 bg-primary' 
                        : 'w-2 h-2 bg-muted-foreground/30'
                    }`}
                    layoutId={isActive ? "activeDot" : undefined}
                  />
                );
              })}
            </div>
          </div>

          {/* Next Button */}
          <Button
            variant={canGoNext ? "warm" : "ghost"}
            size="icon"
            onClick={onNext}
            disabled={!canGoNext}
            className="rounded-full touch-target"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export const SwipeHint = ({ direction = 'left' }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 text-muted-foreground text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          animate={{ x: direction === 'left' ? [-5, 5, -5] : [5, -5, 5] }}
          transition={{ repeat: 3, duration: 0.8 }}
        >
          {direction === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </motion.div>
        <span>Swipe to navigate</span>
      </motion.div>
    </AnimatePresence>
  );
};
