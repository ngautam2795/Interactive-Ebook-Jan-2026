import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials not configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for chapters
export const chaptersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Get topics for each chapter
    const chaptersWithTopics = await Promise.all(
      (data || []).map(async (chapter) => {
        const topics = await this.getTopicsForChapter(chapter.id);
        return { ...chapter, topics };
      })
    );
    
    return chaptersWithTopics;
  },

  async getById(chapterId) {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();
    
    if (error) throw error;
    
    const topics = await this.getTopicsForChapter(chapterId);
    return { ...data, topics };
  },

  async getTopicsForChapter(chapterId) {
    const { data: topics, error } = await supabase
      .from('topics')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('order_index');
    
    if (error) throw error;
    
    // Get hotspots and annotations for each topic
    const topicsWithDetails = await Promise.all(
      (topics || []).map(async (topic) => {
        const [hotspots, annotations] = await Promise.all([
          this.getHotspotsForTopic(topic.id),
          this.getAnnotationsForTopic(topic.id)
        ]);
        return { ...topic, hotspots, annotations };
      })
    );
    
    return topicsWithDetails;
  },

  async getHotspotsForTopic(topicId) {
    const { data, error } = await supabase
      .from('hotspots')
      .select('*')
      .eq('topic_id', topicId);
    
    if (error) throw error;
    return data || [];
  },

  async getAnnotationsForTopic(topicId) {
    const { data, error } = await supabase
      .from('annotations')
      .select('*')
      .eq('topic_id', topicId);
    
    if (error) throw error;
    return data || [];
  },

  async create(chapter) {
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        title: chapter.title,
        subject: chapter.subject,
        description: chapter.description
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(chapterId) {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId);
    
    if (error) throw error;
    return true;
  }
};

export default supabase;
