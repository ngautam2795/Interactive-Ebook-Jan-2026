import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Sparkles, Upload, FlaskConical, Landmark, Calculator,
  ArrowRight, Star, Users, Award, ChevronRight, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sampleChapters, getSubjectColor } from '@/data/sampleContent';

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

export const HomePage = ({ onStartReading, onUploadContent }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);

  const stats = [
    { icon: BookOpen, value: '4', label: 'Chapters' },
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

        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-16 sm:pt-12 sm:pb-24">
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
                  onClick={onStartReading}
                  className="gap-2"
                >
                  <Play className="w-5 h-5" />
                  Explore Demo
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  onClick={onUploadContent}
                  className="gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload Content
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-10">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="font-display font-bold text-2xl text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hero Illustration */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Main illustration card */}
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

                {/* Floating feature cards */}
                <motion.div
                  className="absolute -bottom-4 -left-4 sm:-left-8 glass rounded-xl p-3 shadow-medium"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Tap to Learn</span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -top-4 -right-4 sm:-right-8 glass rounded-xl p-3 shadow-medium"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Award className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Track Progress</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
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

      {/* Chapters Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="font-display font-bold text-3xl text-foreground mb-2">
                Available Chapters
              </h2>
              <p className="text-muted-foreground">
                Start exploring our interactive content
              </p>
            </div>
            <Button variant="ghost" className="hidden sm:flex gap-2">
              View All
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleChapters.map((chapter, idx) => {
              const SubjectIcon = subjectIcons[chapter.subject] || BookOpen;
              const gradientClass = subjectGradients[chapter.subject] || 'from-primary to-accent';
              
              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card 
                    className="group cursor-pointer h-full border-0 shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden"
                    onClick={onStartReading}
                  >
                    {/* Header with gradient */}
                    <div className={`h-32 bg-gradient-to-br ${gradientClass} relative overflow-hidden`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <SubjectIcon className="w-16 h-16 text-white/30" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-white/20 text-white border-0 backdrop-blur-sm capitalize">
                        {chapter.subject}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {chapter.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {chapter.topics.length} topic{chapter.topics.length > 1 ? 's' : ''}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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
              <Button variant="warm" size="xl" onClick={onStartReading} className="gap-2">
                <Play className="w-5 h-5" />
                Start Demo
              </Button>
              <Button variant="outline" size="xl" onClick={onUploadContent} className="gap-2">
                <Upload className="w-5 h-5" />
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
    </div>
  );
};

export default HomePage;
