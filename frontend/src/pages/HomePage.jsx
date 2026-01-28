import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Sparkles, Upload, FlaskConical, Landmark, Calculator,
  ArrowRight, Star, Users, Award, ChevronRight, Play, Trash2,
  Library, Plus, RefreshCw, AlertTriangle, Clock, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { sampleChapters } from '@/data/sampleContent';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const subjectIcons = {
  science: FlaskConical,
  history: Landmark,
  math: Calculator
};

const subjectGradients = {
  science: 'from-emerald-500 to-teal-500',
  history: 'from-amber-500 to-orange-500',
  math: 'from-blue-500 to-indigo-500'
};

export const HomePage = ({ 
  onStartReading, 
  onUploadContent,
  savedChapters = [],
  onRefreshChapters,
  onDeleteChapter,
  onToggleFavorite,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('demo');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [favoriteUpdatingId, setFavoriteUpdatingId] = useState(null);

  const stats = [
    { icon: BookOpen, value: String(sampleChapters.length + savedChapters.length), label: 'Chapters' },
    { icon: Star, value: '20+', label: 'Concepts' },
    { icon: Users, value: 'All Ages', label: 'Suitable For' }
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'Interactive Hotspots',
      description: 'Tap on illustrated elements to discover detailed explanations'
    },
    {
      icon: BookOpen,
      title: 'Visual Learning',
      description: 'Beautiful illustrations that make complex topics easy to understand'
    },
    {
      icon: Award,
      title: 'Track Progress',
      description: 'See your learning journey and completed topics'
    }
  ];

  const handleDeleteChapter = async () => {
    if (!deleteConfirm) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/chapters/${deleteConfirm.id}`);
      toast.success('Chapter deleted successfully');
      onDeleteChapter?.(deleteConfirm.id);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete chapter');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleToggleFavorite = async (chapter) => {
    if (!chapter?.id) return;
    const nextFavorite = !chapter.favorite;
    setFavoriteUpdatingId(chapter.id);
    try {
      await axios.put(`${BACKEND_URL}/api/chapters/${chapter.id}/favorite`, {
        favorite: nextFavorite
      });
      onToggleFavorite?.(chapter.id, nextFavorite);
      toast.success(nextFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Favorite error:', error);
      toast.error('Failed to update favorite');
    } finally {
      setFavoriteUpdatingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute bottom-0 right-20 w-40 h-40 rounded-full bg-accent/10 blur-2xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-12 sm:pt-12 sm:pb-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-medium">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">
              LearnScape
            </span>
          </motion.div>

          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-0 font-semibold">
                Interactive Learning
              </Badge>
              
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
                Learning Comes{' '}
                <span className="text-gradient-warm">Alive</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Transform educational content into beautiful, interactive experiences. 
                Tap, explore, and discover knowledge through illustrated pages with 
                clickable hotspots.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="warm"
                  size="xl"
                  onClick={() => onStartReading(0)}
                  className="gap-2"
                  data-testid="hero-explore-demo-button"
                >
                  <Play className="w-5 h-5" />
                  Explore Demo
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  onClick={onUploadContent}
                  className="gap-2"
                  data-testid="hero-create-content-button"
                >
                  <Plus className="w-5 h-5" />
                  Create Content
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-10">
                {stats.map((stat, idx) => {
                  const statKey = stat.label.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <motion.div
                      key={idx}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      data-testid={`hero-stat-${statKey}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2">
                        <stat.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="font-display font-bold text-2xl text-foreground" data-testid={`hero-stat-${statKey}-value`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground" data-testid={`hero-stat-${statKey}-label`}>
                        {stat.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Hero Illustration */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 shadow-elevated overflow-hidden">
                  <img
                    src="https://customer-assets.emergentagent.com/job_storyscape-29/artifacts/hffdaa1p_Infogrph%20photosynthesis.jpg"
                    alt="Interactive Learning"
                    className="w-full h-full object-cover opacity-90"
                  />
                  
                  {/* Floating hotspot indicators */}
                  {[
                    { x: 20, y: 25, delay: 0.5 },
                    { x: 60, y: 40, delay: 0.7 },
                    { x: 35, y: 70, delay: 0.9 }
                  ].map((pos, idx) => (
                    <motion.div
                      key={idx}
                      className="absolute w-8 h-8 rounded-full bg-primary shadow-hotspot"
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: pos.delay, duration: 0.5 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Tabs Section */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-auto grid-cols-2">
                <TabsTrigger value="demo" className="gap-2 px-6" data-testid="tab-demo-content">
                  <BookOpen className="w-4 h-4" />
                  Demo Content
                </TabsTrigger>
                <TabsTrigger value="library" className="gap-2 px-6" data-testid="tab-my-library">
                  <Library className="w-4 h-4" />
                  My Library
                  {savedChapters.length > 0 && (
                    <Badge variant="secondary" className="ml-2 px-2 py-0.5 text-xs" data-testid="library-count-badge">
                      {savedChapters.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {activeTab === 'library' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefreshChapters}
                  disabled={isLoading}
                  className="gap-2"
                  data-testid="library-refresh-button"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>

            {/* Demo Content Tab */}
            <TabsContent value="demo">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-6">
                  <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                    Sample Chapters
                  </h2>
                  <p className="text-muted-foreground">
                    Explore our pre-built interactive content
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sampleChapters.map((chapter, idx) => (
                    <ChapterCard
                      key={chapter.id}
                      chapter={chapter}
                      index={idx}
                      onClick={() => onStartReading(idx)}
                      isDemo
                      dataTestIdPrefix={`demo-chapter-${chapter.id}`}
                    />
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            {/* My Library Tab */}
            <TabsContent value="library">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                      My Created Content
                    </h2>
                    <p className="text-muted-foreground">
                      Your saved interactive chapters
                    </p>
                  </div>
                  <Button variant="warm" onClick={onUploadContent} className="gap-2" data-testid="library-create-new-button">
                    <Plus className="w-4 h-4" />
                    Create New
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : savedChapters.length === 0 ? (
                  <Card className="border-2 border-dashed border-muted">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Library className="w-16 h-16 text-muted-foreground/50 mb-4" />
                      <h3 className="font-display font-bold text-xl text-foreground mb-2">
                        No saved content yet
                      </h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        Create your first interactive chapter by uploading educational content. 
                        Our AI will generate beautiful illustrations and interactive elements.
                      </p>
                      <Button variant="warm" onClick={onUploadContent} className="gap-2" data-testid="library-create-first-button">
                        <Plus className="w-4 h-4" />
                        Create Your First Chapter
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedChapters.map((chapter, idx) => (
                      <ChapterCard
                        key={chapter.id}
                        chapter={chapter}
                        index={sampleChapters.length + idx}
                        onClick={() => onStartReading(sampleChapters.length + idx)}
                        onDelete={() => setDeleteConfirm(chapter)}
                        onToggleFavorite={() => handleToggleFavorite(chapter)}
                        isFavorite={chapter.favorite}
                        isFavoriteUpdating={favoriteUpdatingId === chapter.id}
                        showDate
                        dataTestIdPrefix={`library-chapter-${chapter.id}`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-4">
              Interactive Learning Made Easy
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our visual approach transforms complex topics into engaging, memorable experiences
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-0 shadow-soft hover:shadow-medium transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Jump into our interactive content or upload your own educational material 
              to create custom learning experiences.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="warm" size="xl" onClick={() => onStartReading(0)} className="gap-2" data-testid="cta-start-demo-button">
                <Play className="w-5 h-5" />
                Start Demo
              </Button>
              <Button variant="outline" size="xl" onClick={onUploadContent} className="gap-2" data-testid="cta-create-own-button">
                <Plus className="w-5 h-5" />
                Create Your Own
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-semibold text-foreground">LearnScape</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Interactive educational experiences for everyone
            </p>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Chapter?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.title}"? 
              This will permanently remove the chapter and all its topics, hotspots, and annotations.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} data-testid="delete-chapter-cancel-button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChapter}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="delete-chapter-confirm-button"
            >
              {isDeleting ? 'Deleting...' : 'Delete Chapter'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Chapter Card Component
const ChapterCard = ({
  chapter,
  index,
  onClick,
  onDelete,
  onToggleFavorite,
  isFavorite = false,
  isFavoriteUpdating = false,
  isDemo = false,
  showDate = false,
  dataTestIdPrefix = 'chapter-card'
}) => {
  const SubjectIcon = subjectIcons[chapter.subject] || BookOpen;
  const gradientClass = subjectGradients[chapter.subject] || 'from-primary to-accent';
  const topicCount = chapter.topics?.length || 0;
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        className="group cursor-pointer h-full border-0 shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden relative"
        data-testid={`${dataTestIdPrefix}-card`}
      >
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            disabled={isFavoriteUpdating}
            className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-yellow-100 rounded-full w-8 h-8"
            data-testid={`${dataTestIdPrefix}-favorite-button`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`} fill={isFavorite ? 'currentColor' : 'none'} />
          </Button>
        )}
        {/* Delete button */}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-destructive hover:text-destructive-foreground rounded-full w-8 h-8"
            data-testid={`${dataTestIdPrefix}-delete-button`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}

        <div onClick={onClick} data-testid={`${dataTestIdPrefix}-open-button`}>
          {/* Header with gradient */}
          <div className={`h-32 bg-gradient-to-br ${gradientClass} relative overflow-hidden`}>
            {chapter.topics?.[0]?.illustration ? (
              <img 
                src={chapter.topics[0].illustration} 
                alt={chapter.title}
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <SubjectIcon className="w-16 h-16 text-white/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm capitalize" data-testid={`${dataTestIdPrefix}-subject-badge`}>
                {chapter.subject}
              </Badge>
              {isDemo && (
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm" data-testid={`${dataTestIdPrefix}-demo-badge`}>
                  Demo
                </Badge>
              )}
              {!isDemo && isFavorite && (
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm" data-testid={`${dataTestIdPrefix}-favorite-badge`}>
                  Favorite
                </Badge>
              )}
            </div>
          </div>
          
          <CardContent className="p-4">
            <h3 className="font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2" data-testid={`${dataTestIdPrefix}-title`}>
              {chapter.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid={`${dataTestIdPrefix}-description`}>
              {chapter.description || `Interactive ${chapter.subject} content`}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground" data-testid={`${dataTestIdPrefix}-meta`}>
                <span className="flex items-center gap-1" data-testid={`${dataTestIdPrefix}-topic-count`}>
                  <Layers className="w-3 h-3" />
                  {topicCount} topic{topicCount !== 1 ? 's' : ''}
                </span>
                {showDate && chapter.created_at && (
                  <span className="flex items-center gap-1" data-testid={`${dataTestIdPrefix}-created-date`}>
                    <Clock className="w-3 h-3" />
                    {formatDate(chapter.created_at)}
                  </span>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default HomePage;
