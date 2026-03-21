import API from './api';

export const taskService = {
  // Get all tasks (with pagination handling) - THIS WORKS!
  getAll: async () => {
    try {
      console.log('📡 Fetching all tasks...');
      const response = await API.get('/tasks');
      console.log('✅ Tasks fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching all tasks:', error);
      throw error;
    }
  },

  // Get tasks by project ID
  getByProject: async (projectId) => {
    try {
      console.log(`📡 Fetching tasks for project ${projectId}...`);
      const response = await API.get(`/tasks/project/${projectId}`);
      console.log('✅ Project tasks fetched:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching tasks for project ${projectId}:`, error);
      throw error;
    }
  },

  // Get my tasks - Uses getAll and filters on frontend
  getMyTasks: async () => {
    try {
      console.log('📡 Fetching my tasks (using getAll + filter)...');
      
      // Use the working endpoint
      const response = await API.get('/tasks');
      
      // Get current user email from localStorage
      const userStr = localStorage.getItem('user');
      let userEmail = null;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userEmail = user.email;
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
      
      // Handle different response structures
      let allTasks = [];
      if (response.data?.content) {
        allTasks = response.data.content;
      } else if (Array.isArray(response.data)) {
        allTasks = response.data;
      } else {
        allTasks = response.data || [];
      }
      
      // Filter tasks assigned to current user
      const myTasks = allTasks.filter(task => {
        // Check various ways the task might be assigned
        return task.assignedTo === userEmail || 
               task.assignedTo?.email === userEmail ||
               task.assignedToId === userEmail ||
               task.assignedTo === userEmail;
      });
      
      console.log(`✅ Found ${myTasks.length} tasks for user ${userEmail}`);
      return { data: myTasks };
      
    } catch (error) {
      console.error('❌ Error fetching my tasks:', error);
      throw error;
    }
  },

  // Create a new task - FIXED FOR YOUR BACKEND
  create: async (data, projectId) => {
    try {
      console.log('📡 Creating task:', data);
      console.log('📡 For project ID:', projectId);
      
      // Your backend expects projectId in the URL
      const response = await API.post(`/tasks/project/${projectId}`, data);
      console.log('✅ Task created:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  },

  // Alternative create method if you have the projectId in the data
  createTask: async (taskData) => {
    try {
      console.log('📡 Creating task with data:', taskData);
      
      // Extract projectId from data or use the one in the object
      const projectId = taskData.projectId;
      
      if (!projectId) {
        throw new Error('Project ID is required to create a task');
      }
      
      // Remove projectId from the data as it goes in URL
      const { projectId: _, ...taskDataWithoutProjectId } = taskData;
      
      const response = await API.post(`/tasks/project/${projectId}`, taskDataWithoutProjectId);
      console.log('✅ Task created:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  },

  // Update a task
  update: async (id, data) => {
    try {
      console.log(`📡 Updating task ${id}:`, data);
      const response = await API.put(`/tasks/${id}`, data);
      console.log('✅ Task updated:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error updating task ${id}:`, error);
      throw error;
    }
  },

  // Update task status only
  updateStatus: async (id, status) => {
    try {
      console.log(`📡 Updating task ${id} status to ${status}`);
      
      // Try the most likely endpoint first
      try {
        const response = await API.patch(`/tasks/${id}/status`, { status });
        console.log('✅ Status updated:', response);
        return response;
      } catch (err) {
        console.log('⚠️ Primary status endpoint failed, trying update endpoint...');
        // Fallback to update endpoint with just status
        const response = await API.patch(`/tasks/${id}`, { status });
        console.log('✅ Status updated via update endpoint:', response);
        return response;
      }
      
    } catch (error) {
      console.error(`❌ Error updating task ${id} status:`, error);
      throw error;
    }
  },

  // Delete a task
  delete: async (id) => {
    try {
      console.log(`📡 Deleting task ${id}...`);
      const response = await API.delete(`/tasks/${id}`);
      console.log('✅ Task deleted:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error deleting task ${id}:`, error);
      throw error;
    }
  },

  // Helper method to check which endpoints work (for debugging)
  testEndpoints: async () => {
    const token = localStorage.getItem('token');
    const endpoints = [
      '/tasks',
      '/tasks/my-tasks',
      '/tasks/mine',
      '/tasks/assigned-to-me',
      '/tasks/user',
      '/tasks/status'
    ];
    
    const results = {};
    console.log('🔍 Testing task endpoints...');
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:8080/api${endpoint}`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        results[endpoint] = {
          status: response.status,
          working: response.status === 200,
          statusText: response.statusText
        };
        console.log(`📌 ${endpoint}: ${response.status}`);
      } catch (err) {
        results[endpoint] = {
          error: err.message,
          working: false
        };
        console.log(`❌ ${endpoint}: Error - ${err.message}`);
      }
    }
    
    console.log('🔍 Endpoint test results:', results);
    return results;
  },

  // Test POST endpoints for task creation
  testCreateEndpoints: async () => {
    const token = localStorage.getItem('token');
    const projectId = 1; // Use a valid project ID for testing
    
    const endpoints = [
      `/tasks/project/${projectId}`,
      '/tasks',
      '/tasks/create',
      '/task'
    ];
    
    const results = {};
    console.log('🔍 Testing task creation endpoints...');
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:8080/api${endpoint}`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            title: 'Test Task', 
            description: 'Test Description',
            priority: 'MEDIUM',
            status: 'TODO'
          })
        });
        results[endpoint] = {
          status: response.status,
          working: response.status === 200 || response.status === 201,
          statusText: response.statusText
        };
        console.log(`📌 ${endpoint}: ${response.status} - ${response.statusText}`);
      } catch (err) {
        results[endpoint] = {
          error: err.message,
          working: false
        };
        console.log(`❌ ${endpoint}: Error - ${err.message}`);
      }
    }
    
    console.log('🔍 Task creation endpoint test results:', results);
    return results;
  }
};