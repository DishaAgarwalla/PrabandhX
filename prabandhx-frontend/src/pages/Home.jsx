import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Pricing from '../components/home/Pricing';  // You need to create this
import About from '../components/home/About';      // You need to create this
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import CTA from '../components/home/CTA';
import '../components/home/home.css';

const Home = () => {
  return (
    <motion.div 
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <Features />
      <Pricing />      {/* Add this */}
      <About />        {/* Add this */}
      <HowItWorks />
      <Testimonials />
      <CTA />
    </motion.div>
  );
};

export default Home;