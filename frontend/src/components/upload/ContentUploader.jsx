import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, X, Check, Loader2, Sparkles,
  BookOpen, Layers, MousePointerClick, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock content parser - simulates AI processing
const parseContent = async (text, subject) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simple parsing logic - split by headers or double newlines
  const sections = text.split(/\n\n+/).filter(s => s.trim());
  
  const chapters = [{
    id: `custom-${Date.now()}`,
    title: 'Your Custom Chapter',
    subject: subject,
    description: 'Created from your uploaded content',
    topics: sections.slice(0, 3).map((section, idx) => {
      const lines = section.split('\n');
      const title = lines[0].replace(/^#+\s*/, '').trim() || `Topic ${idx + 1}`;
      const content = lines.slice(1).join(' ').trim() || section;
      
      // Generate mock hotspots based on keywords in content
      const keywords = extractKeywords(content);
      const hotspots = keywords.map((keyword, kidx) => ({
        id: `hotspot-${idx}-${kidx}`,
        x: 15 + (kidx * 20) % 70,
        y: 20 + (kidx * 15) % 60,
        label: keyword,
        icon: getIconForKeyword(keyword),
        color: getColorForIndex(kidx),
        title: keyword,
        description: `Learn more about ${keyword.toLowerCase()} and its importance in this topic.`,
        funFact: `This concept is fundamental to understanding ${title.toLowerCase()}.`
      }));

      return {
        id: `topic-${Date.now()}-${idx}`,
        title,
        subtitle: 'Custom Interactive Content',
        content,
        hotspots
      };
    })
  }];

  return chapters;
};

const extractKeywords = (text) => {
  // Simple keyword extraction - find capitalized words or words after "the", "a"
  const words = text.match(/\b[A-Z][a-z]+\b/g) || [];
  const unique = [...new Set(words)].slice(0, 6);
  return unique.length > 0 ? unique : ['Concept', 'Element', 'Process', 'Structure'];
};

const getIconForKeyword = (keyword) => {
  const icons = ['sparkles', 'sun', 'leaf', 'droplets', 'wind', 'cloud'];
  return icons[keyword.length % icons.length];
};

const getColorForIndex = (idx) => {
  const colors = ['primary', 'secondary', 'accent', 'warning', 'muted'];
  return colors[idx % colors.length];
};

export const ContentUploader = ({ onContentParsed, onClose }) => {
  const [activeTab, setActiveTab] = useState('paste');
  const [textContent, setTextContent] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('science');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedPreview, setParsedPreview] = useState(null);

  const sampleContent = `# How Volcanoes Work

Volcanoes are openings in Earth's crust that allow molten rock, ash, and gases to escape from deep within the planet. When pressure builds up beneath the surface, it can cause dramatic eruptions.

## The Magma Chamber

Deep beneath every volcano lies a magma chamber - a large pool of molten rock. This superheated material rises from Earth's mantle and collects in these underground reservoirs. The temperature can exceed 1,200°C.

## Types of Eruptions

Volcanic eruptions can be explosive or effusive. Explosive eruptions blast ash and rock high into the atmosphere, while effusive eruptions produce flowing rivers of lava. The type depends on the magma's composition and gas content.

## Ring of Fire

The Pacific Ring of Fire is home to 75% of Earth's volcanoes. This horseshoe-shaped zone stretches around the Pacific Ocean, marking where tectonic plates collide and create volcanic activity.`;

  const handleProcess = async () => {
    if (!textContent.trim()) return;
    
    setIsProcessing(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const chapters = await parseContent(textContent, subject);
      clearInterval(progressInterval);
      setProgress(100);
      setParsedPreview(chapters);
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (parsedPreview) {
      onContentParsed(parsedPreview);
    }
  };

  const handleUseSample = () => {
    setTextContent(sampleContent);
    setTitle('Volcanoes: Nature\'s Power');
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-background rounded-2xl shadow-elevated"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">
                Create Interactive Content
              </h2>
              <p className="text-sm text-muted-foreground">
                Transform your text into interactive lessons
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!parsedPreview ? (
            <div className="space-y-4">
              {/* Input Method Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="paste" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Paste Text
                  </TabsTrigger>
                  <TabsTrigger value="sample" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Try Sample
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="paste" className="space-y-4 mt-4">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Chapter Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., The Solar System"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Subject Select */}
                  <div className="space-y-2">
                    <Label>Subject Area</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="science">🔬 Science</SelectItem>
                        <SelectItem value="history">🏛️ History</SelectItem>
                        <SelectItem value="math">📐 Mathematics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Text Input */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Educational Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Paste your educational text here. Use ## for topic headings..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tip: Use markdown headings (## Topic) to separate topics
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="sample" className="mt-4">
                  <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg">Try with Sample Content</CardTitle>
                      <CardDescription>
                        See how the parser transforms educational text into interactive pages
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="gap-1">
                          <BookOpen className="w-3 h-3" />
                          3 Topics
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Layers className="w-3 h-3" />
                          12+ Concepts
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          Interactive Hotspots
                        </Badge>
                      </div>
                      <Button 
                        variant="warm" 
                        className="w-full"
                        onClick={handleUseSample}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Load Sample: Volcanoes
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Process Button */}
              {textContent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    variant="warm"
                    size="lg"
                    className="w-full"
                    onClick={handleProcess}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Content...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Interactive Pages
                      </>
                    )}
                  </Button>

                  {isProcessing && (
                    <div className="mt-4 space-y-2">
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-center text-muted-foreground">
                        {progress < 30 && "Analyzing content structure..."}
                        {progress >= 30 && progress < 60 && "Extracting key concepts..."}
                        {progress >= 60 && progress < 90 && "Generating hotspots..."}
                        {progress >= 90 && "Finalizing interactive pages..."}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ) : (
            /* Preview */
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-2 text-success">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Content Processed Successfully!</span>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{parsedPreview[0]?.title}</CardTitle>
                  <CardDescription>Preview of generated content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {parsedPreview[0]?.topics.map((topic, idx) => (
                    <div 
                      key={topic.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{topic.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {topic.hotspots.length} interactive elements
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setParsedPreview(null)}
                >
                  Edit Content
                </Button>
                <Button 
                  variant="warm" 
                  className="flex-1"
                  onClick={handleConfirm}
                >
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContentUploader;
