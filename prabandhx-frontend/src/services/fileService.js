import API from './api';

export const fileService = {
  // Get all files (Admin only)
  getAllFiles: async () => {
    try {
      const response = await API.get('/files/all');
      return response;
    } catch (error) {
      console.error('Error fetching all files:', error);
      throw error;
    }
  },

  // Get files for a specific project
  getProjectFiles: async (projectId) => {
    try {
      const response = await API.get(`/files/project/${projectId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching files for project ${projectId}:`, error);
      throw error;
    }
  },

  // Get files uploaded by current user
  getMyFiles: async () => {
    try {
      const response = await API.get('/files/my-uploads');
      return response;
    } catch (error) {
      console.error('Error fetching my files:', error);
      throw error;
    }
  },

  // Get files shared with current user
  getSharedFiles: async () => {
    try {
      const response = await API.get('/files/shared-with-me');
      return response;
    } catch (error) {
      console.error('Error fetching shared files:', error);
      throw error;
    }
  },

  // Upload a file
  uploadFile: async (fileData, projectId, taskId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', fileData);
      if (projectId) formData.append('projectId', projectId);
      if (taskId) formData.append('taskId', taskId);

      const response = await API.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Download a file
  downloadFile: async (fileId, fileName) => {
    try {
      const response = await API.get(`/files/download/${fileId}`, {
        responseType: 'blob',
      });
      
      // Get filename from response headers or use provided filename
      const contentDisposition = response.headers['content-disposition'];
      let filename = fileName;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'file');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    } catch (error) {
      console.error(`Error downloading file ${fileId}:`, error);
      throw error;
    }
  },

  // Preview a file - UPDATED for better compatibility with FilePreview component
  previewFile: async (fileId) => {
    try {
      const response = await API.get(`/files/preview/${fileId}`, {
        responseType: 'blob',
      });
      
      return response;
    } catch (error) {
      console.error(`Error previewing file ${fileId}:`, error);
      throw error;
    }
  },

  // Get preview URL directly (for images)
  getPreviewUrl: (fileId) => {
    const token = localStorage.getItem('token');
    return `${API.defaults.baseURL}/files/preview/${fileId}?t=${new Date().getTime()}&token=${token}`;
  },

  // Generate shareable link
  generateShareLink: async (fileId, expiryDays = 7, permissions = 'VIEW_ONLY') => {
    try {
      const response = await API.post(`/files/share/${fileId}`, {
        expiryDays,
        permissions,
      });
      return response;
    } catch (error) {
      console.error(`Error generating share link for file ${fileId}:`, error);
      throw error;
    }
  },

  // Get file version history
  getFileVersions: async (fileId) => {
    try {
      const response = await API.get(`/files/versions/${fileId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching versions for file ${fileId}:`, error);
      throw error;
    }
  },

  // Upload new version
  uploadNewVersion: async (fileId, fileData) => {
    try {
      const formData = new FormData();
      formData.append('file', fileData);

      const response = await API.post(`/files/version/${fileId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error(`Error uploading new version for file ${fileId}:`, error);
      throw error;
    }
  },

  // Delete a file
  deleteFile: async (fileId) => {
    try {
      const response = await API.delete(`/files/${fileId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting file ${fileId}:`, error);
      throw error;
    }
  },

  // Get file statistics
  getFileStats: async () => {
    try {
      const response = await API.get('/files/stats');
      return response;
    } catch (error) {
      console.error('Error fetching file stats:', error);
      throw error;
    }
  },

  // Access shared file via link
  accessSharedFile: async (link) => {
    try {
      const response = await API.get(`/files/shared/${link}`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      console.error(`Error accessing shared file with link ${link}:`, error);
      throw error;
    }
  },
};