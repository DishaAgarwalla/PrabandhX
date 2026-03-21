import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiUser, FiBriefcase, FiAlertCircle } from 'react-icons/fi';
import './TaskForm.css';

const TaskForm = ({ 
  initialData = {}, 
  projects = [], 
  users = [], 
  onSubmit, 
  onCancel,
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedToUserId: '', // This will map to the selected user's ID
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (initialData) {
      // Find the assigned user from users list if we have assignedToEmail
      let assignedUserId = initialData.assignedToUserId || '';
      
      if (!assignedUserId && initialData.assignedToEmail) {
        // Try to find user by email
        const user = users.find(u => u.email === initialData.assignedToEmail);
        if (user) {
          assignedUserId = user.id;
        }
      }
      
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        projectId: initialData.projectId || initialData.project?.id || '',
        assignedToUserId: assignedUserId,
        priority: initialData.priority || 'MEDIUM',
        status: initialData.status || 'TODO',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : ''
      });
      
      // Find and set selected user
      if (assignedUserId) {
        const user = users.find(u => u.id.toString() === assignedUserId.toString());
        setSelectedUser(user);
      }
    }
  }, [initialData, users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If user selection changes, update selectedUser
    if (name === 'assignedToUserId') {
      const user = users.find(u => u.id.toString() === value.toString());
      setSelectedUser(user);
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    
    // Check if due date is in the past (only for new tasks, not editing)
    if (formData.dueDate && !isEditing) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Transform form data to match backend expectations
    const submitData = {
      ...formData,
      // If a user is selected, include their email and name
      ...(selectedUser && {
        assignedToEmail: selectedUser.email,
        assignedToName: selectedUser.name
      })
    };
    
    // Remove the ID field if you don't want to send it
    delete submitData.assignedToUserId;
    
    console.log('Submitting task with data:', submitData); // Debug log
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      {/* Title Field */}
      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          className={`form-control ${errors.title ? 'error' : ''}`}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      {/* Description Field */}
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description"
          rows="4"
          className="form-control"
        />
      </div>

      {/* Project and Assigned User Row */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="projectId">
            Project <span className="required">*</span>
            <FiBriefcase className="field-icon" />
          </label>
          <select
            id="projectId"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            className={`form-control ${errors.projectId ? 'error' : ''}`}
          >
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.projectId && <span className="error-message">{errors.projectId}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="assignedToUserId">
            Assign To <FiUser className="field-icon" />
          </label>
          <select
            id="assignedToUserId"
            name="assignedToUserId"
            value={formData.assignedToUserId}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {selectedUser && (
            <small style={{ color: '#10b981', marginTop: '5px', display: 'block' }}>
              ✓ Will assign to: {selectedUser.email}
            </small>
          )}
        </div>
      </div>

      {/* Priority and Due Date Row */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="form-control"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">
            Due Date <FiCalendar className="field-icon" />
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            min={!isEditing ? new Date().toISOString().split('T')[0] : undefined}
            className={`form-control ${errors.dueDate ? 'error' : ''}`}
          />
          {errors.dueDate && (
            <span className="error-message">
              <FiAlertCircle /> {errors.dueDate}
            </span>
          )}
        </div>
      </div>

      {/* Status (only for editing) */}
      {isEditing && (
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-control"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      )}

      {/* Form Actions */}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {isEditing ? 'Update Task' : 'Create Task'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          <FiX /> Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskForm;