import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Menu, X, ChevronLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export const Header = ({ 
  onMenuClick, 
  onBack, 
  showBack = false, 
  title,
  progress = 0,
  totalPages = 0,
  currentPage = 0
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 safe-top"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left section */}
          <div className="flex items-center gap-2">
            {showBack ? (
              <Button 
                variant="ghost" 
                size="iconSm"
                onClick={onBack}
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-soft">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg text-foreground hidden sm:block">
                  LearnScape
                </span>
              </motion.div>
            )}
          </div>

          {/* Center - Title or Progress */}
          <div className="flex-1 mx-4 max-w-md">
            {title ? (
              <h1 className="text-sm font-semibold text-foreground truncate text-center">
                {title}
              </h1>
            ) : totalPages > 0 ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="w-full max-w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Right section - Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="iconSm" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-display text-lg mb-4">Menu</SheetTitle>
              <nav className="flex flex-col gap-2">
                <Button 
                  variant="ghost" 
                  className="justify-start gap-3"
                  onClick={() => {
                    setIsOpen(false);
                    onMenuClick?.('home');
                  }}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start gap-3"
                  onClick={() => {
                    setIsOpen(false);
                    onMenuClick?.('library');
                  }}
                >
                  <BookOpen className="h-4 w-4" />
                  My Library
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};
