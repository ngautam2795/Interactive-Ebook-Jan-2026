from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx
import asyncio


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Kei.ai API configuration
KEI_API_KEY = os.environ.get('KEI_API_KEY', '')
KEI_API_BASE = "https://api.kie.ai/api/v1"

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChapterCreate(BaseModel):
    title: str
    subject: str
    description: Optional[str] = None
    content: str  # Raw content to be parsed into topics

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
            
            payload = {
                "model": model_id,
                "prompt": request.prompt,
                "image_size": request.aspect_ratio,
                "output_format": request.output_format
            }
            
            logger.info(f"Generating image with model {model_id}: {request.prompt[:100]}...")
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
            # Use the task status endpoint
            endpoint = f"{KEI_API_BASE}/jobs/taskStatus"
            response = await http_client.get(endpoint, params={"taskId": task_id}, headers=headers)
            
            logger.info(f"Status check response: {response.status_code} - {response.text[:500]}")
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to get task status")
            
            result = response.json()
            data = result.get("data", {})
            
            status = data.get("status", "unknown")
            # Check multiple possible locations for the image URL
            image_url = (
                data.get("imageUrl") or 
                data.get("image_url") or 
                data.get("output", {}).get("imageUrl") or
                data.get("output", {}).get("image_url") or
                (data.get("images", [{}])[0].get("url") if data.get("images") else None)
            )
            
            return TaskStatusResponse(
                task_id=task_id,
                status=status,
                image_url=image_url,
                message=f"Task status: {status}"
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

# ============== Chapter & Content Endpoints ==============

@api_router.post("/chapters", response_model=Chapter)
async def create_chapter(chapter_data: ChapterCreate):
    """Create a new chapter from raw content"""
    
    # Parse content into topics
    topics = parse_content_to_topics(chapter_data.content)
    
    chapter = Chapter(
        title=chapter_data.title,
        subject=chapter_data.subject,
        description=chapter_data.description,
        topics=topics
    )
    
    # Save to database
    doc = chapter.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.chapters.insert_one(doc)
    
    return chapter

@api_router.get("/chapters", response_model=List[Chapter])
async def get_chapters():
    """Get all chapters"""
    chapters = await db.chapters.find({}, {"_id": 0}).to_list(100)
    for ch in chapters:
        if isinstance(ch.get('created_at'), str):
            ch['created_at'] = datetime.fromisoformat(ch['created_at'])
    return chapters

@api_router.get("/chapters/{chapter_id}", response_model=Chapter)
async def get_chapter(chapter_id: str):
    """Get a specific chapter"""
    chapter = await db.chapters.find_one({"id": chapter_id}, {"_id": 0})
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    if isinstance(chapter.get('created_at'), str):
        chapter['created_at'] = datetime.fromisoformat(chapter['created_at'])
    return chapter

@api_router.put("/chapters/{chapter_id}/topics/{topic_id}")
async def update_topic(chapter_id: str, topic_id: str, topic_update: TopicUpdate):
    """Update a specific topic within a chapter"""
    
    chapter = await db.chapters.find_one({"id": chapter_id})
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    # Find and update the topic
    topics = chapter.get("topics", [])
    topic_found = False
    
    for i, topic in enumerate(topics):
        if topic.get("id") == topic_id:
            update_data = topic_update.model_dump(exclude_unset=True)
            topics[i] = {**topic, **update_data}
            topic_found = True
            break
    
    if not topic_found:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    await db.chapters.update_one(
        {"id": chapter_id},
        {"$set": {"topics": topics}}
    )
    
    return {"message": "Topic updated successfully", "topic": topics[i]}

@api_router.post("/chapters/{chapter_id}/topics/{topic_id}/hotspots")
async def add_hotspot(chapter_id: str, topic_id: str, hotspot: Hotspot):
    """Add a hotspot to a topic"""
    
    chapter = await db.chapters.find_one({"id": chapter_id})
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    topics = chapter.get("topics", [])
    for i, topic in enumerate(topics):
        if topic.get("id") == topic_id:
            hotspots = topic.get("hotspots", [])
            hotspots.append(hotspot.model_dump())
            topics[i]["hotspots"] = hotspots
            break
    
    await db.chapters.update_one(
        {"id": chapter_id},
        {"$set": {"topics": topics}}
    )
    
    return {"message": "Hotspot added", "hotspot": hotspot}

@api_router.post("/chapters/{chapter_id}/topics/{topic_id}/annotations")
async def add_annotation(chapter_id: str, topic_id: str, annotation: Annotation):
    """Add an annotation (arrow, box, text) to a topic"""
    
    chapter = await db.chapters.find_one({"id": chapter_id})
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    topics = chapter.get("topics", [])
    for i, topic in enumerate(topics):
        if topic.get("id") == topic_id:
            annotations = topic.get("annotations", [])
            annotations.append(annotation.model_dump())
            topics[i]["annotations"] = annotations
            break
    
    await db.chapters.update_one(
        {"id": chapter_id},
        {"$set": {"topics": topics}}
    )
    
    return {"message": "Annotation added", "annotation": annotation}

@api_router.delete("/chapters/{chapter_id}")
async def delete_chapter(chapter_id: str):
    """Delete a chapter"""
    result = await db.chapters.delete_one({"id": chapter_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return {"message": "Chapter deleted"}

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
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
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