import { motion } from 'framer-motion';
import './home.css';

const testimonials = [
  {
    quote: "PrabandhX transformed how our team works. Project delivery time improved by 40%!",
    author: "Sarah Johnson",
    role: "Product Manager at TechCorp",
    avatar: "👩‍💼"
  },
  {
    quote: "The role-based access is perfect for our organization. Admins have control, teams have clarity.",
    author: "Michael Chen",
    role: "Engineering Lead at InnovateLabs",
    avatar: "👨‍💻"
  },
  {
    quote: "Intuitive interface and powerful features. Best project management tool we've used.",
    author: "Priya Patel",
    role: "Team Lead at DesignStudio",
    avatar: "👩‍🎨"
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-subtitle">Trusted by teams worldwide</p>
        </motion.div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              <div className="testimonial-quote">"{testimonial.quote}"</div>
              <div className="testimonial-author">
                <span className="author-avatar">{testimonial.avatar}</span>
                <div className="author-info">
                  <span className="author-name">{testimonial.author}</span>
                  <span className="author-role">{testimonial.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;