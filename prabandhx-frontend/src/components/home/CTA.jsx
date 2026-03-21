import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './home.css';

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="cta-title">Ready to manage your projects better?</h2>
          <p className="cta-subtitle">
            Join thousands of teams using PrabandhX to streamline their workflow
          </p>
          <Link to="/signup" className="btn btn-primary btn-large">
            Start Free Trial
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;