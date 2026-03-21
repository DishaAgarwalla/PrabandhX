import { motion } from 'framer-motion';
import './home.css';

const features = [
  {
    icon: '🚀',
    title: 'Task Management',
    description: 'Create, assign, and track tasks with ease. Set priorities, due dates, and monitor progress in real-time.'
  },
  {
    icon: '🤝',
    title: 'Team Collaboration',
    description: 'Work together seamlessly. Add comments, share files, and keep everyone in the loop with instant notifications.'
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Visualize project progress with interactive dashboards, custom reports, and real-time insights.'
  },
  {
    icon: '🔒',
    title: 'Role-Based Access',
    description: 'Secure access control for Admins, Managers, and Users. Each role has specific permissions and views.'
  }
];

const Features = () => {
  return (
    <section id="features" className="features-section">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">
            Everything you need to manage projects effectively
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;