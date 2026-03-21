import { motion } from 'framer-motion';
import './home.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-grid">
          <motion.div 
            className="about-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">About PrabandhX</h2>
            <p className="about-text">
              Founded in 2024, PrabandhX was built with a simple mission: to make project management 
              intuitive, powerful, and accessible for teams of all sizes.
            </p>
            <p className="about-text">
              Our platform combines the best of task management, team collaboration, and project tracking 
              into one seamless experience. Whether you're a startup of 5 or an enterprise of 5000, 
              PrabandhX scales with your needs.
            </p>
            <div className="about-stats">
              <div className="stat">
                <span className="stat-value">10K+</span>
                <span className="stat-label">Teams</span>
              </div>
              <div className="stat">
                <span className="stat-value">50K+</span>
                <span className="stat-label">Projects</span>
              </div>
              <div className="stat">
                <span className="stat-value">99%</span>
                <span className="stat-label">Satisfaction</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="about-image"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img 
              src="/images/about-illustration.svg" 
              alt="About PrabandhX"
              onError={(e) => {
                e.target.src = 'https://cdn-icons-png.flaticon.com/512/1055/1055683.png';
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;