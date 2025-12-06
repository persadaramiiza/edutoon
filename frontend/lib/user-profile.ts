import api from './api';

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: 'parent' | 'creator' | 'admin';
  created_at: string;
}

export interface UpdateUserProfileData {
  full_name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}

export const userProfileService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(data: UpdateUserProfileData): Promise<UserProfile> {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },
};
