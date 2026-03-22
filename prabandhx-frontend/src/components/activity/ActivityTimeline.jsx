import React from 'react';
import { motion } from 'framer-motion';

const ActivityTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No timeline data available</p>
      </div>
    );
  }

  // Format timeline data for display
  const formattedTimeline = timeline.map(item => ({
    date: new Date(item[0]),
    count: item[1]
  }));

  const maxCount = Math.max(...formattedTimeline.map(d => d.count), 1);

  // ✅ Get formatted date label with actual date
  const getDateLabel = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time to compare just the date
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (compareDate.getTime() === todayDate.getTime()) {
      return 'Today';
    } else if (compareDate.getTime() === yesterdayDate.getTime()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  // ✅ Get full date for tooltip
  const getFullDate = (date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="activity-timeline">
      <h4>Platform Activity</h4>
      <div className="timeline-bars">
        {formattedTimeline.map((item, index) => (
          <motion.div
            key={index}
            className="timeline-bar-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            title={`${getFullDate(item.date)}: ${item.count} activities`}
          >
            <motion.div 
              className="timeline-bar"
              initial={{ height: 0 }}
              animate={{ height: `${(item.count / maxCount) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            />
            <span className="timeline-label">
              {getDateLabel(item.date)}
            </span>
            <span className="timeline-value">{item.count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
