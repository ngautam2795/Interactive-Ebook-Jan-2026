from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx
import asyncio
import json
from supabase import create_client, Client


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase connection
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')
CORS_ORIGINS = os.environ.get('CORS_ORIGINS')
supabase: Client = None

def get_supabase() -> Client:
    global supabase
    if supabase is None:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return supabase

# Kei.ai API configuration
KEI_API_KEY = os.environ.get('KEI_API_KEY')
KEI_API_BASE = "https://api.kie.ai/api/v1"

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Image Generation Models
class ImageGenerationRequest(BaseModel):
    prompt: str
    model: str = "nano-banana-pro"  # nano-banana-pro, flux-kontext-pro, flux-kontext-max, 4o-image
    aspect_ratio: str = "16:9"
    output_format: str = "png"

class ImageGenerationResponse(BaseModel):
    task_id: str
    status: str
    message: str

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    image_url: Optional[str] = None
    message: str

# Content Models
class Hotspot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    x: float  # percentage position
    y: float
    label: str
    icon: str = "sparkles"
    color: str = "primary"
    title: str
    description: str
    fun_fact: Optional[str] = None

class Annotation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # "arrow", "box", "text"
    x: float
    y: float
    width: Optional[float] = None
    height: Optional[float] = None
    rotation: Optional[float] = 0
    text: Optional[str] = None
    color: str = "primary"
    end_x: Optional[float] = None  # For arrows
    end_y: Optional[float] = None

class Topic(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: Optional[str] = None
    content: str
    illustration: Optional[str] = None
    illustration_prompt: Optional[str] = None
    hotspots: List[Hotspot] = []
    annotations: List[Annotation] = []

class Chapter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subject: str
    description: Optional[str] = None
    topics: List[Topic] = []
    favorite: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChapterCreate(BaseModel):
    title: str
    subject: str
    description: Optional[str] = None
    content: str  # Raw content to be parsed into topics

class ChapterFavoriteUpdate(BaseModel):
    favorite: bool

class TopicUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    illustration: Optional[str] = None
    hotspots: Optional[List[Hotspot]] = None
    annotations: Optional[List[Annotation]] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# ============== Image Generation Endpoints ==============

@api_router.post("/generate-image", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest):
    """Generate an image using Kei.ai API"""
    
    if not KEI_API_KEY:
        raise HTTPException(status_code=500, detail="KEI_API_KEY not configured")
    
    headers = {
        "Authorization": f"Bearer {KEI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            # All models use the unified createTask endpoint
            endpoint = f"{KEI_API_BASE}/jobs/createTask"
            
            # Map model names to kie.ai model identifiers
            model_mapping = {
                "nano-banana-pro": "google/nano-banana",
                "flux-kontext-pro": "flux-kontext-pro",
                "flux-kontext-max": "flux-kontext-max",
                "4o-image": "openai/gpt-image-1"
            }
            
            model_id = model_mapping.get(request.model, "google/nano-banana")
            
            # Payload structure with nested input object as per kie.ai docs
            payload = {
                "model": model_id,
                "input": {
                    "prompt": request.prompt,
                    "image_size": request.aspect_ratio,
                    "output_format": request.output_format
                }
            }
            
            logger.info(f"Generating image with model {model_id}: {request.prompt[:100]}...")
            logger.info(f"Payload: {payload}")
            response = await http_client.post(endpoint, json=payload, headers=headers)
            
            logger.info(f"API Response status: {response.status_code}")
            logger.info(f"API Response: {response.text[:500]}")
            
            if response.status_code != 200:
                logger.error(f"Kei.ai API error: {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"Image generation failed: {response.text}")
            
            result = response.json()
            
            if result.get("code") == 200:
                task_id = result.get("data", {}).get("taskId", "")
                return ImageGenerationResponse(
                    task_id=task_id,
                    status="processing",
                    message="Image generation started"
                )
            else:
                raise HTTPException(status_code=500, detail=f"API error: {result.get('msg', 'Unknown error')}")
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timeout")
    except Exception as e:
        logger.error(f"Image generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/image-status/{task_id}", response_model=TaskStatusResponse)
async def get_image_status(task_id: str):
    """Check the status of an image generation task"""
    
    if not KEI_API_KEY:
        raise HTTPException(status_code=500, detail="KEI_API_KEY not configured")
    
    headers = {
        "Authorization": f"Bearer {KEI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            # Use the recordInfo endpoint for task status
            endpoint = f"{KEI_API_BASE}/jobs/recordInfo"
            response = await http_client.get(endpoint, params={"taskId": task_id}, headers=headers)
            
            logger.info(f"Status check response: {response.status_code} - {response.text[:500]}")
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to get task status")
            
            result = response.json()
            data = result.get("data", {})
            
            state = data.get("state", "unknown")
            result_json = data.get("resultJson", "{}")
            
            # Parse resultJson to get image URLs
            image_url = None
            if state == "success" and result_json:
                try:
                    import json
                    result_data = json.loads(result_json) if isinstance(result_json, str) else result_json
                    result_urls = result_data.get("resultUrls", [])
                    if result_urls:
                        image_url = result_urls[0]
                except:
                    pass
            
            # Map state to simpler status
            status_mapping = {
                "waiting": "processing",
                "queuing": "processing",
                "generating": "processing",
                "success": "completed",
                "fail": "failed"
            }
            
            return TaskStatusResponse(
                task_id=task_id,
                status=status_mapping.get(state, state),
                image_url=image_url,
                message=f"Task state: {state}" + (f" - {data.get('failMsg', '')}" if state == "fail" else "")
            )
            
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/available-models")
async def get_available_models():
    """Get list of available image generation models"""
    return {
        "models": [
            {
                "id": "nano-banana-pro",
                "name": "Nano Banana Pro",
                "description": "Fast & affordable image generation based on Gemini",
                "speed": "fast",
                "quality": "good"
            },
            {
                "id": "flux-kontext-pro",
                "name": "Flux Kontext Pro",
                "description": "Balanced quality and speed",
                "speed": "medium",
                "quality": "high"
            },
            {
                "id": "flux-kontext-max",
                "name": "Flux Kontext Max",
                "description": "Highest quality and detail",
                "speed": "slow",
                "quality": "premium"
            },
            {
                "id": "4o-image",
                "name": "GPT-Image-1 (4o)",
                "description": "OpenAI's image generation model",
                "speed": "medium",
                "quality": "high"
            }
        ]
    }

# ============== Chapter & Content Endpoints (Supabase) ==============

@api_router.post("/chapters")
async def create_chapter(chapter_data: ChapterCreate):
    """Create a new chapter from raw content and save to Supabase"""
    
    try:
        sb = get_supabase()
        
        # Parse content into topics
        parsed_topics = parse_content_to_topics(chapter_data.content)
        
        chapter_id = str(uuid.uuid4())
        
        # Insert chapter
        chapter_doc = {
            "id": chapter_id,
            "title": chapter_data.title,
            "subject": chapter_data.subject,
            "description": chapter_data.description or f"Interactive chapter about {chapter_data.title}",
            "favorite": False
        }
        
        try:
            result = sb.table("chapters").insert(chapter_doc).execute()
        except Exception as insert_error:
            error_message = str(insert_error)
            if "favorite" in error_message.lower():
                logger.warning("Favorite column missing in chapters table. Retrying insert without favorite.")
                chapter_doc.pop("favorite", None)
                result = sb.table("chapters").insert(chapter_doc).execute()
            else:
                raise
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create chapter")
        
        # Insert topics
        topics_with_ids = []
        for idx, topic in enumerate(parsed_topics):
            topic_id = str(uuid.uuid4())
            topic_doc = {
                "id": topic_id,
                "chapter_id": chapter_id,
                "title": topic.title,
                "subtitle": topic.subtitle,
                "content": topic.content,
                "illustration": topic.illustration,
                "illustration_prompt": topic.illustration_prompt,
                "order_index": idx
            }
            
            topic_result = sb.table("topics").insert(topic_doc).execute()
            
            if topic_result.data:
                # Insert hotspots for this topic
                for hotspot in topic.hotspots:
                    hotspot_doc = {
                        "id": str(uuid.uuid4()),
                        "topic_id": topic_id,
                        "x": hotspot.x,
                        "y": hotspot.y,
                        "label": hotspot.label,
                        "icon": hotspot.icon,
                        "color": hotspot.color,
                        "title": hotspot.title,
                        "description": hotspot.description,
                        "fun_fact": hotspot.fun_fact
                    }
                    sb.table("hotspots").insert(hotspot_doc).execute()
                
                topics_with_ids.append({
                    "id": topic_id,
                    "title": topic.title,
                    "subtitle": topic.subtitle,
                    "content": topic.content,
                    "illustration": topic.illustration,
                    "hotspots": [h.model_dump() for h in topic.hotspots],
                    "annotations": []
                })
        
        return {
            "id": chapter_id,
            "title": chapter_data.title,
            "subject": chapter_data.subject,
            "description": chapter_data.description,
            "favorite": False,
            "topics": topics_with_ids,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error creating chapter: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chapters")
async def get_chapters():
    """Get all chapters from Supabase"""
    try:
        sb = get_supabase()
        
        # Get all chapters
        chapters_result = sb.table("chapters").select("*").order("created_at", desc=True).execute()
        
        chapters = []
        for ch in chapters_result.data or []:
            # Get topics for this chapter
            topics_result = sb.table("topics").select("*").eq("chapter_id", ch["id"]).order("order_index").execute()
            
            topics = []
            for topic in topics_result.data or []:
                # Get hotspots for this topic
                hotspots_result = sb.table("hotspots").select("*").eq("topic_id", topic["id"]).execute()
                
                # Get annotations for this topic
                annotations_result = sb.table("annotations").select("*").eq("topic_id", topic["id"]).execute()
                
                topics.append({
                    **topic,
                    "hotspots": hotspots_result.data or [],
                    "annotations": annotations_result.data or []
                })
            
            chapters.append({
                **ch,
                "topics": topics
            })
        
        return chapters
        
    except Exception as e:
        logger.error(f"Error getting chapters: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chapters/{chapter_id}")
async def get_chapter(chapter_id: str):
    """Get a specific chapter from Supabase"""
    try:
        sb = get_supabase()
        
        # Get chapter
        chapter_result = sb.table("chapters").select("*").eq("id", chapter_id).single().execute()
        
        if not chapter_result.data:
            raise HTTPException(status_code=404, detail="Chapter not found")
        
        ch = chapter_result.data
        
        # Get topics
        topics_result = sb.table("topics").select("*").eq("chapter_id", chapter_id).order("order_index").execute()
        
        topics = []
        for topic in topics_result.data or []:
            hotspots_result = sb.table("hotspots").select("*").eq("topic_id", topic["id"]).execute()
            annotations_result = sb.table("annotations").select("*").eq("topic_id", topic["id"]).execute()
            
            topics.append({
                **topic,
                "hotspots": hotspots_result.data or [],
                "annotations": annotations_result.data or []
            })
        
        return {
            **ch,
            "topics": topics
        }
        
    except Exception as e:
        logger.error(f"Error getting chapter: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/chapters/{chapter_id}/topics/{topic_id}")
async def update_topic(chapter_id: str, topic_id: str, topic_update: TopicUpdate):
    """Update a specific topic in Supabase"""
    try:
        sb = get_supabase()
        
        update_data = topic_update.model_dump(exclude_unset=True)
        
        # Handle hotspots separately if provided
        hotspots_data = update_data.pop("hotspots", None)
        annotations_data = update_data.pop("annotations", None)
        
        if update_data:
            update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
            sb.table("topics").update(update_data).eq("id", topic_id).execute()
        
        # Update hotspots if provided
        if hotspots_data is not None:
            # Delete existing hotspots
            sb.table("hotspots").delete().eq("topic_id", topic_id).execute()
            
            # Insert new hotspots
            for hotspot in hotspots_data:
                hotspot_doc = {
                    "id": hotspot.get("id", str(uuid.uuid4())),
                    "topic_id": topic_id,
                    **{k: v for k, v in hotspot.items() if k != "id"}
                }
                sb.table("hotspots").insert(hotspot_doc).execute()
        
        # Update annotations if provided
        if annotations_data is not None:
            sb.table("annotations").delete().eq("topic_id", topic_id).execute()
            
            for annotation in annotations_data:
                annotation_doc = {
                    "id": annotation.get("id", str(uuid.uuid4())),
                    "topic_id": topic_id,
                    **{k: v for k, v in annotation.items() if k != "id"}
                }
                sb.table("annotations").insert(annotation_doc).execute()
        
        return {"message": "Topic updated successfully"}
        
    except Exception as e:
        logger.error(f"Error updating topic: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/chapters/{chapter_id}/topics/{topic_id}/hotspots")
async def add_hotspot(chapter_id: str, topic_id: str, hotspot: Hotspot):
    """Add a hotspot to a topic in Supabase"""
    try:
        sb = get_supabase()
        
        hotspot_doc = {
            "id": hotspot.id,
            "topic_id": topic_id,
            "x": hotspot.x,
            "y": hotspot.y,
            "label": hotspot.label,
            "icon": hotspot.icon,
            "color": hotspot.color,
            "title": hotspot.title,
            "description": hotspot.description,
            "fun_fact": hotspot.fun_fact
        }
        
        result = sb.table("hotspots").insert(hotspot_doc).execute()
        
        return {"message": "Hotspot added", "hotspot": result.data[0] if result.data else hotspot_doc}
        
    except Exception as e:
        logger.error(f"Error adding hotspot: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/chapters/{chapter_id}/topics/{topic_id}/annotations")
async def add_annotation(chapter_id: str, topic_id: str, annotation: Annotation):
    """Add an annotation to a topic in Supabase"""
    try:
        sb = get_supabase()
        
        annotation_doc = {
            "id": annotation.id,
            "topic_id": topic_id,
            "type": annotation.type,
            "x": annotation.x,
            "y": annotation.y,
            "width": annotation.width,
            "height": annotation.height,
            "rotation": annotation.rotation,
            "text": annotation.text,
            "color": annotation.color,
            "end_x": annotation.end_x,
            "end_y": annotation.end_y
        }
        
        result = sb.table("annotations").insert(annotation_doc).execute()
        
        return {"message": "Annotation added", "annotation": result.data[0] if result.data else annotation_doc}
        
    except Exception as e:
        logger.error(f"Error adding annotation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/chapters/{chapter_id}")
async def delete_chapter(chapter_id: str):
    """Delete a chapter from Supabase (cascade deletes topics, hotspots, annotations)"""
    try:
        sb = get_supabase()
        
        result = sb.table("chapters").delete().eq("id", chapter_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Chapter not found")
        
        return {"message": "Chapter deleted"}
        
    except Exception as e:
        logger.error(f"Error deleting chapter: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/chapters/{chapter_id}/favorite")
async def update_chapter_favorite(chapter_id: str, favorite_update: ChapterFavoriteUpdate):
    """Update the favorite status of a chapter"""
    try:
        sb = get_supabase()
        update_data = {
            "favorite": favorite_update.favorite,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        result = sb.table("chapters").update(update_data).eq("id", chapter_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Chapter not found")
        return {"message": "Favorite updated", "favorite": favorite_update.favorite}
    except Exception as e:
        error_message = str(e)
        if "favorite" in error_message.lower():
            logger.error("Favorite column missing in chapters table")
            raise HTTPException(
                status_code=500,
                detail="Favorite column missing in chapters table. Run: ALTER TABLE chapters ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT FALSE;"
            )
        logger.error(f"Error updating favorite: {error_message}")
        raise HTTPException(status_code=500, detail=error_message)

def parse_content_to_topics(content: str) -> List[Topic]:
    """Parse raw educational content into topics"""
    topics = []
    
    # Split by markdown headers or double newlines
    sections = content.split('\n## ')
    
    if len(sections) == 1:
        # Try splitting by double newlines if no headers
        sections = content.split('\n\n')
    
    for idx, section in enumerate(sections):
        if not section.strip():
            continue
        
        lines = section.strip().split('\n')
        title = lines[0].replace('#', '').strip() or f"Topic {idx + 1}"
        content_text = '\n'.join(lines[1:]).strip() if len(lines) > 1 else section.strip()
        
        # Extract keywords for potential hotspots
        keywords = extract_keywords(content_text)
        
        # Create default hotspots from keywords
        hotspots = []
        for i, keyword in enumerate(keywords[:6]):  # Max 6 hotspots
            hotspots.append(Hotspot(
                x=15 + (i % 3) * 30,
                y=20 + (i // 3) * 35,
                label=keyword,
                icon=get_icon_for_keyword(keyword),
                color=get_color_for_index(i),
                title=keyword,
                description=f"Learn more about {keyword.lower()} and its role in this topic.",
                fun_fact=None
            ))
        
        topics.append(Topic(
            title=title,
            subtitle=f"Interactive Learning Content",
            content=content_text,
            hotspots=hotspots,
            annotations=[]
        ))
    
    return topics if topics else [Topic(
        title="Introduction",
        subtitle="Getting Started",
        content=content,
        hotspots=[],
        annotations=[]
    )]

def extract_keywords(text: str) -> List[str]:
    """Extract important keywords from text"""
    import re
    # Find capitalized words (potential important terms)
    words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
    # Remove common words
    common = {'The', 'This', 'That', 'These', 'Those', 'When', 'Where', 'What', 'How', 'Why'}
    keywords = [w for w in words if w not in common]
    return list(dict.fromkeys(keywords))[:10]  # Unique, max 10

def get_icon_for_keyword(keyword: str) -> str:
    """Get an appropriate icon for a keyword"""
    icons = ['sparkles', 'sun', 'leaf', 'droplets', 'wind', 'cloud', 'star', 'zap', 'globe', 'atom']
    return icons[len(keyword) % len(icons)]

def get_color_for_index(idx: int) -> str:
    """Get a color variant for an index"""
    colors = ['primary', 'secondary', 'accent', 'warning', 'success']
    return colors[idx % len(colors)]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS.split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()