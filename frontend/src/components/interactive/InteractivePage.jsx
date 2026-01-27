import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hotspot, HotspotModal } from './Hotspot';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSubjectColor, getSubjectIcon } from '@/data/sampleContent';
import { FlaskConical, Landmark, Calculator, Edit3 } from 'lucide-react';

const subjectIcons = {
  science: FlaskConical,
  history: Landmark,
  math: Calculator
};

export const InteractivePage = ({ 
  topic,
  chapterTitle,
  chapterId,
  subject,
  onHotspotActivate,
  onEdit
}) => {
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const SubjectIcon = subjectIcons[subject] || FlaskConical;
  const subjectColor = getSubjectColor(subject);

  const handleHotspotClick = (hotspotId) => {
    const hotspots = topic.hotspots || [];
    const hotspot = hotspots.find(h => h.id === hotspotId);
    if (hotspot) {
      setActiveHotspot(hotspot);
      setModalOpen(true);
      onHotspotActivate?.(hotspotId);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setActiveHotspot(null), 300);
  };

  // Get background gradient based on topic or subject
  const getBgGradient = () => {
    if (topic.illustrationBg) {
      return `bg-gradient-to-br ${topic.illustrationBg}`;
    }
    switch (subject) {
      case 'science':
        return 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50';
      case 'history':
        return 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50';
      case 'math':
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50';
      default:
        return 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50';
    }
  };

  const hotspots = topic.hotspots || [];
  const annotations = topic.annotations || [];

  return (
    <motion.div
      className="min-h-[calc(100vh-140px)] pt-20 pb-24 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Chapter & Subject Badge */}
        <motion.div
          className="flex items-center gap-2 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Badge 
            variant="outline" 
            className={`gap-1.5 px-3 py-1.5 border-2 font-semibold capitalize`}
            style={{
              borderColor: `hsl(var(--${subjectColor}))`,
              color: `hsl(var(--${subjectColor}))`
            }}
          >
            <SubjectIcon className="w-3.5 h-3.5" />
            {subject}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {chapterTitle}
          </span>
        </motion.div>

        {/* Topic Title */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground mb-2">
            {topic.title}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {topic.subtitle}
          </p>
        </motion.div>

        {/* Interactive Illustration */}
        <motion.div
          className={`relative rounded-2xl overflow-hidden shadow-elevated mb-6 ${getBgGradient()}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Illustration Image */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9]">
            {topic.illustration && topic.illustration.startsWith('http') ? (
              <img
                src={topic.illustration}
                alt={topic.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <IllustrationPlaceholder 
                subject={subject} 
                title={topic.title}
                darkMode={topic.darkMode}
              />
            )}
            
            {/* Overlay gradient for better hotspot visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

            {/* Annotations */}
            {annotations.map((annotation) => (
              <AnnotationRenderer key={annotation.id} annotation={annotation} />
            ))}

            {/* Hotspots */}
            {hotspots.map((hotspot, idx) => (
              <Hotspot
                key={hotspot.id}
                {...hotspot}
                index={idx}
                isActive={activeHotspot?.id === hotspot.id}
                onActivate={handleHotspotClick}
              />
            ))}
          </div>

          {/* Edit Button */}
          {onEdit && chapterId && (
            <motion.div
              className="absolute top-4 right-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="glass"
                size="sm"
                onClick={() => onEdit(topic, chapterId)}
                className="gap-2 bg-white/80 hover:bg-white"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </Button>
            </motion.div>
          )}

          {/* Tap hint */}
          {hotspots.length > 0 && (
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Tap the markers to learn more
            </motion.div>
          )}
        </motion.div>

        {/* Content Description */}
        <motion.div
          className="content-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-foreground leading-relaxed text-base sm:text-lg">
            {topic.content}
          </p>
        </motion.div>

        {/* Hotspot List (for accessibility) */}
        {hotspots.length > 0 && (
          <motion.div
            className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {hotspots.map((hotspot, idx) => (
              <motion.button
                key={hotspot.id}
                className="flex items-center gap-2 p-3 rounded-xl bg-card hover:bg-muted transition-colors text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleHotspotClick(hotspot.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (idx * 0.05) }}
              >
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center`}
                  style={{ backgroundColor: `hsl(var(--${hotspot.color || 'primary'}) / 0.15)` }}
                >
                  <span className="text-xs font-bold" style={{ color: `hsl(var(--${hotspot.color || 'primary'}))` }}>
                    {idx + 1}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground truncate">
                  {hotspot.label}
                </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Hotspot Modal */}
      <HotspotModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={activeHotspot?.title}
        description={activeHotspot?.description}
        funFact={activeHotspot?.funFact}
        icon={activeHotspot?.icon}
        color={activeHotspot?.color}
      />
    </motion.div>
  );
};

// Placeholder illustration component when no image URL is provided
const IllustrationPlaceholder = ({ subject, title, darkMode }) => {
  const getSubjectElements = () => {
    switch (subject) {
      case 'science':
        return (
          <>
            {/* Sun */}
            <motion.div
              className="absolute top-8 left-8 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {/* Sun rays */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-6 bg-yellow-300 rounded-full"
                  style={{
                    left: '50%',
                    top: '-8px',
                    transformOrigin: 'bottom center',
                    transform: `translateX(-50%) rotate(${i * 45}deg)`
                  }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                />
              ))}
            </motion.div>
            
            {/* Plant/Tree */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <motion.div
                className="w-4 h-24 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg"
                animate={{ scaleY: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
            </div>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-green-300/50"
                style={{
                  left: `${20 + i * 12}%`,
                  top: `${30 + (i % 3) * 15}%`
                }}
                animate={{
                  y: [-10, 10, -10],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </>
        );
      
      case 'history':
        return (
          <>
            {/* Pyramid */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <svg viewBox="0 0 200 150" className="w-64 h-48">
                <motion.polygon
                  points="100,10 180,140 20,140"
                  fill="url(#pyramidGradient)"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                />
                <defs>
                  <linearGradient id="pyramidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Sun */}
            <motion.div
              className="absolute top-12 right-12 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            {/* Sand dunes */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-200 to-transparent" />
          </>
        );
      
      case 'math':
        return (
          <>
            {/* Floating shapes */}
            <motion.div
              className="absolute top-16 left-16 w-20 h-20 rounded-full border-4 border-blue-400 bg-blue-100"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute top-20 right-20 w-16 h-16 bg-indigo-400"
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-24 left-1/4"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <svg viewBox="0 0 100 86" className="w-20 h-20">
                <polygon
                  points="50,0 100,86 0,86"
                  fill="#818CF8"
                />
              </svg>
            </motion.div>
            
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
            </div>
          </>
        );
      
      default:
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-6xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📚
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className={`relative w-full h-full ${darkMode ? 'bg-slate-900' : ''}`}>
      {getSubjectElements()}
      
      {/* Title overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="glass px-4 py-2 rounded-lg inline-block">
          <span className="text-sm font-medium text-foreground/80">
            Interactive: {title}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InteractivePage;
