import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, Save, X, Plus, Trash2, Move, GripVertical,
  Type, ArrowRight, Square, Sparkles, MousePointer,
  Check, Palette, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const tools = [
  { id: 'select', icon: MousePointer, label: 'Select & Move' },
  { id: 'hotspot', icon: Sparkles, label: 'Add Hotspot' },
  { id: 'arrow', icon: ArrowRight, label: 'Draw Arrow' },
  { id: 'box', icon: Square, label: 'Draw Box' },
  { id: 'text', icon: Type, label: 'Add Text' }
];

const colorOptions = [
  { id: 'primary', label: 'Orange', class: 'bg-primary' },
  { id: 'secondary', label: 'Green', class: 'bg-secondary' },
  { id: 'accent', label: 'Coral', class: 'bg-accent' },
  { id: 'warning', label: 'Yellow', class: 'bg-warning' },
  { id: 'destructive', label: 'Red', class: 'bg-destructive' },
  { id: 'muted', label: 'Gray', class: 'bg-muted-foreground' }
];

const iconOptions = [
  'sparkles', 'sun', 'leaf', 'droplets', 'wind', 'cloud', 
  'star', 'zap', 'globe', 'atom', 'flame', 'snowflake'
];

export const TopicEditor = ({
  topic,
  chapterId,
  onSave,
  onClose
}) => {
  const containerRef = useRef(null);
  const [activeTool, setActiveTool] = useState('select');
  const [selectedColor, setSelectedColor] = useState('primary');
  const [hotspots, setHotspots] = useState(topic.hotspots || []);
  const [annotations, setAnnotations] = useState(topic.annotations || []);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [tempAnnotation, setTempAnnotation] = useState(null);
  
  // Dialog states
  const [hotspotDialog, setHotspotDialog] = useState(null);
  const [textDialog, setTextDialog] = useState(null);
  const [editDialog, setEditDialog] = useState(null);

  const getRelativePosition = useCallback((e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    };
  }, []);

  // Handle mouse down on canvas
  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target !== containerRef.current && !e.target.classList.contains('canvas-overlay')) return;
    
    const pos = getRelativePosition(e);
    
    if (activeTool === 'select') {
      setSelectedItem(null);
      return;
    }
    
    if (activeTool === 'hotspot') {
      setHotspotDialog({
        x: pos.x,
        y: pos.y,
        label: '',
        title: '',
        description: '',
        funFact: '',
        icon: 'sparkles',
        color: selectedColor
      });
      return;
    }
    
    if (activeTool === 'text') {
      setTextDialog({
        x: pos.x,
        y: pos.y,
        text: '',
        color: selectedColor
      });
      return;
    }
    
    if (activeTool === 'arrow' || activeTool === 'box') {
      setIsDrawing(true);
      setDrawStart(pos);
    }
  }, [activeTool, getRelativePosition, selectedColor]);

  // Handle mouse move for drawing
  const handleCanvasMouseMove = useCallback((e) => {
    if (!isDrawing || !drawStart) return;
    
    const pos = getRelativePosition(e);
    
    if (activeTool === 'arrow') {
      setTempAnnotation({
        type: 'arrow',
        x: drawStart.x,
        y: drawStart.y,
        end_x: pos.x,
        end_y: pos.y,
        color: selectedColor
      });
    } else if (activeTool === 'box') {
      setTempAnnotation({
        type: 'box',
        x: Math.min(drawStart.x, pos.x),
        y: Math.min(drawStart.y, pos.y),
        width: Math.abs(pos.x - drawStart.x),
        height: Math.abs(pos.y - drawStart.y),
        color: selectedColor
      });
    }
  }, [isDrawing, drawStart, activeTool, getRelativePosition, selectedColor]);

  // Handle mouse up for drawing
  const handleCanvasMouseUp = useCallback(() => {
    if (!isDrawing || !tempAnnotation) {
      setIsDrawing(false);
      return;
    }
    
    // Only add if it has some size
    const minSize = 2;
    let shouldAdd = false;
    
    if (tempAnnotation.type === 'arrow') {
      const dx = Math.abs(tempAnnotation.end_x - tempAnnotation.x);
      const dy = Math.abs(tempAnnotation.end_y - tempAnnotation.y);
      shouldAdd = dx > minSize || dy > minSize;
    } else if (tempAnnotation.type === 'box') {
      shouldAdd = tempAnnotation.width > minSize && tempAnnotation.height > minSize;
    }
    
    if (shouldAdd) {
      const newAnnotation = {
        id: `annotation-${Date.now()}`,
        ...tempAnnotation
      };
      setAnnotations(prev => [...prev, newAnnotation]);
      setSelectedItem({ type: 'annotation', id: newAnnotation.id });
    }
    
    setIsDrawing(false);
    setDrawStart(null);
    setTempAnnotation(null);
    setActiveTool('select');
  }, [isDrawing, tempAnnotation]);

  // Handle hotspot drag
  const handleHotspotDragStart = useCallback((e, hotspot) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    
    const pos = getRelativePosition(e);
    setIsDragging(true);
    setDragOffset({
      x: pos.x - hotspot.x,
      y: pos.y - hotspot.y
    });
    setSelectedItem({ type: 'hotspot', id: hotspot.id });
  }, [activeTool, getRelativePosition]);

  const handleHotspotDrag = useCallback((e) => {
    if (!isDragging || !selectedItem || selectedItem.type !== 'hotspot') return;
    
    const pos = getRelativePosition(e);
    const newX = Math.max(2, Math.min(98, pos.x - dragOffset.x));
    const newY = Math.max(2, Math.min(98, pos.y - dragOffset.y));
    
    setHotspots(prev => prev.map(h => 
      h.id === selectedItem.id ? { ...h, x: newX, y: newY } : h
    ));
  }, [isDragging, selectedItem, getRelativePosition, dragOffset]);

  const handleHotspotDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add hotspot from dialog
  const handleAddHotspot = useCallback(() => {
    if (!hotspotDialog || !hotspotDialog.label || !hotspotDialog.title) {
      toast.error('Please fill in label and title');
      return;
    }
    
    const newHotspot = {
      id: `hotspot-${Date.now()}`,
      x: hotspotDialog.x,
      y: hotspotDialog.y,
      label: hotspotDialog.label,
      title: hotspotDialog.title,
      description: hotspotDialog.description,
      funFact: hotspotDialog.funFact,
      fun_fact: hotspotDialog.funFact,
      icon: hotspotDialog.icon,
      color: hotspotDialog.color
    };
    
    setHotspots(prev => [...prev, newHotspot]);
    setHotspotDialog(null);
    setSelectedItem({ type: 'hotspot', id: newHotspot.id });
    toast.success('Hotspot added');
  }, [hotspotDialog]);

  // Add text annotation from dialog
  const handleAddText = useCallback(() => {
    if (!textDialog || !textDialog.text) {
      toast.error('Please enter text');
      return;
    }
    
    const newAnnotation = {
      id: `annotation-${Date.now()}`,
      type: 'text',
      x: textDialog.x,
      y: textDialog.y,
      text: textDialog.text,
      color: textDialog.color
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    setTextDialog(null);
    setSelectedItem({ type: 'annotation', id: newAnnotation.id });
    toast.success('Text added');
  }, [textDialog]);

  // Delete selected item
  const handleDeleteSelected = useCallback(() => {
    if (!selectedItem) return;
    
    if (selectedItem.type === 'hotspot') {
      setHotspots(prev => prev.filter(h => h.id !== selectedItem.id));
      toast.success('Hotspot deleted');
    } else if (selectedItem.type === 'annotation') {
      setAnnotations(prev => prev.filter(a => a.id !== selectedItem.id));
      toast.success('Annotation deleted');
    }
    
    setSelectedItem(null);
  }, [selectedItem]);

  // Edit selected item
  const handleEditSelected = useCallback(() => {
    if (!selectedItem) return;
    
    if (selectedItem.type === 'hotspot') {
      const hotspot = hotspots.find(h => h.id === selectedItem.id);
      if (hotspot) {
        setEditDialog({ type: 'hotspot', data: { ...hotspot } });
      }
    } else if (selectedItem.type === 'annotation') {
      const annotation = annotations.find(a => a.id === selectedItem.id);
      if (annotation && annotation.type === 'text') {
        setEditDialog({ type: 'text', data: { ...annotation } });
      }
    }
  }, [selectedItem, hotspots, annotations]);

  // Save edit dialog changes
  const handleSaveEdit = useCallback(() => {
    if (!editDialog) return;
    
    if (editDialog.type === 'hotspot') {
      setHotspots(prev => prev.map(h => 
        h.id === editDialog.data.id ? { ...editDialog.data, fun_fact: editDialog.data.funFact } : h
      ));
      toast.success('Hotspot updated');
    } else if (editDialog.type === 'text') {
      setAnnotations(prev => prev.map(a => 
        a.id === editDialog.data.id ? editDialog.data : a
      ));
      toast.success('Text updated');
    }
    
    setEditDialog(null);
  }, [editDialog]);

  // Save all changes to backend
  const handleSaveAll = useCallback(async () => {
    setIsSaving(true);
    
    try {
      await axios.put(`${BACKEND_URL}/api/chapters/${chapterId}/topics/${topic.id}`, {
        hotspots: hotspots.map(h => ({
          id: h.id,
          x: h.x,
          y: h.y,
          label: h.label,
          icon: h.icon || 'sparkles',
          color: h.color || 'primary',
          title: h.title,
          description: h.description,
          fun_fact: h.funFact || h.fun_fact
        })),
        annotations: annotations
      });
      
      toast.success('Changes saved successfully!');
      onSave?.({ ...topic, hotspots, annotations });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [chapterId, topic, hotspots, annotations, onSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItem && !editDialog && !hotspotDialog && !textDialog) {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
      if (e.key === 'Escape') {
        setSelectedItem(null);
        setActiveTool('select');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, editDialog, hotspotDialog, textDialog, handleDeleteSelected]);

  const selectedHotspot = selectedItem?.type === 'hotspot' 
    ? hotspots.find(h => h.id === selectedItem.id) 
    : null;
  const selectedAnnotation = selectedItem?.type === 'annotation'
    ? annotations.find(a => a.id === selectedItem.id)
    : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background"
      data-testid="topic-editor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card" data-testid="topic-editor-header">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="topic-editor-close-button">
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground flex items-center gap-2" data-testid="topic-editor-title">
              <Edit3 className="w-5 h-5 text-primary" />
              Edit: {topic.title}
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="topic-editor-summary">
              {hotspots.length} hotspots • {annotations.length} annotations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose} data-testid="topic-editor-cancel-button">
            Cancel
          </Button>
          <Button variant="warm" onClick={handleSaveAll} disabled={isSaving} data-testid="topic-editor-save-button">
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]" data-testid="topic-editor-body">
        {/* Canvas Area */}
        <div 
          className="flex-1 overflow-auto p-6 bg-muted/30"
          data-testid="topic-editor-canvas-area"
          onMouseMove={isDragging ? handleHotspotDrag : handleCanvasMouseMove}
          onMouseUp={() => {
            handleHotspotDragEnd();
            handleCanvasMouseUp();
          }}
          onMouseLeave={() => {
            handleHotspotDragEnd();
            if (isDrawing) handleCanvasMouseUp();
          }}
        >
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-4 p-2 rounded-xl bg-card shadow-medium max-w-fit mx-auto" data-testid="topic-editor-toolbar">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTool(tool.id)}
                className="gap-2"
                title={tool.label}
                data-testid={`topic-editor-tool-${tool.id}`}
              >
                <tool.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tool.label}</span>
              </Button>
            ))}
            
            <div className="w-px h-6 bg-border mx-1" />
            
            {/* Color Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" data-testid="topic-editor-color-picker">
                  <div 
                    className={`w-5 h-5 rounded-full ${colorOptions.find(c => c.id === selectedColor)?.class}`}
                  />
                  <span className="hidden sm:inline">Color</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <div className="grid grid-cols-3 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      className={`w-10 h-10 rounded-lg ${color.class} border-2 transition-all ${
                        selectedColor === color.id ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedColor(color.id)}
                      title={color.label}
                      data-testid={`topic-editor-color-${color.id}`}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Delete Button */}
            {selectedItem && (
              <>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditSelected}
                  className="gap-2"
                  disabled={selectedAnnotation && selectedAnnotation.type !== 'text'}
                  data-testid="topic-editor-edit-button"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="gap-2 text-destructive hover:text-destructive"
                  data-testid="topic-editor-delete-button"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}
          </div>

          {/* Canvas */}
          <div 
            ref={containerRef}
            className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-elevated bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 cursor-crosshair"
            onMouseDown={handleCanvasMouseDown}
            style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
            data-testid="topic-editor-canvas"
          >
            {/* Overlay for mouse events */}
            <div className="canvas-overlay absolute inset-0 z-10" />
            
            {/* Illustration */}
            <div className="relative aspect-[16/10]">
              {topic.illustration ? (
                <img
                  src={topic.illustration}
                  alt={topic.title}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/30">
                  <p className="text-muted-foreground">No illustration</p>
                </div>
              )}

              {/* Hotspots */}
              {hotspots.map((hotspot) => (
                <DraggableHotspot
                  key={hotspot.id}
                  hotspot={hotspot}
                  isSelected={selectedItem?.id === hotspot.id}
                  onMouseDown={(e) => handleHotspotDragStart(e, hotspot)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'hotspot', id: hotspot.id });
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'hotspot', id: hotspot.id });
                    handleEditSelected();
                  }}
                />
              ))}

              {/* Annotations */}
              {annotations.map((annotation) => (
                <EditableAnnotation
                  key={annotation.id}
                  annotation={annotation}
                  isSelected={selectedItem?.id === annotation.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'annotation', id: annotation.id });
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'annotation', id: annotation.id });
                    if (annotation.type === 'text') handleEditSelected();
                  }}
                />
              ))}

              {/* Temp annotation while drawing */}
              {tempAnnotation && (
                <EditableAnnotation annotation={tempAnnotation} isSelected={false} />
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mt-4 text-sm text-muted-foreground">
            <p>
              {activeTool === 'select' && 'Click to select • Drag hotspots to move • Double-click to edit'}
              {activeTool === 'hotspot' && 'Click on the image to add a hotspot'}
              {activeTool === 'arrow' && 'Click and drag to draw an arrow'}
              {activeTool === 'box' && 'Click and drag to draw a box'}
              {activeTool === 'text' && 'Click on the image to add text'}
            </p>
            {selectedItem && <p className="mt-1">Press Delete to remove selected item</p>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-border bg-card overflow-auto p-4" data-testid="topic-editor-sidebar">
          <h3 className="font-semibold text-foreground mb-4" data-testid="topic-editor-sidebar-title">Elements</h3>
          
          {/* Hotspots List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground" data-testid="topic-editor-hotspots-title">Hotspots</h4>
              <Badge variant="outline" data-testid="topic-editor-hotspots-count">{hotspots.length}</Badge>
            </div>
            <div className="space-y-2">
              {hotspots.map((hotspot, idx) => (
                <div
                  key={hotspot.id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedItem?.id === hotspot.id 
                      ? 'bg-primary/10 ring-1 ring-primary' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                  onClick={() => setSelectedItem({ type: 'hotspot', id: hotspot.id })}
                  data-testid={`topic-editor-hotspot-item-${hotspot.id}`}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: `hsl(var(--${hotspot.color || 'primary'}))` }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate" data-testid={`topic-editor-hotspot-label-${hotspot.id}`}>{hotspot.label}</p>
                    <p className="text-xs text-muted-foreground truncate" data-testid={`topic-editor-hotspot-title-${hotspot.id}`}>{hotspot.title}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem({ type: 'hotspot', id: hotspot.id });
                      setHotspots(prev => prev.filter(h => h.id !== hotspot.id));
                      toast.success('Hotspot deleted');
                    }}
                    className="text-muted-foreground hover:text-destructive"
                    data-testid={`topic-editor-hotspot-delete-${hotspot.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {hotspots.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hotspots yet. Select the Hotspot tool and click on the image.
                </p>
              )}
            </div>
          </div>

          {/* Annotations List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground" data-testid="topic-editor-annotations-title">Annotations</h4>
              <Badge variant="outline" data-testid="topic-editor-annotations-count">{annotations.length}</Badge>
            </div>
            <div className="space-y-2">
              {annotations.map((annotation, idx) => (
                <div
                  key={annotation.id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedItem?.id === annotation.id 
                      ? 'bg-primary/10 ring-1 ring-primary' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                  onClick={() => setSelectedItem({ type: 'annotation', id: annotation.id })}
                  data-testid={`topic-editor-annotation-item-${annotation.id}`}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: `hsl(var(--${annotation.color || 'primary'}))` }}
                  >
                    {annotation.type === 'arrow' ? '→' : annotation.type === 'box' ? '□' : 'T'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize" data-testid={`topic-editor-annotation-type-${annotation.id}`}>{annotation.type}</p>
                    {annotation.type === 'text' && (
                      <p className="text-xs text-muted-foreground truncate" data-testid={`topic-editor-annotation-text-${annotation.id}`}>{annotation.text}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnnotations(prev => prev.filter(a => a.id !== annotation.id));
                      toast.success('Annotation deleted');
                    }}
                    className="text-muted-foreground hover:text-destructive"
                    data-testid={`topic-editor-annotation-delete-${annotation.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {annotations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No annotations yet. Use Arrow, Box, or Text tools.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Hotspot Dialog */}
      <Dialog open={!!hotspotDialog} onOpenChange={() => setHotspotDialog(null)}>
        <DialogContent className="sm:max-w-md" data-testid="topic-editor-add-hotspot-dialog">
          <DialogHeader>
            <DialogTitle>Add Hotspot</DialogTitle>
          </DialogHeader>
          {hotspotDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label *</Label>
                  <Input
                    value={hotspotDialog.label}
                    onChange={(e) => setHotspotDialog({ ...hotspotDialog, label: e.target.value })}
                    placeholder="e.g., Sunlight"
                    data-testid="topic-editor-hotspot-label-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select 
                    value={hotspotDialog.icon} 
                    onValueChange={(v) => setHotspotDialog({ ...hotspotDialog, icon: v })}
                  >
                    <SelectTrigger data-testid="topic-editor-hotspot-icon-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(icon => (
                        <SelectItem key={icon} value={icon} className="capitalize" data-testid={`topic-editor-hotspot-icon-${icon}`}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={hotspotDialog.title}
                  onChange={(e) => setHotspotDialog({ ...hotspotDialog, title: e.target.value })}
                  placeholder="e.g., Light Energy"
                  data-testid="topic-editor-hotspot-title-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={hotspotDialog.description}
                  onChange={(e) => setHotspotDialog({ ...hotspotDialog, description: e.target.value })}
                  placeholder="Explain this concept..."
                  rows={3}
                  data-testid="topic-editor-hotspot-description-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Fun Fact (optional)</Label>
                <Input
                  value={hotspotDialog.funFact}
                  onChange={(e) => setHotspotDialog({ ...hotspotDialog, funFact: e.target.value })}
                  placeholder="Did you know..."
                  data-testid="topic-editor-hotspot-funfact-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all ${
                        hotspotDialog.color === color.id ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      onClick={() => setHotspotDialog({ ...hotspotDialog, color: color.id })}
                      data-testid={`topic-editor-hotspot-color-${color.id}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHotspotDialog(null)} data-testid="topic-editor-hotspot-cancel-button">Cancel</Button>
            <Button variant="warm" onClick={handleAddHotspot} data-testid="topic-editor-hotspot-add-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Hotspot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Text Dialog */}
      <Dialog open={!!textDialog} onOpenChange={() => setTextDialog(null)}>
        <DialogContent className="sm:max-w-md" data-testid="topic-editor-add-text-dialog">
          <DialogHeader>
            <DialogTitle>Add Text</DialogTitle>
          </DialogHeader>
          {textDialog && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Text *</Label>
                <Input
                  value={textDialog.text}
                  onChange={(e) => setTextDialog({ ...textDialog, text: e.target.value })}
                  placeholder="Enter text..."
                  data-testid="topic-editor-text-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all ${
                        textDialog.color === color.id ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      onClick={() => setTextDialog({ ...textDialog, color: color.id })}
                      data-testid={`topic-editor-text-color-${color.id}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTextDialog(null)} data-testid="topic-editor-text-cancel-button">Cancel</Button>
            <Button variant="warm" onClick={handleAddText} data-testid="topic-editor-text-add-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Text
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit {editDialog?.type === 'hotspot' ? 'Hotspot' : 'Text'}
            </DialogTitle>
          </DialogHeader>
          {editDialog?.type === 'hotspot' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={editDialog.data.label}
                    onChange={(e) => setEditDialog({ 
                      ...editDialog, 
                      data: { ...editDialog.data, label: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select 
                    value={editDialog.data.icon} 
                    onValueChange={(v) => setEditDialog({
                      ...editDialog,
                      data: { ...editDialog.data, icon: v }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(icon => (
                        <SelectItem key={icon} value={icon} className="capitalize">{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editDialog.data.title}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    data: { ...editDialog.data, title: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editDialog.data.description}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    data: { ...editDialog.data, description: e.target.value }
                  })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Fun Fact</Label>
                <Input
                  value={editDialog.data.funFact || editDialog.data.fun_fact || ''}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    data: { ...editDialog.data, funFact: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all ${
                        editDialog.data.color === color.id ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      onClick={() => setEditDialog({
                        ...editDialog,
                        data: { ...editDialog.data, color: color.id }
                      })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          {editDialog?.type === 'text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Text</Label>
                <Input
                  value={editDialog.data.text}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    data: { ...editDialog.data, text: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all ${
                        editDialog.data.color === color.id ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      onClick={() => setEditDialog({
                        ...editDialog,
                        data: { ...editDialog.data, color: color.id }
                      })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button variant="warm" onClick={handleSaveEdit}>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Draggable Hotspot Component
const DraggableHotspot = ({ hotspot, isSelected, onMouseDown, onClick, onDoubleClick }) => {
  return (
    <motion.div
      className={`absolute z-20 cursor-move ${isSelected ? 'z-30' : ''}`}
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Selection ring */}
      {isSelected && (
        <motion.div
          className="absolute -inset-2 rounded-full border-2 border-primary border-dashed"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        />
      )}
      
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-30"
        style={{ backgroundColor: `hsl(var(--${hotspot.color || 'primary'}))` }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Main hotspot */}
      <div
        className={`
          relative flex items-center justify-center
          w-11 h-11 -ml-[22px] -mt-[22px]
          rounded-full shadow-lg
          ring-4 ring-white/50
          ${isSelected ? 'ring-primary ring-offset-2' : ''}
        `}
        style={{ backgroundColor: `hsl(var(--${hotspot.color || 'primary'}))` }}
      >
        <span className="text-white text-xs font-bold">{hotspot.label?.charAt(0) || '?'}</span>
      </div>
      
      {/* Label */}
      <div className="absolute left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-foreground/80 text-background text-[10px] font-medium whitespace-nowrap">
        {hotspot.label}
      </div>
    </motion.div>
  );
};

// Editable Annotation Component
const EditableAnnotation = ({ annotation, isSelected, onClick, onDoubleClick }) => {
  const colorVar = `hsl(var(--${annotation.color || 'primary'}))`;
  
  if (annotation.type === 'arrow') {
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <marker
            id={`arrowhead-${annotation.id || 'temp'}`}
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
          strokeWidth={isSelected ? 5 : 3}
          markerEnd={`url(#arrowhead-${annotation.id || 'temp'})`}
          className="pointer-events-stroke cursor-pointer"
          style={{ pointerEvents: 'stroke' }}
          onClick={onClick}
        />
        {isSelected && (
          <>
            <circle cx={`${annotation.x}%`} cy={`${annotation.y}%`} r="6" fill={colorVar} />
            <circle cx={`${annotation.end_x}%`} cy={`${annotation.end_y}%`} r="6" fill={colorVar} />
          </>
        )}
      </svg>
    );
  }
  
  if (annotation.type === 'box') {
    return (
      <div
        className={`absolute border-2 rounded-lg cursor-pointer z-10 ${
          isSelected ? 'ring-2 ring-offset-2 ring-primary' : ''
        }`}
        style={{
          left: `${annotation.x}%`,
          top: `${annotation.y}%`,
          width: `${annotation.width}%`,
          height: `${annotation.height}%`,
          borderColor: colorVar,
          backgroundColor: `${colorVar}20`
        }}
        onClick={onClick}
      />
    );
  }
  
  if (annotation.type === 'text') {
    return (
      <div
        className={`absolute px-2 py-1 rounded font-semibold text-sm cursor-pointer z-10 ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        style={{
          left: `${annotation.x}%`,
          top: `${annotation.y}%`,
          color: colorVar,
          backgroundColor: 'hsl(var(--background) / 0.95)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        {annotation.text}
      </div>
    );
  }
  
  return null;
};

export default TopicEditor;
