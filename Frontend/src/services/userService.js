import api from './api';

export const userService = {
  async getProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },

  async updateProfile(userData) {
    const response = await api.put('/user/profile', userData);
    return response.data;
  }
};