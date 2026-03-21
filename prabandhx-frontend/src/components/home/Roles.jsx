import { motion } from 'framer-motion';
import './home.css';

const roles = [
  {
    role: 'Admin',
    icon: '👑',
    features: [
      'Create and manage projects',
      'Manage users and roles',
      'View system analytics',
      'Generate reports'
    ]
  },
  {
    role: 'Manager',
    icon: '📋',
    features: [
      'Assign tasks to team members',
      'Monitor team progress',
      'Update project status',
      'Manage project resources'
    ]
  },
  {
    role: 'User',
    icon: '👤',
    features: [
      'View assigned tasks',
      'Update task progress',
      'Collaborate with team',
      'Track personal performance'
    ]
  }
];

const Roles = () => {
  return (
    <section className="roles-section">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Designed for Every Role</h2>
          <p className="section-subtitle">Tailored experiences for Admins, Managers, and Users</p>
        </motion.div>

        <div className="roles-grid">
          {roles.map((item, index) => (
            <motion.div
              key={index}
              className="role-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              <div className="role-header">
                <span className="role-icon">{item.icon}</span>
                <h3 className="role-title">{item.role}</h3>
              </div>
              <ul className="role-features">
                {item.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index * 0.2) + (i * 0.1), duration: 0.4 }}
                  >
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roles;