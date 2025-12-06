import api from './api';

export interface Profile {
  id: number;
  name: string;
  avatar_url?: string;
  age_group: number;
  userId: number;
  created_at: string;
}

export interface CreateProfileData {
  name: string;
  avatar_url?: string;
  age_group: number;
}

export interface UpdateProfileData extends Partial<CreateProfileData> {}

export const profilesService = {
  async getAll(): Promise<Profile[]> {
    const response = await api.get('/profiles');
    return response.data;
  },

  async getById(id: number): Promise<Profile> {
    const response = await api.get(`/profiles/${id}`);
    return response.data;
  },

  async create(data: CreateProfileData): Promise<Profile> {
    const response = await api.post('/profiles', data);
    return response.data;
  },

  async update(id: number, data: UpdateProfileData): Promise<Profile> {
    const response = await api.patch(`/profiles/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/profiles/${id}`);
  },
};
