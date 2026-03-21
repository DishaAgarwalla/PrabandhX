import API from './api';

export const activityLogService = {
  // Get logs for a specific project
  getProjectLogs: async (projectId) => {
    try {
      const response = await API.get(`/activity/project/${projectId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching logs for project ${projectId}:`, error);
      throw error;
    }
  },

  // Get logs for a specific user
  getUserLogs: async (userId) => {
    try {
      const response = await API.get(`/activity/user/${userId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching logs for user ${userId}:`, error);
      throw error;
    }
  },

  // Get my own activity logs
  getMyActivity: async () => {
    try {
      const response = await API.get('/activity/my-activity');
      return response;
    } catch (error) {
      console.error('Error fetching my activity:', error);
      throw error;
    }
  },

  // Get recent logs (Admin only)
  getRecentLogs: async (page = 0, size = 50) => {
    try {
      const response = await API.get(`/activity/recent?page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error fetching recent logs:', error);
      throw error;
    }
  },

  // Get logs by date range
  getLogsByDateRange: async (start, end) => {
    try {
      const response = await API.get(`/activity/range?start=${start}&end=${end}`);
      return response;
    } catch (error) {
      console.error('Error fetching logs by date range:', error);
      throw error;
    }
  },

  // Get today's logs
  getTodayLogs: async () => {
    try {
      const response = await API.get('/activity/today');
      return response;
    } catch (error) {
      console.error('Error fetching today\'s logs:', error);
      throw error;
    }
  },

  // Search logs by keyword
  searchLogs: async (keyword) => {
    try {
      const response = await API.get(`/activity/search?keyword=${encodeURIComponent(keyword)}`);
      return response;
    } catch (error) {
      console.error('Error searching logs:', error);
      throw error;
    }
  },

  // Get activity statistics
  getActivityStats: async () => {
    try {
      const response = await API.get('/activity/stats');
      return response;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  },

  // Get project activity statistics
  getProjectActivityStats: async (projectId) => {
    try {
      const response = await API.get(`/activity/stats/project/${projectId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching activity stats for project ${projectId}:`, error);
      throw error;
    }
  },

  // Clean up old logs (Admin only)
  cleanupOldLogs: async (daysOld = 30) => {
    try {
      const response = await API.delete(`/activity/cleanup?daysOld=${daysOld}`);
      return response;
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      throw error;
    }
  }
};