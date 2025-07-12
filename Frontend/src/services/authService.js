import api from './api'

export const authService = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),

  register: (userData) => 
    api.post('/auth/register', userData),

  logout: () => 
    api.post('/auth/logout'),

  getProfile: () => 
    api.get('/user/profile'),

  updateProfile: (profileData) => 
    api.put('/user/profile', profileData),

  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', { oldPassword, newPassword })
}