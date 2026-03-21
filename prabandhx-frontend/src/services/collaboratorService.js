import API from './api';

export const collaboratorService = {
  // ===== EXISTING METHODS =====
  
  // Get all collaborators for a project
  getProjectCollaborators: async (projectId) => {
    try {
      const response = await API.get(`/collaborations/project/${projectId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching collaborators for project ${projectId}:`, error);
      throw error;
    }
  },

  // Invite a collaborator
  inviteCollaborator: async (invitationData) => {
    try {
      const response = await API.post('/collaborations/invite', invitationData);
      return response;
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      throw error;
    }
  },

  // Update collaborator permissions
  updatePermission: async (collaboratorId, permission) => {
    try {
      const response = await API.put(`/collaborations/${collaboratorId}/permission?permission=${permission}`);
      return response;
    } catch (error) {
      console.error(`Error updating collaborator ${collaboratorId} permission:`, error);
      throw error;
    }
  },

  // Remove a collaborator
  removeCollaborator: async (collaboratorId) => {
    try {
      const response = await API.delete(`/collaborations/${collaboratorId}`);
      return response;
    } catch (error) {
      console.error(`Error removing collaborator ${collaboratorId}:`, error);
      throw error;
    }
  },

  // Get activity logs for a project
  getActivityLogs: async (projectId) => {
    try {
      const response = await API.get(`/collaborations/project/${projectId}/logs`);
      return response;
    } catch (error) {
      console.error(`Error fetching activity logs for project ${projectId}:`, error);
      throw error;
    }
  },

  // Get projects where current user is a collaborator
  getMyCollaborations: async () => {
    try {
      const response = await API.get('/collaborations/my-projects');
      return response;
    } catch (error) {
      console.error('Error fetching my collaborations:', error);
      throw error;
    }
  },

  // Accept an invitation (public endpoint)
  acceptInvitation: async (token, email) => {
    try {
      const response = await API.post(`/invitations/accept?token=${token}&email=${email}`);
      return response;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  },

  // Validate invitation token
  validateInvitation: async (token) => {
    try {
      const response = await API.get(`/invitations/validate?token=${token}`);
      return response;
    } catch (error) {
      console.error('Error validating invitation:', error);
      throw error;
    }
  },

  // Check if user has permission for a project
  checkPermission: async (projectId, requiredPermission) => {
    try {
      const response = await API.get(`/collaborations/check-permission?projectId=${projectId}&requiredPermission=${requiredPermission}`);
      return response;
    } catch (error) {
      console.error('Error checking permission:', error);
      throw error;
    }
  },

  // ===== NEW ADMIN METHODS =====

  /**
   * Get all collaborators (Admin only)
   */
  getAllCollaborators: async () => {
    try {
      const response = await API.get('/collaborations/admin/all');
      return response;
    } catch (error) {
      console.error('Error fetching all collaborators:', error);
      throw error;
    }
  },

  /**
   * Get collaborator statistics (Admin only)
   */
  getCollaboratorStats: async () => {
    try {
      const response = await API.get('/collaborations/admin/stats');
      return response;
    } catch (error) {
      console.error('Error fetching collaborator stats:', error);
      throw error;
    }
  },

  /**
   * Get all collaborators with pagination (Admin only)
   */
  getAllCollaboratorsPaginated: async (page = 0, size = 20) => {
    try {
      const response = await API.get(`/collaborations/admin/all/paginated?page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error fetching paginated collaborators:', error);
      throw error;
    }
  },

  /**
   * Admin delete collaborator (hard delete)
   */
  adminDeleteCollaborator: async (collaboratorId) => {
    try {
      const response = await API.delete(`/collaborations/admin/${collaboratorId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting collaborator ${collaboratorId}:`, error);
      throw error;
    }
  },

  /**
   * Admin update collaborator
   */
  adminUpdateCollaborator: async (collaboratorId, permission, isActive) => {
    try {
      let url = `/collaborations/admin/${collaboratorId}?`;
      const params = [];
      if (permission) params.push(`permission=${permission}`);
      if (isActive !== undefined) params.push(`isActive=${isActive}`);
      url += params.join('&');
      
      const response = await API.put(url);
      return response;
    } catch (error) {
      console.error(`Error updating collaborator ${collaboratorId}:`, error);
      throw error;
    }
  },

  /**
   * Search collaborators (Admin only)
   */
  searchCollaborators: async (searchTerm) => {
    try {
      const response = await API.get(`/collaborations/admin/search?term=${encodeURIComponent(searchTerm)}`);
      return response;
    } catch (error) {
      console.error('Error searching collaborators:', error);
      throw error;
    }
  },

  /**
   * Get collaborators by status (Admin only)
   */
  getCollaboratorsByStatus: async (status) => {
    try {
      const response = await API.get(`/collaborations/admin/status/${status}`);
      return response;
    } catch (error) {
      console.error(`Error fetching collaborators with status ${status}:`, error);
      throw error;
    }
  },

  /**
   * Clean up expired invitations (Admin only)
   */
  cleanupExpiredInvitations: async () => {
    try {
      const response = await API.post('/collaborations/cleanup');
      return response;
    } catch (error) {
      console.error('Error cleaning up expired invitations:', error);
      throw error;
    }
  }
};