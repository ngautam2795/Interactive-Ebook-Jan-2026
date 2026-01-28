import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, X, Eye, Edit3, ChevronLeft, ChevronRight,
  Settings, Layers, Image as ImageIcon, Wand2, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Hotspot, HotspotModal } from './Hotspot';
import { AnnotationTools } from './AnnotationTools';

export const InteractiveEditor = ({
  topic,
  onSave,
  onClose,
  isEditing = false
}) => {
  const containerRef = useRef(null);
  const [editedTopic, setEditedTopic] = useState({ ...topic });
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState(isEditing ? 'edit' : 'preview'); // 'edit' or 'preview'
  const [showAnnotationTools, setShowAnnotationTools] = useState(false);

  const handleHotspotClick = (hotspotId) => {
    const hotspot = editedTopic.hotspots?.find(h => h.id === hotspotId);
    if (hotspot) {
      setActiveHotspot(hotspot);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setActiveHotspot(null), 300);
  };

  const handleUpdateHotspots = (newHotspots) => {
    setEditedTopic(prev => ({ ...prev, hotspots: newHotspots }));
  };

  const handleUpdateAnnotations = (newAnnotations) => {
    setEditedTopic(prev => ({ ...prev, annotations: newAnnotations }));
  };

  const handleSave = () => {
    onSave(editedTopic);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">
              {editedTopic.title}
            </h1>
            <p className="text-sm text-muted-foreground">{editedTopic.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
            <Button
              variant={mode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('preview')}
              className="gap-1.5"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button
              variant={mode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('edit')}
              className="gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          </div>

          {/* Save Button */}
          {mode === 'edit' && (
            <Button variant="warm" onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-6">
          <div 
            ref={containerRef}
            className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-elevated bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
          >
            {/* Illustration */}
            <div className="relative aspect-[16/10]">
              {editedTopic.illustration ? (
                <img
                  src={editedTopic.illustration}
                  alt={editedTopic.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/30">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-muted-foreground">No illustration</p>
                    {mode === 'edit' && (
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Image
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Hotspots */}
              {editedTopic.hotspots?.map((hotspot, idx) => (
                <Hotspot
                  key={hotspot.id}
                  {...hotspot}
                  index={idx}
                  isActive={activeHotspot?.id === hotspot.id}
                  onActivate={handleHotspotClick}
                />
              ))}

              {/* Annotations */}
              {editedTopic.annotations?.map((annotation) => (
                <AnnotationRenderer
                  key={annotation.id}
                  annotation={annotation}
                />
              ))}

              {/* Edit Mode Overlay */}
              {mode === 'edit' && showAnnotationTools && (
                <AnnotationTools
                  annotations={editedTopic.annotations || []}
                  hotspots={editedTopic.hotspots || []}
                  onAnnotationsChange={handleUpdateAnnotations}
                  onHotspotsChange={handleUpdateHotspots}
                  containerRef={containerRef}
                />
              )}
            </div>

            {/* Tap hint (preview mode only) */}
            {mode === 'preview' && editedTopic.hotspots?.length > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-foreground">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Tap the markers to learn more
              </div>
            )}
          </div>

          {/* Content Card */}
          {mode === 'preview' ? (
            <Card className="max-w-4xl mx-auto mt-6">
              <CardContent className="p-6">
                <p className="text-foreground leading-relaxed">{editedTopic.content}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-4xl mx-auto mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editedTopic.title}
                      onChange={(e) => setEditedTopic(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={editedTopic.subtitle || ''}
                      onChange={(e) => setEditedTopic(prev => ({ ...prev, subtitle: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editedTopic.content}
                    onChange={(e) => setEditedTopic(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar (Edit Mode) */}
        {mode === 'edit' && (
          <div className="w-80 border-l border-border bg-card overflow-auto">
            <Tabs defaultValue="hotspots" className="h-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border px-4 h-12">
                <TabsTrigger value="hotspots" className="gap-1.5">
                  <Layers className="w-4 h-4" />
                  Hotspots
                </TabsTrigger>
                <TabsTrigger value="tools" className="gap-1.5">
                  <Edit3 className="w-4 h-4" />
                  Tools
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hotspots" className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Interactive Elements</h3>
                  <Badge variant="outline">{editedTopic.hotspots?.length || 0}</Badge>
                </div>

                <div className="space-y-2">
                  {editedTopic.hotspots?.map((hotspot, idx) => (
                    <div
                      key={hotspot.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: `hsl(var(--${hotspot.color || 'primary'}))` }}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{hotspot.label}</h4>
                        <p className="text-xs text-muted-foreground truncate">{hotspot.title}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => {
                          const newHotspots = editedTopic.hotspots.filter(h => h.id !== hotspot.id);
                          handleUpdateHotspots(newHotspots);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {(!editedTopic.hotspots || editedTopic.hotspots.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hotspots yet</p>
                      <p className="text-xs mt-1">Use the tools to add interactive elements</p>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowAnnotationTools(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Hotspot
                </Button>
              </TabsContent>

              <TabsContent value="tools" className="p-4 space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Annotation Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Add arrows, boxes, and text labels to highlight important areas.
                  </p>
                  
                  <Button
                    variant={showAnnotationTools ? 'default' : 'outline'}
                    className="w-full gap-2"
                    onClick={() => setShowAnnotationTools(!showAnnotationTools)}
                  >
                    <Edit3 className="w-4 h-4" />
                    {showAnnotationTools ? 'Hide Tools' : 'Show Tools'}
                  </Button>

                  {showAnnotationTools && (
                    <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-2">How to use:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Select a tool from the toolbar</li>
                        <li>Click and drag on the image</li>
                        <li>Click elements to select them</li>
                        <li>Press Delete to remove</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Annotations List */}
                {editedTopic.annotations?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground text-sm">Annotations</h4>
                    {editedTopic.annotations.map((annotation, idx) => (
                      <div
                        key={annotation.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                      >
                        <div 
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: `hsl(var(--${annotation.color || 'primary'}))` }}
                        >
                          {annotation.type === 'arrow' ? '→' : annotation.type === 'box' ? '□' : 'T'}
                        </div>
                        <span className="text-sm text-foreground capitalize">{annotation.type}</span>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => {
                            handleUpdateAnnotations(
                              editedTopic.annotations.filter(a => a.id !== annotation.id)
                            );
                          }}
                          className="ml-auto text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Hotspot Modal */}
      <HotspotModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={activeHotspot?.title}
        description={activeHotspot?.description}
        funFact={activeHotspot?.fun_fact || activeHotspot?.funFact}
        icon={activeHotspot?.icon}
        color={activeHotspot?.color}
      />
    </motion.div>
  );
};

// Simple annotation renderer for preview
const AnnotationRenderer = ({ annotation }) => {
  const colorVar = `hsl(var(--${annotation.color || 'primary'}))`;
  
  if (annotation.type === 'arrow') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        <defs>
          <marker
            id={`arrowhead-${annotation.id}`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={colorVar} />
          </marker>
        </defs>
        <line
          x1={`${annotation.x}%`}
          y1={`${annotation.y}%`}
          x2={`${annotation.end_x}%`}
          y2={`${annotation.end_y}%`}
          stroke={colorVar}
          strokeWidth="3"
          markerEnd={`url(#arrowhead-${annotation.id})`}
        />
      </svg>
    );
  }
  
  if (annotation.type === 'box') {
    return (
      <div
        className="absolute border-2 rounded-lg pointer-events-none"
        style={{
          left: `${annotation.x}%`,
          top: `${annotation.y}%`,
          width: `${annotation.width}%`,
          height: `${annotation.height}%`,
          borderColor: colorVar,
          backgroundColor: `${colorVar}15`
        }}
      />
    );
  }
  
  if (annotation.type === 'text') {
    return (
      <div
        className="absolute px-2 py-1 rounded font-semibold text-sm pointer-events-none"
        style={{
          left: `${annotation.x}%`,
          top: `${annotation.y}%`,
          color: colorVar,
          backgroundColor: 'hsl(var(--background) / 0.9)'
        }}
      >
        {annotation.text}
      </div>
    );
  }
  
  return null;
};

export default InteractiveEditor;
