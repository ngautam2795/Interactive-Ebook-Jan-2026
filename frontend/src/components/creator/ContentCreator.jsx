import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, X, Check, Loader2, Sparkles,
  BookOpen, Layers, MousePointerClick, ArrowRight,
  Image as ImageIcon, Wand2, FlaskConical, Landmark, Calculator,
  Zap, Crown, Star
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const subjectIcons = {
  science: FlaskConical,
  history: Landmark,
  math: Calculator
};

const modelOptions = [
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    description: 'Fast & affordable',
    icon: Zap,
    speed: 'fast',
    quality: 'good'
  },
  {
    id: 'flux-kontext-pro',
    name: 'Flux Kontext Pro',
    description: 'Balanced quality',
    icon: Star,
    speed: 'medium',
    quality: 'high'
  },
  {
    id: 'flux-kontext-max',
    name: 'Flux Kontext Max',
    description: 'Premium quality',
    icon: Crown,
    speed: 'slow',
    quality: 'premium'
  },
  {
    id: '4o-image',
    name: 'GPT-Image-1',
    description: 'OpenAI model',
    icon: Sparkles,
    speed: 'medium',
    quality: 'high'
  }
];

const aspectRatios = [
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '4:3', label: '4:3 (Standard)' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '3:4', label: '3:4 (Portrait)' },
  { value: '9:16', label: '9:16 (Mobile)' }
];

export const ContentCreator = ({ onContentCreated, onClose }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('science');
  const [textContent, setTextContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1); // 1: content, 2: image, 3: preview
  
  // Image generation state
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('nano-banana-pro');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  
  // Parsed content
  const [parsedContent, setParsedContent] = useState(null);

  const sampleContent = `## How Volcanoes Work

Volcanoes are openings in Earth's crust that allow molten rock, ash, and gases to escape from deep within the planet. When pressure builds up beneath the surface, it can cause dramatic eruptions.

## The Magma Chamber

Deep beneath every volcano lies a magma chamber - a large pool of molten rock. This superheated material rises from Earth's mantle and collects in these underground reservoirs. The temperature can exceed 1,200°C.

## Types of Eruptions

Volcanic eruptions can be explosive or effusive. Explosive eruptions blast ash and rock high into the atmosphere, while effusive eruptions produce flowing rivers of lava. The type depends on the magma's composition and gas content.`;

  const handleUseSample = () => {
    setTextContent(sampleContent);
    setTitle('Volcanoes: Nature\'s Power');
    setImagePrompt('Educational illustration of a volcanic eruption showing magma chamber, lava flow, ash cloud, cross-section view, colorful and engaging style for students');
  };

  const handleProcessContent = async () => {
    if (!textContent.trim() || !title.trim()) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 15, 90));
    }, 300);

    try {
      const response = await axios.post(`${API}/chapters`, {
        title,
        subject,
        description: `Interactive chapter about ${title}`,
        content: textContent
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      setParsedContent(response.data);
      
      // Auto-generate image prompt if empty
      if (!imagePrompt) {
        setImagePrompt(`Educational illustration for ${title}, ${subject} topic, colorful and engaging visual style suitable for students, modern flat design with clear visual elements`);
      }
      
      setStep(2);
    } catch (error) {
      console.error('Processing error:', error);
      setImageError('Failed to process content. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    
    setIsGeneratingImage(true);
    setImageError('');
    
    try {
      // Start image generation
      const response = await axios.post(`${API}/generate-image`, {
        prompt: imagePrompt,
        model: selectedModel,
        aspect_ratio: aspectRatio,
        output_format: 'png'
      });
      
      const taskId = response.data.task_id;
      
      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max
      
      const pollStatus = async () => {
        try {
          const statusResponse = await axios.get(`${API}/image-status/${taskId}`);
          const { status, image_url } = statusResponse.data;
          
          if (status === 'completed' || status === 'success' || image_url) {
            setGeneratedImageUrl(image_url);
            setIsGeneratingImage(false);
            return;
          }
          
          if (status === 'failed' || status === 'error') {
            setImageError('Image generation failed. Please try again.');
            setIsGeneratingImage(false);
            return;
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(pollStatus, 2000);
          } else {
            setImageError('Image generation timed out. Please try again.');
            setIsGeneratingImage(false);
          }
        } catch (err) {
          console.error('Status poll error:', err);
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(pollStatus, 3000);
          } else {
            setImageError('Failed to check image status.');
            setIsGeneratingImage(false);
          }
        }
      };
      
      setTimeout(pollStatus, 3000); // Start polling after 3 seconds
      
    } catch (error) {
      console.error('Image generation error:', error);
      setImageError(error.response?.data?.detail || 'Failed to generate image');
      setIsGeneratingImage(false);
    }
  };

  const handleFinish = () => {
    if (parsedContent) {
      // Update the first topic with the generated image
      const updatedContent = {
        ...parsedContent,
        topics: parsedContent.topics.map((topic, idx) => 
          idx === 0 && generatedImageUrl 
            ? { ...topic, illustration: generatedImageUrl }
            : topic
        )
      };
      onContentCreated(updatedContent);
    }
  };

  const SubjectIcon = subjectIcons[subject] || FlaskConical;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid="content-creator-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
        data-testid="content-creator-backdrop"
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-auto bg-background rounded-2xl shadow-elevated"
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
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full" data-testid="content-creator-close-button">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 py-4 border-b border-border">
          {[
            { num: 1, label: 'Content' },
            { num: 2, label: 'Image' },
            { num: 3, label: 'Preview' }
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                ${step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
              `}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-sm ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {idx < 2 && <div className="w-8 h-0.5 bg-muted mx-2" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {/* Step 1: Content Input */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2" data-testid="creator-tabs-list">
                    <TabsTrigger value="content" className="gap-2" data-testid="creator-tab-content">
                      <FileText className="w-4 h-4" />
                      Paste Text
                    </TabsTrigger>
                    <TabsTrigger value="sample" className="gap-2" data-testid="creator-tab-sample">
                      <Sparkles className="w-4 h-4" />
                      Try Sample
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4 mt-4">
                    {/* Title Input */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Chapter Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., The Solar System"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border-2 focus:border-primary"
                        data-testid="creator-title-input"
                      />
                    </div>

                    {/* Subject Select */}
                    <div className="space-y-2">
                      <Label>Subject Area</Label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger className="border-2" data-testid="creator-subject-select">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="science" data-testid="creator-subject-option-science">
                            <div className="flex items-center gap-2">
                              <FlaskConical className="w-4 h-4 text-secondary" />
                              Science
                            </div>
                          </SelectItem>
                          <SelectItem value="history" data-testid="creator-subject-option-history">
                            <div className="flex items-center gap-2">
                              <Landmark className="w-4 h-4 text-accent" />
                              History
                            </div>
                          </SelectItem>
                          <SelectItem value="math" data-testid="creator-subject-option-math">
                            <div className="flex items-center gap-2">
                              <Calculator className="w-4 h-4 text-primary" />
                              Mathematics
                            </div>
                          </SelectItem>
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
                        className="min-h-[200px] font-mono text-sm border-2 focus:border-primary"
                        data-testid="creator-content-textarea"
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
                          See how the system transforms educational text into interactive pages
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
                          data-testid="creator-use-sample-button"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Load Sample: Volcanoes
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Process Button */}
                {textContent && title && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      variant="warm"
                      size="lg"
                      className="w-full"
                      onClick={handleProcessContent}
                      disabled={isProcessing}
                      data-testid="creator-process-button"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing Content...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-5 h-5 mr-2" />
                          Continue to Image Generation
                        </>
                      )}
                    </Button>

                    {isProcessing && (
                      <div className="mt-4 space-y-2">
                        <Progress value={progress} className="h-2" data-testid="creator-progress-bar" />
                        <p className="text-sm text-center text-muted-foreground">
                          {progress < 30 && "Analyzing content structure..."}
                          {progress >= 30 && progress < 60 && "Extracting key concepts..."}
                          {progress >= 60 && progress < 90 && "Creating interactive elements..."}
                          {progress >= 90 && "Finalizing..."}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Image Generation */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Image Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-primary" />
                    Image Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the illustration you want to generate..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="min-h-[100px] border-2 focus:border-primary"
                    data-testid="creator-image-prompt-textarea"
                  />
                </div>

                {/* Model Selection */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    AI Model
                  </Label>
                  <RadioGroup 
                    value={selectedModel} 
                    onValueChange={setSelectedModel}
                    className="grid grid-cols-2 gap-3"
                    data-testid="creator-model-radio-group"
                  >
                    {modelOptions.map((model) => {
                      const ModelIcon = model.icon;
                      return (
                        <Label
                          key={model.id}
                          htmlFor={model.id}
                          className={`
                            flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                            ${selectedModel === model.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                            }
                          `}
                          data-testid={`creator-model-${model.id}-option`}
                        >
                          <RadioGroupItem value={model.id} id={model.id} className="mt-1" data-testid={`creator-model-${model.id}-radio`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <ModelIcon className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-foreground">{model.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-[10px]">
                                {model.speed}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {model.quality}
                              </Badge>
                            </div>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generated Image Preview */}
                {generatedImageUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-2"
                  >
                    <Label className="text-success flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Generated Image
                    </Label>
                    <div className="rounded-xl overflow-hidden border-2 border-success">
                      <img 
                        src={generatedImageUrl} 
                        alt="Generated illustration"
                        className="w-full h-auto"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {imageError && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {imageError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    variant={generatedImageUrl ? 'outline' : 'warm'}
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !imagePrompt}
                    className="flex-1"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        {generatedImageUrl ? 'Regenerate' : 'Generate Image'}
                      </>
                    )}
                  </Button>
                  {generatedImageUrl && (
                    <Button
                      variant="warm"
                      onClick={() => setStep(3)}
                      className="flex-1"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>

                {/* Skip option */}
                {!generatedImageUrl && (
                  <Button
                    variant="ghost"
                    onClick={() => setStep(3)}
                    className="w-full text-muted-foreground"
                  >
                    Skip image generation
                  </Button>
                )}
              </motion.div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && parsedContent && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-success">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Content Ready!</span>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <SubjectIcon className="w-6 h-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{parsedContent.title}</CardTitle>
                        <CardDescription className="capitalize">{parsedContent.subject}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {generatedImageUrl && (
                      <div className="rounded-lg overflow-hidden mb-4">
                        <img 
                          src={generatedImageUrl} 
                          alt="Chapter illustration"
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                    
                    {parsedContent.topics?.map((topic, idx) => (
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
                            {topic.hotspots?.length || 0} interactive elements
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
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="warm" 
                    className="flex-1"
                    onClick={handleFinish}
                  >
                    Start Learning
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContentCreator;
