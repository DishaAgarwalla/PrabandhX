import { motion } from 'framer-motion';
import { 
  FiClock, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiUser, 
  FiCalendar,
  FiBriefcase,
  FiEye,
  FiStar,
  FiLink, // NEW: Dependency icon
  FiArrowRight // NEW: Arrow icon
} from 'react-icons/fi';
import './TaskCard.css';

const TaskCard = ({ task, onStatusChange, onView, dependencies = [] }) => {
  
  // Safe defaults for task object
  const safeTask = {
    title: task?.title || 'Untitled Task',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    description: task?.description || '',
    projectName: task?.projectName || '',
    assignedToName: task?.assignedToName || '',
    dueDate: task?.dueDate || null,
    storyPoints: task?.storyPoints || null,
    id: task?.id,
    startDate: task?.startDate || null,
    endDate: task?.endDate || null,
    progress: task?.progress || 0
  };

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'COMPLETED': return 'status-badge completed';
      case 'IN_PROGRESS': return 'status-badge in-progress';
      default: return 'status-badge todo';
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority?.toUpperCase()) {
      case 'HIGH': return 'priority-badge high';
      case 'MEDIUM': return 'priority-badge medium';
      case 'LOW': return 'priority-badge low';
      default: return 'priority-badge medium';
    }
  };

  const isOverdue = () => {
    if (safeTask.status === 'COMPLETED') return false;
    if (!safeTask.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(safeTask.dueDate);
    return dueDate < today;
  };

  const isDueToday = () => {
    if (!safeTask.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(safeTask.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  };

  const isDueTomorrow = () => {
    if (!safeTask.dueDate) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dueDate = new Date(safeTask.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === tomorrow.getTime();
  };

  const getDueDateStatus = () => {
    if (safeTask.status === 'COMPLETED') return 'completed';
    if (isOverdue()) return 'overdue';
    if (isDueToday()) return 'due-today';
    if (isDueTomorrow()) return 'due-tomorrow';
    return 'upcoming';
  };

  const overdue = isOverdue();
  const dueDateStatus = getDueDateStatus();
  
  // Check if task has dependencies
  const hasPredecessors = dependencies.some(dep => dep.successorId === safeTask.id);
  const hasSuccessors = dependencies.some(dep => dep.predecessorId === safeTask.id);
  const isBlocked = hasPredecessors && dependencies.some(dep => 
    dep.successorId === safeTask.id && dep.isCompleted === false
  );

  return (
    <motion.div 
      className={`task-card ${dueDateStatus} ${isBlocked ? 'blocked' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      {/* Overdue Banner */}
      {overdue && safeTask.status !== 'COMPLETED' && (
        <div className="overdue-banner">
          <FiAlertCircle /> OVERDUE
        </div>
      )}
      
      {/* Blocked Banner */}
      {isBlocked && safeTask.status !== 'COMPLETED' && (
        <div className="blocked-banner">
          <FiLink /> BLOCKED - Waiting on dependencies
        </div>
      )}

      {/* Progress Bar (for Gantt tasks) */}
      {safeTask.progress > 0 && safeTask.progress < 100 && (
        <div className="task-progress-bar">
          <div className="progress-fill" style={{ width: `${safeTask.progress}%` }} />
        </div>
      )}

      <div className="task-card-header">
        <div className="task-title-section">
          <h3 className="task-title">
            {safeTask.title}
            {/* Dependency Indicators */}
            {hasPredecessors && (
              <span className="dependency-badge" title="Has dependencies">
                <FiLink /> 
              </span>
            )}
            {hasSuccessors && (
              <span className="dependency-badge outgoing" title="Dependents">
                <FiArrowRight />
              </span>
            )}
          </h3>
          <span className={getStatusBadge(safeTask.status)}>
            {safeTask.status?.replace('_', ' ') || 'TODO'}
          </span>
        </div>
        <div className="header-right">
          {safeTask.storyPoints && (
            <span className="story-points-badge">
              <FiStar /> {safeTask.storyPoints}
            </span>
          )}
          <span className={getPriorityBadge(safeTask.priority)}>
            {safeTask.priority}
          </span>
        </div>
      </div>

      <p className="task-description">
        {safeTask.description || 'No description provided'}
      </p>

      {/* Gantt Dates (if available) */}
      {(safeTask.startDate || safeTask.endDate) && (
        <div className="task-gantt-dates">
          {safeTask.startDate && (
            <span className="gantt-date">📅 Start: {new Date(safeTask.startDate).toLocaleDateString()}</span>
          )}
          {safeTask.endDate && (
            <span className="gantt-date">🏁 End: {new Date(safeTask.endDate).toLocaleDateString()}</span>
          )}
        </div>
      )}

      <div className="task-meta">
        <div className="meta-item">
          <FiBriefcase className="meta-icon" />
          <span>{safeTask.projectName || 'No Project'}</span>
        </div>
        
        {safeTask.assignedToName && (
          <div className="meta-item">
            <FiUser className="meta-icon" />
            <span>{safeTask.assignedToName}</span>
          </div>
        )}
        
        {safeTask.dueDate && (
          <div className={`meta-item due-date ${dueDateStatus}`}>
            <FiCalendar className="meta-icon" />
            <span>
              {new Date(safeTask.dueDate).toLocaleDateString()}
              {dueDateStatus === 'due-today' && ' (Today)'}
              {dueDateStatus === 'due-tomorrow' && ' (Tomorrow)'}
              {dueDateStatus === 'overdue' && ' (Overdue!)'}
            </span>
          </div>
        )}
      </div>

      {/* Progress Display */}
      {safeTask.progress > 0 && safeTask.progress < 100 && (
        <div className="task-progress-info">
          <div className="progress-text">{safeTask.progress}% Complete</div>
        </div>
      )}

      {/* Simple Points Display */}
      {safeTask.storyPoints && (
        <div className="task-points-simple">
          <FiStar /> {safeTask.storyPoints} points
          {!overdue && safeTask.status !== 'COMPLETED' && (
            <span className="on-time-badge">On time: +{safeTask.storyPoints}</span>
          )}
        </div>
      )}

      <div className="task-card-footer">
        <select
          value={safeTask.status || 'TODO'}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className={`status-select ${(safeTask.status || 'TODO').toLowerCase()}`}
          disabled={isBlocked}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <button 
          className="view-task-btn"
          onClick={() => onView(task)}
        >
          <FiEye /> View Details
        </button>
      </div>
    </motion.div>
  );
};

export default TaskCard;