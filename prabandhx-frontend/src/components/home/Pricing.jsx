import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './home.css';

const plans = [
  {
    name: 'Basic',
    price: '$9',
    period: '/month',
    features: [
      'Up to 10 projects',
      'Basic task management',
      'Team collaboration',
      'Email support'
    ],
    buttonText: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: [
      'Unlimited projects',
      'Advanced task management',
      'Priority support',
      'Analytics & reports',
      'Custom fields'
    ],
    buttonText: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom integrations',
      'Advanced security'
    ],
    buttonText: 'Contact Sales',
    popular: false
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-subtitle">
            Choose the plan that's right for your team
          </p>
        </motion.div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                <span className="price">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
              <ul className="plan-features">
                {plan.features.map((feature, i) => (
                  <li key={i}>✓ {feature}</li>
                ))}
              </ul>
              <Link to="/signup" className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} btn-block`}>
                {plan.buttonText}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;