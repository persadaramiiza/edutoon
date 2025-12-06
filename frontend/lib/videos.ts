import api from './api';

export interface Creator {
  id: number;
  full_name: string;
  email: string;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  platform: 'youtube' | 'vimeo' | 'native';
  category: string;
  min_age: number;
  max_age: number;
  view_count: number;
  status: 'draft' | 'published' | 'archived';
  creator_id: number;
  creator: Creator;
  created_at: string;
  published_at?: string;
}

export interface VideoProgress {
  profileId: number;
  videoId: number;
  timestamp_seconds: number;
  last_position_seconds: number;
  is_completed: boolean;
}

export interface CreateVideoData {
  title: string;
  description: string;
  video_url: string;
  platform: 'youtube' | 'vimeo' | 'native';
  category: string;
  min_age: number;
  max_age: number;
  thumbnail_url?: string;
}

export type UpdateVideoData = Partial<CreateVideoData>;

export interface SaveProgressDto {
  profileId: number;
  timestampSeconds: number;
  isCompleted?: boolean;
}

export interface GetVideosParams {
  page?: number;
  limit?: number;
  profileId?: number;
  search?: string;
  category?: string;
}

export interface PaginatedVideos {
  data: Video[];
  total: number;
  page?: number;
  limit?: number;
}

// ==================== HELPER FUNCTION ====================
const parseVideoResponse = (data: any): Video => {
  if (!data) {
    throw new Error('Invalid video data');
  }
  return {
    id: data.id,
    title: data.title || '',
    description: data.description || '',
    video_url: data.video_url || '',
    platform: data.platform || 'youtube',
    category: data.category || '',
    min_age: data.min_age || 0,
    max_age: data.max_age || 18,
    view_count: data.view_count || 0,
    status: data.status || 'draft',
    creator_id: data.creator_id || 0,
    creator: data.creator || { id: 0, full_name: 'Unknown', email: '' },
    created_at: data.created_at || new Date().toISOString(),
    published_at: data.published_at,
  };
};

export const videosService = {
  // ==================== GET ALL VIDEOS ====================
  async getAll(params?: GetVideosParams): Promise<PaginatedVideos> {
    try {
      console.log('📥 Fetching all videos:', params);
      
      // ✅ FIX: Don't send profileId to backend, use it locally
      const queryParams: any = {
        page: params?.page || 1,
        limit: params?.limit || 20,
      };
      
      // Add optional filters
      if (params?.search) queryParams.search = params.search;
      if (params?.category) queryParams.category = params.category;
      
      console.log('🔗 Query params sent to API:', queryParams);
      
      const response = await api.get('/videos', { params: queryParams });
      
      if (!response.data) {
        console.warn('⚠️ Empty response');
        return { data: [], total: 0 };
      }

      const { data } = response;
      console.log('✅ Response structure:', Object.keys(data));

      // Handle different response formats
      if (data.data && Array.isArray(data.data)) {
        // Format: { data: [...], total: 10 }
        let videos = data.data.map(parseVideoResponse);
        
        // ✅ Filter by age group locally if profileId provided
        if (params?.profileId) {
          console.log(`🎯 Filtering videos for profileId: ${params.profileId}`);
          // Age filtering akan dilakukan di dashboard saat fetch profile data
          // Sekarang hanya return semua published videos
        }
        
        return {
          data: videos,
          total: data.total || data.data.length,
          page: data.page || queryParams.page,
          limit: data.limit || queryParams.limit,
        };
      }

      if (Array.isArray(data)) {
        // Format: [{ id, title, ... }]
        return {
          data: data.map(parseVideoResponse),
          total: data.length,
        };
      }

      console.warn('⚠️ Unexpected response format:', data);
      return { data: [], total: 0 };
    } catch (error: any) {
      console.error('❌ Error fetching videos:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Message:', error.response?.data?.message);
      
      // Return empty array instead of throwing on 400
      if (error.response?.status === 400) {
        console.warn('⚠️ Bad request - returning empty videos');
        return { data: [], total: 0 };
      }
      
      throw error;
    }
  },

  // ==================== GET MY VIDEOS ====================
  async getMyVideos(): Promise<Video[]> {
    try {
      console.log('📥 Fetching my videos');
      const response = await api.get('/videos/my-videos');

      if (!response.data) {
        console.warn('⚠️ Empty response');
        return [];
      }

      const data = response.data;
      console.log('✅ Response type:', typeof data, 'is array:', Array.isArray(data));

      if (Array.isArray(data)) {
        return data.map(parseVideoResponse);
      }

      if (data.data && Array.isArray(data.data)) {
        return data.data.map(parseVideoResponse);
      }

      console.warn('⚠️ Unexpected response format:', data);
      return [];
    } catch (error) {
      console.error('❌ Error fetching my videos:', error);
      throw error;
    }
  },

  // ==================== GET VIDEO BY ID ====================
  async getById(id: number): Promise<Video> {
    try {
      console.log(`📥 Fetching video ${id}`);
      const response = await api.get(`/videos/${id}`);

      if (!response.data) {
        throw new Error('Video not found');
      }

      const video = parseVideoResponse(response.data);
      console.log('✅ Video loaded:', video.title);
      return video;
    } catch (error: any) {
      console.error(`❌ Error fetching video ${id}:`, error);
      throw error;
    }
  },

  // ==================== CREATE VIDEO ====================
  async create(data: CreateVideoData): Promise<Video> {
    try {
      console.log('📝 Creating video:', data.title);
      const response = await api.post('/videos', data);
      const video = parseVideoResponse(response.data);
      console.log('✅ Video created:', video.id);
      return video;
    } catch (error) {
      console.error('❌ Error creating video:', error);
      throw error;
    }
  },

  // ==================== UPDATE VIDEO ====================
  async update(id: number, data: UpdateVideoData): Promise<Video> {
    try {
      console.log(`📝 Updating video ${id}`);
      const response = await api.patch(`/videos/${id}`, data);
      const video = parseVideoResponse(response.data);
      console.log('✅ Video updated');
      return video;
    } catch (error) {
      console.error('❌ Error updating video:', error);
      throw error;
    }
  },

  // ==================== PUBLISH VIDEO ====================
  async publish(id: number): Promise<Video> {
    try {
      console.log(`📤 Publishing video ${id}`);
      const response = await api.patch(`/videos/${id}/publish`);
      const video = parseVideoResponse(response.data);
      console.log('✅ Video published');
      return video;
    } catch (error) {
      console.error('❌ Error publishing video:', error);
      throw error;
    }
  },

  // ==================== ARCHIVE VIDEO ====================
  async archive(id: number): Promise<Video> {
    try {
      console.log(`📦 Archiving video ${id}`);
      const response = await api.patch(`/videos/${id}/archive`);
      const video = parseVideoResponse(response.data);
      console.log('✅ Video archived');
      return video;
    } catch (error) {
      console.error('❌ Error archiving video:', error);
      throw error;
    }
  },

  // ==================== SAVE PROGRESS ====================
  async saveProgress(
    videoId: number,
    dto: { profileId: number; timestampSeconds: number; isCompleted?: boolean }
  ): Promise<VideoProgress | null> {
    try {
      console.log('💾 Saving progress:', { videoId, ...dto });
      
      if (!dto.profileId || dto.profileId === 0) {
        console.log('ℹ️ No profile selected, skipping progress save');
        return null;
      }

      // ✅ FIX: Use correct endpoint /api/video/progress
      const response = await api.post('/video/progress', {
        videoId,
        profileId: dto.profileId,
        timestampSeconds: dto.timestampSeconds,
        isCompleted: dto.isCompleted || false,
      });

      console.log('✅ Progress saved:', response.data);
      return response.data;
    } catch (error: any) {
      console.warn('⚠️ Failed to save progress (non-critical):', error.message);
      return null;
    }
  },

  // ==================== GET PROGRESS ====================
  async getProgress(videoId: number, profileId: number): Promise<VideoProgress | null> {
    try {
      console.log(`📊 Getting progress for video ${videoId}, profile ${profileId}`);
      
      if (!profileId || profileId === 0) {
        console.log('ℹ️ No profile selected, returning null');
        return null;
      }

      // ✅ FIX: Use correct endpoint /api/video/:videoId/progress?profileId=X
      const response = await api.get(`/video/${videoId}/progress?profileId=${profileId}`);
      console.log('✅ Progress retrieved:', response.data);
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('ℹ️ No progress found for this video');
        return null;
      }
      console.error('❌ Error getting progress:', error);
      return null;
    }
  },

  // ==================== INCREMENT VIEW ====================
  async incrementView(id: number): Promise<void> {
    try {
      console.log(`👁 Incrementing view for video ${id}`);
      const response = await api.post(`/videos/${id}/view`);
      console.log('✅ View incremented:', response.data.view_count);
    } catch (error: any) {
      console.warn('⚠️ Failed to increment view (non-critical):', error.message);
      // Don't throw - ini non-critical operation
    }
  },

  // ==================== DELETE VIDEO ====================
  async delete(id: number): Promise<void> {
    try {
      console.log(`🗑️ Deleting video ${id}`);
      await api.delete(`/videos/${id}`);
      console.log('✅ Video deleted');
    } catch (error) {
      console.error('❌ Error deleting video:', error);
      throw error;
    }
  },
};