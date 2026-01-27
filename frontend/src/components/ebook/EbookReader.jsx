import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Navigation, SwipeHint } from '@/components/layout/Navigation';
import { InteractivePage } from '@/components/interactive/InteractivePage';
import { TableOfContents } from './TableOfContents';
import { TopicEditor } from '@/components/editor/TopicEditor';

export const EbookReader = ({ onBack, chapters = [], initialChapterIndex = 0, onChaptersUpdate }) => {
  const [localChapters, setLocalChapters] = useState(chapters);
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingChapterId, setEditingChapterId] = useState(null);

  // Update local chapters when prop changes
  useEffect(() => {
    setLocalChapters(chapters);
  }, [chapters]);

  // Flatten all topics from all chapters
  const allTopics = useMemo(() => {
    return localChapters.flatMap(chapter => 
      (chapter.topics || []).map(topic => ({
        ...topic,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        subject: chapter.subject
      }))
    );
  }, [localChapters]);

  // Calculate initial page index based on chapter
  const getInitialPageIndex = useCallback(() => {
    if (initialChapterIndex === 0) return 0;
    
    let pageIndex = 0;
    for (let i = 0; i < initialChapterIndex && i < localChapters.length; i++) {
      pageIndex += (localChapters[i].topics || []).length;
    }
    return pageIndex;
  }, [localChapters, initialChapterIndex]);

  const [currentPageIndex, setCurrentPageIndex] = useState(getInitialPageIndex);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [tocOpen, setTocOpen] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const currentTopic = allTopics[currentPageIndex];
  const progress = allTopics.length > 0 ? ((currentPageIndex + 1) / allTopics.length) * 100 : 0;

  // Handle swipe gestures
  const x = useMotionValue(0);
  const dragThreshold = 100;

  // Hide swipe hint after first interaction
  const shouldShowHint = completedTopics.length === 0 && showSwipeHint;

  // Mark topic as completed when visiting
  useEffect(() => {
    if (currentTopic && !completedTopics.includes(currentTopic.id)) {
      const timer = setTimeout(() => {
        setCompletedTopics(prev => [...prev, currentTopic.id]);
      }, 3000); // Mark as completed after 3 seconds on page
      return () => clearTimeout(timer);
    }
  }, [currentTopic, completedTopics]);

  const goToPage = useCallback((index, dir = 0) => {
    if (index >= 0 && index < allTopics.length) {
      setDirection(dir || (index > currentPageIndex ? 1 : -1));
      setCurrentPageIndex(index);
    }
  }, [currentPageIndex, allTopics.length]);

  const goNext = useCallback(() => {
    if (currentPageIndex < allTopics.length - 1) {
      goToPage(currentPageIndex + 1, 1);
    }
  }, [currentPageIndex, allTopics.length, goToPage]);

  const goPrevious = useCallback(() => {
    if (currentPageIndex > 0) {
      goToPage(currentPageIndex - 1, -1);
    }
  }, [currentPageIndex, goToPage]);

  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info;
    
    if (offset.x < -dragThreshold || velocity.x < -500) {
      goNext();
    } else if (offset.x > dragThreshold || velocity.x > 500) {
      goPrevious();
    }
  };

  const handleSelectTopic = (chapterId, topicId) => {
    const index = allTopics.findIndex(t => t.id === topicId);
    if (index !== -1) {
      goToPage(index);
    }
  };

  const handleHotspotActivate = (hotspotId) => {
    // Track hotspot interactions
    console.log('Hotspot activated:', hotspotId);
  };

  // Handle edit mode
  const handleEditTopic = useCallback((topic, chapterId) => {
    setEditingTopic(topic);
    setEditingChapterId(chapterId);
  }, []);

  const handleSaveEdit = useCallback((updatedTopic) => {
    // Update local state
    setLocalChapters(prev => prev.map(chapter => {
      if (chapter.id === editingChapterId) {
        return {
          ...chapter,
          topics: (chapter.topics || []).map(t => 
            t.id === updatedTopic.id ? updatedTopic : t
          )
        };
      }
      return chapter;
    }));
    
    // Notify parent if callback provided
    onChaptersUpdate?.(localChapters);
    
    setEditingTopic(null);
    setEditingChapterId(null);
  }, [editingChapterId, localChapters, onChaptersUpdate]);

  const handleCloseEdit = useCallback(() => {
    setEditingTopic(null);
    setEditingChapterId(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingTopic) return; // Disable when editing
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrevious();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrevious, editingTopic]);

  // Page transition variants
  const pageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header
        showBack
        onBack={onBack}
        title={currentTopic?.chapterTitle}
        progress={progress}
        currentPage={currentPageIndex + 1}
        totalPages={allTopics.length}
        onMenuClick={(action) => {
          if (action === 'home') onBack();
        }}
      />

      {/* Main Content with Swipe */}
      <motion.div
        className="relative touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPageIndex}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            {currentTopic && (
              <InteractivePage
                topic={currentTopic}
                chapterTitle={currentTopic.chapterTitle}
                chapterId={currentTopic.chapterId}
                subject={currentTopic.subject}
                onHotspotActivate={handleHotspotActivate}
                onEdit={handleEditTopic}
              />
            )}
            {!currentTopic && (
              <div className="min-h-[calc(100vh-140px)] pt-20 pb-24 px-4 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">No content available</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation */}
      <Navigation
        onPrevious={goPrevious}
        onNext={goNext}
        onTableOfContents={() => setTocOpen(true)}
        canGoPrevious={currentPageIndex > 0}
        canGoNext={currentPageIndex < allTopics.length - 1}
        currentPage={currentPageIndex + 1}
        totalPages={allTopics.length}
      />

      {/* Swipe Hint */}
      {shouldShowHint && currentPageIndex === 0 && allTopics.length > 1 && (
        <SwipeHint direction="left" />
      )}

      {/* Table of Contents */}
      <TableOfContents
        isOpen={tocOpen}
        onClose={() => setTocOpen(false)}
        chapters={localChapters}
        currentTopicId={currentTopic?.id}
        onSelectTopic={handleSelectTopic}
        completedTopics={completedTopics}
      />

      {/* Topic Editor */}
      <AnimatePresence>
        {editingTopic && editingChapterId && (
          <TopicEditor
            topic={editingTopic}
            chapterId={editingChapterId}
            onSave={handleSaveEdit}
            onClose={handleCloseEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EbookReader;
