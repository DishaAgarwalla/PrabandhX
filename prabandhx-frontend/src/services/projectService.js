import API from './api';

export const projectService = {
  getAll: async () => {
    try {
      console.log('📡 projectService.getAll() called');
      const response = await API.get('/projects');
      console.log('✅ projectService.getAll() response:', response);
      return response;
    } catch (error) {
      console.error('❌ projectService.getAll() error:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await API.get(`/projects/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },
  
  create: async (data) => {
    try {
      const response = await API.post('/projects', data);
      return response;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      const response = await API.put(`/projects/${id}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await API.delete(`/projects/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  },

  // Get project files
  getProjectFiles: async (projectId) => {
    try {
      const response = await API.get(`/files/project/${projectId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching files for project ${projectId}:`, error);
      throw error;
    }
  },

  // Upload file to project
  uploadProjectFile: async (projectId, fileData) => {
    try {
      const response = await API.post(`/files/project/${projectId}/upload`, fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error(`Error uploading file to project ${projectId}:`, error);
      throw error;
    }
  },

  // ===== NEW: Collaborator methods =====

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

  // Invite a collaborator to a project
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
  updateCollaboratorPermission: async (collaboratorId, permission) => {
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
  getProjectActivityLogs: async (projectId) => {
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

  // Check if current user has specific permission for a project
  checkPermission: async (projectId, requiredPermission) => {
    try {
      const response = await API.get(`/collaborations/check-permission?projectId=${projectId}&requiredPermission=${requiredPermission}`);
      return response;
    } catch (error) {
      console.error('Error checking permission:', error);
      throw error;
    }
  }
};