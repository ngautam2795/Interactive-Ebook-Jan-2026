from supabase import create_client, Client
import os
import logging

logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')

supabase: Client = None

def get_supabase_client() -> Client:
    global supabase
    if supabase is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise ValueError("Supabase credentials not configured")
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return supabase

# SQL to create tables - run this in Supabase SQL editor
CREATE_TABLES_SQL = """
-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT,
    illustration TEXT,
    illustration_prompt TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotspots table
CREATE TABLE IF NOT EXISTS hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    label TEXT NOT NULL,
    icon TEXT DEFAULT 'sparkles',
    color TEXT DEFAULT 'primary',
    title TEXT NOT NULL,
    description TEXT,
    fun_fact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Annotations table
CREATE TABLE IF NOT EXISTS annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    width FLOAT,
    height FLOAT,
    rotation FLOAT DEFAULT 0,
    text TEXT,
    color TEXT DEFAULT 'primary',
    end_x FLOAT,
    end_y FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Allow public read access on chapters" ON chapters FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on chapters" ON chapters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on chapters" ON chapters FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on chapters" ON chapters FOR DELETE USING (true);

CREATE POLICY "Allow public read access on topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on topics" ON topics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on topics" ON topics FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on topics" ON topics FOR DELETE USING (true);

CREATE POLICY "Allow public read access on hotspots" ON hotspots FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on hotspots" ON hotspots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on hotspots" ON hotspots FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on hotspots" ON hotspots FOR DELETE USING (true);

CREATE POLICY "Allow public read access on annotations" ON annotations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on annotations" ON annotations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on annotations" ON annotations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on annotations" ON annotations FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_topics_chapter_id ON topics(chapter_id);
CREATE INDEX IF NOT EXISTS idx_hotspots_topic_id ON hotspots(topic_id);
CREATE INDEX IF NOT EXISTS idx_annotations_topic_id ON annotations(topic_id);
"""

def print_setup_instructions():
    print("=" * 60)
    print("SUPABASE SETUP INSTRUCTIONS")
    print("=" * 60)
    print("\nPlease run the following SQL in your Supabase SQL Editor:")
    print("(Go to: https://supabase.com/dashboard/project/wvhkocmbjfsvmlerrabm/sql/new)")
    print("\n" + CREATE_TABLES_SQL)
    print("=" * 60)

if __name__ == "__main__":
    print_setup_instructions()
