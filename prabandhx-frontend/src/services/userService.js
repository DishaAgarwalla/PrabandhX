import API from './api';

export const userService = {
  getAll: async () => {
    try {
      const response = await API.get('/users');
      return response;
    } catch (error) {
      console.error('Error in userService.getAll:', error);
      throw error;
    }
  },
  
  getById: (id) => API.get(`/users/${id}`),
  
  updateRole: (id, role) => API.patch(`/users/${id}/role`, { role }),
  
  delete: (id) => API.delete(`/users/${id}`),
};