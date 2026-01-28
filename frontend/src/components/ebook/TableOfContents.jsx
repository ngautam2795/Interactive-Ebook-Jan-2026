import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, FlaskConical, Landmark, Calculator, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const subjectIcons = {
  science: FlaskConical,
  history: Landmark,
  math: Calculator
};

const subjectColors = {
  science: 'secondary',
  history: 'accent',
  math: 'primary'
};

export const TableOfContents = ({
  isOpen,
  onClose,
  chapters,
  currentTopicId,
  onSelectTopic,
  completedTopics = []
}) => {
  const totalTopics = chapters.reduce((acc, ch) => acc + ch.topics.length, 0);
  const progressPercentage = (completedTopics.length / totalTopics) * 100;

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
          />
          
          {/* Sheet */}
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-background shadow-elevated"
            data-testid="toc-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Contents
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {completedTopics.length} of {totalTopics} completed
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full" data-testid="toc-close-button">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground" data-testid="toc-progress-label">Your Progress</span>
                <span className="text-sm font-bold text-primary" data-testid="toc-progress-value">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" data-testid="toc-progress-bar" />
            </div>

            {/* Chapters List */}
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="p-4 space-y-6">
                {chapters.map((chapter, chapterIdx) => {
                  const SubjectIcon = subjectIcons[chapter.subject] || BookOpen;
                  const subjectColor = subjectColors[chapter.subject] || 'primary';
                  
                  return (
                    <motion.div
                      key={chapter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: chapterIdx * 0.1 }}
                    >
                      {/* Chapter Header */}
                      <div className="flex items-center gap-3 mb-3" data-testid={`toc-chapter-${chapter.id}`}>
                        <div 
                          className={`w-8 h-8 rounded-lg flex items-center justify-center`}
                          style={{ backgroundColor: `hsl(var(--${subjectColor}) / 0.15)` }}
                        >
                          <SubjectIcon 
                            className="w-4 h-4" 
                            style={{ color: `hsl(var(--${subjectColor}))` }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate" data-testid={`toc-chapter-${chapter.id}-title`}>
                            {chapter.title}
                          </h3>
                          <p className="text-xs text-muted-foreground" data-testid={`toc-chapter-${chapter.id}-count`}>
                            {chapter.topics.length} topics
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs capitalize"
                          style={{ 
                            borderColor: `hsl(var(--${subjectColor}))`,
                            color: `hsl(var(--${subjectColor}))`
                          }}
                        >
                          {chapter.subject}
                        </Badge>
                      </div>

                      {/* Topics */}
                      <div className="space-y-1.5 pl-4 border-l-2 border-muted ml-4">
                        {chapter.topics.map((topic, topicIdx) => {
                          const isActive = currentTopicId === topic.id;
                          const isCompleted = completedTopics.includes(topic.id);
                          
                          return (
                            <motion.button
                              key={topic.id}
                              className={`
                                w-full flex items-center gap-3 p-3 rounded-xl text-left
                                transition-all duration-200
                                ${isActive 
                                  ? 'bg-primary/10 border-l-2 border-primary -ml-[2px]' 
                                  : 'hover:bg-muted'
                                }
                              `}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                onSelectTopic(chapter.id, topic.id, chapterIdx);
                                onClose();
                              }}
                              data-testid={`toc-topic-${topic.id}-button`}
                            >
                              {/* Status Indicator */}
                              <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                                ${isCompleted 
                                  ? 'bg-success text-success-foreground' 
                                  : isActive 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted text-muted-foreground'
                                }
                              `}>
                                {isCompleted ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <span className="text-xs font-semibold">{topicIdx + 1}</span>
                                )}
                              </div>
                              
                              {/* Topic Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`} data-testid={`toc-topic-${topic.id}-title`}>
                                  {topic.title}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate" data-testid={`toc-topic-${topic.id}-meta`}>
                                  {topic.hotspots?.length || 0} interactive elements
                                </p>
                              </div>

                              {/* Arrow */}
                              <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TableOfContents;
