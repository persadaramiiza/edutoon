import api from './api';

export interface Video {
  id: number;
  title: string;
  description?: string;
  video_url: string;
  video_id?: string;
  thumbnail_url?: string;
  platform: 'youtube' | 'vimeo' | 'native' | 'other';
  status: 'draft' | 'published' | 'archived';
  duration_seconds?: number;
  min_age: number;
  max_age?: number;
  category?: string;
  view_count: number;
  creator_id?: number;
  creator?: {
    id: number;
    email: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateVideoData {
  title: string;
  description?: string;
  video_url: string;
  platform?: 'youtube' | 'vimeo' | 'native' | 'other';
  thumbnail_url?: string;
  duration_seconds?: number;
  min_age?: number;
  max_age?: number;
  category?: string;
}

export type UpdateVideoData = Partial<CreateVideoData>;

export const videosService = {
  async getAll(profileId?: number): Promise<Video[]> {
    const response = await api.get('/videos', {
      params: {
        ...(profileId && { profileId: String(profileId) }),
      },
    });
    // Backend returns paginated result with { data, meta }
    return response.data?.data || response.data || [];
  },

  async getById(id: number): Promise<Video> {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  async getMyVideos(): Promise<Video[]> {
    const response = await api.get('/videos/my-videos');
    return response.data;
  },

  async create(data: CreateVideoData): Promise<Video> {
    const response = await api.post('/videos', data);
    return response.data;
  },

  async update(id: number, data: UpdateVideoData): Promise<Video> {
    const response = await api.patch(`/videos/${id}`, data);
    return response.data;
  },

  async publish(id: number): Promise<Video> {
    const response = await api.patch(`/videos/${id}/publish`);
    return response.data;
  },

  async archive(id: number): Promise<Video> {
    const response = await api.patch(`/videos/${id}/archive`);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/videos/${id}`);
  },
};
