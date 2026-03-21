import { motion } from 'framer-motion';
import './home.css';

const steps = [
  {
    number: '1',
    title: 'Create Project',
    description: 'Start by creating a new project. Add project details, set goals, and define timelines.'
  },
  {
    number: '2',
    title: 'Assign Tasks',
    description: 'Break down your project into tasks. Assign them to team members with priorities and due dates.'
  },
  {
    number: '3',
    title: 'Track Progress',
    description: 'Monitor task completion, track time, and get real-time updates on project status.'
  }
];

const HowItWorks = () => {
  return (
    <section className="how-it-works-section">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started in three simple steps</p>
        </motion.div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="step-item"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;