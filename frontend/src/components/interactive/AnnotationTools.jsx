import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Square, Type, MousePointer, Plus, Trash2, 
  Move, X, Check, Palette, RotateCw, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

const tools = [
  { id: 'select', icon: MousePointer, label: 'Select' },
  { id: 'hotspot', icon: Sparkles, label: 'Hotspot' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'box', icon: Square, label: 'Box' },
  { id: 'text', icon: Type, label: 'Text' }
];

const colorOptions = [
  { id: 'primary', color: 'hsl(var(--primary))', label: 'Orange' },
  { id: 'secondary', color: 'hsl(var(--secondary))', label: 'Green' },
  { id: 'accent', color: 'hsl(var(--accent))', label: 'Coral' },
  { id: 'warning', color: 'hsl(var(--warning))', label: 'Yellow' },
  { id: 'destructive', color: 'hsl(var(--destructive))', label: 'Red' },
  { id: 'muted', color: 'hsl(var(--muted-foreground))', label: 'Gray' }
];

export const AnnotationTools = ({
  annotations = [],
  hotspots = [],
  onAnnotationsChange,
  onHotspotsChange,
  containerRef,
  disabled = false
}) => {
  const [activeTool, setActiveTool] = useState('select');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedColor, setSelectedColor] = useState('primary');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [tempAnnotation, setTempAnnotation] = useState(null);

  // Hotspot creation state
  const [newHotspot, setNewHotspot] = useState(null);

  const getRelativePosition = useCallback((e) => {
    if (!containerRef?.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    };
  }, [containerRef]);

  const handleMouseDown = useCallback((e) => {
    if (disabled || activeTool === 'select') return;
    
    const pos = getRelativePosition(e);
    
    if (activeTool === 'hotspot') {
      setNewHotspot({
        id: `hotspot-${Date.now()}`,
        x: pos.x,
        y: pos.y,
        label: '',
        title: '',
        description: '',
        icon: 'sparkles',
        color: selectedColor
      });
      return;
    }
    
    setIsDrawing(true);
    setDrawStart(pos);
    
    if (activeTool === 'text') {
      const newAnnotation = {
        id: `annotation-${Date.now()}`,
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Double click to edit',
        color: selectedColor
      };
      onAnnotationsChange([...annotations, newAnnotation]);
      setSelectedId(newAnnotation.id);
      setActiveTool('select');
    }
  }, [disabled, activeTool, getRelativePosition, selectedColor, annotations, onAnnotationsChange]);

  const handleMouseMove = useCallback((e) => {
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

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !tempAnnotation) {
      setIsDrawing(false);
      return;
    }
    
    const newAnnotation = {
      id: `annotation-${Date.now()}`,
      ...tempAnnotation
    };
    
    onAnnotationsChange([...annotations, newAnnotation]);
    setSelectedId(newAnnotation.id);
    setIsDrawing(false);
    setDrawStart(null);
    setTempAnnotation(null);
    setActiveTool('select');
  }, [isDrawing, tempAnnotation, annotations, onAnnotationsChange]);

  const handleSaveHotspot = useCallback(() => {
    if (!newHotspot || !newHotspot.label || !newHotspot.title) return;
    onHotspotsChange([...hotspots, newHotspot]);
    setNewHotspot(null);
    setActiveTool('select');
  }, [newHotspot, hotspots, onHotspotsChange]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return;
    
    // Check if it's an annotation
    const annotationIndex = annotations.findIndex(a => a.id === selectedId);
    if (annotationIndex !== -1) {
      onAnnotationsChange(annotations.filter(a => a.id !== selectedId));
    }
    
    // Check if it's a hotspot
    const hotspotIndex = hotspots.findIndex(h => h.id === selectedId);
    if (hotspotIndex !== -1) {
      onHotspotsChange(hotspots.filter(h => h.id !== selectedId));
    }
    
    setSelectedId(null);
  }, [selectedId, annotations, hotspots, onAnnotationsChange, onHotspotsChange]);

  const selectedAnnotation = annotations.find(a => a.id === selectedId);
  const selectedHotspot = hotspots.find(h => h.id === selectedId);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-card shadow-medium">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveTool(tool.id)}
            disabled={disabled}
            className="rounded-lg"
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </Button>
        ))}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg">
              <div 
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: `hsl(var(--${selectedColor}))` }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    selectedColor === color.id ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.color }}
                  onClick={() => setSelectedColor(color.id)}
                  title={color.label}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Delete Button */}
        {selectedId && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteSelected}
            className="rounded-lg text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Drawing Canvas Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{ 
          cursor: activeTool === 'select' ? 'default' : 'crosshair',
          pointerEvents: disabled ? 'none' : 'auto'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDrawing) handleMouseUp();
        }}
      >
        {/* Render Annotations */}
        {annotations.map((annotation) => (
          <AnnotationRenderer
            key={annotation.id}
            annotation={annotation}
            isSelected={selectedId === annotation.id}
            onSelect={() => setSelectedId(annotation.id)}
            onUpdate={(updated) => {
              onAnnotationsChange(annotations.map(a => 
                a.id === updated.id ? updated : a
              ));
            }}
          />
        ))}

        {/* Render Temp Annotation */}
        {tempAnnotation && (
          <AnnotationRenderer
            annotation={tempAnnotation}
            isSelected={false}
            onSelect={() => {}}
            onUpdate={() => {}}
          />
        )}
      </div>

      {/* Hotspot Creation Modal */}
      <AnimatePresence>
        {newHotspot && (
          <motion.div
            className="absolute z-50 p-4 bg-card rounded-xl shadow-elevated border border-border w-72"
            style={{
              left: `${Math.min(newHotspot.x, 60)}%`,
              top: `${Math.min(newHotspot.y, 50)}%`
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">New Hotspot</h4>
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => setNewHotspot(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Label</Label>
                <Input
                  value={newHotspot.label}
                  onChange={(e) => setNewHotspot({ ...newHotspot, label: e.target.value })}
                  placeholder="e.g., Sunlight"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={newHotspot.title}
                  onChange={(e) => setNewHotspot({ ...newHotspot, title: e.target.value })}
                  placeholder="e.g., Light Energy"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Input
                  value={newHotspot.description}
                  onChange={(e) => setNewHotspot({ ...newHotspot, description: e.target.value })}
                  placeholder="Explain this concept..."
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Fun Fact (optional)</Label>
                <Input
                  value={newHotspot.fun_fact || ''}
                  onChange={(e) => setNewHotspot({ ...newHotspot, fun_fact: e.target.value })}
                  placeholder="Did you know..."
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setNewHotspot(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="warm"
                  size="sm"
                  className="flex-1"
                  onClick={handleSaveHotspot}
                  disabled={!newHotspot.label || !newHotspot.title}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Annotation Renderer Component
const AnnotationRenderer = ({ annotation, isSelected, onSelect, onUpdate }) => {
  const colorVar = `hsl(var(--${annotation.color || 'primary'}))`;
  
  if (annotation.type === 'arrow') {
    // Calculate arrow path
    const dx = annotation.end_x - annotation.x;
    const dy = annotation.end_y - annotation.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Arrowhead points
    const headLength = 2;
    const headAngle = Math.PI / 6;
    
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <marker
            id={`arrowhead-${annotation.id}`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
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
          strokeWidth={isSelected ? 4 : 3}
          markerEnd={`url(#arrowhead-${annotation.id})`}
          style={{ 
            cursor: 'pointer',
            pointerEvents: 'stroke'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        />
      </svg>
    );
  }
  
  if (annotation.type === 'box') {
    return (
      <div
        className={`absolute border-2 rounded-lg ${isSelected ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
        style={{
          left: `${annotation.x}%`,
          top: `${annotation.y}%`,
          width: `${annotation.width}%`,
          height: `${annotation.height}%`,
          borderColor: colorVar,
          backgroundColor: `${colorVar}20`,
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      />
    );
  }
  
  if (annotation.type === 'text') {
    return (
      <div
        className={`absolute px-2 py-1 rounded font-semibold text-sm ${isSelected ? 'ring-2 ring-primary' : ''}`}
        style={{
          left: `${annotation.x}%`,
          top: `${annotation.y}%`,
          color: colorVar,
          backgroundColor: 'hsl(var(--background) / 0.9)',
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {annotation.text}
      </div>
    );
  }
  
  return null;
};

export default AnnotationTools;
