import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './home.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* LEFT SIDE - Text Content */}
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span 
            className="hero-badge"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            ✨ Project Management Reimagined
          </motion.span>
          
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Manage Projects <br />
            <span className="hero-title-gradient">Smarter with PrabandhX</span>
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            A powerful project management system for Admins, Managers, and Teams.
            Streamline your workflow, track progress, and deliver projects on time.
          </motion.p>
          
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Link to="/signup" className="btn btn-primary btn-large">
              Get Started Free
            </Link>
            <a href="#features" className="btn btn-outline btn-large">
              Learn More
            </a>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">99%</span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE - Your Local Image */}
        <motion.div 
          className="hero-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          <img 
            src="/images/hero-illustration.svg.png" 
            alt="Project Management Illustration"
          />
          <div className="hero-image-shape"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;