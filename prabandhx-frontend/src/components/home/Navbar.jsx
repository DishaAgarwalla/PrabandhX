import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './home.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          PrabandhX
        </Link>

        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/" className="nav-link">Home</Link></li>
            <li><a href="#features" className="nav-link">Features</a></li>
            <li><a href="#pricing" className="nav-link">Pricing</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
          </ul>

          <div className="nav-buttons">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>

        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;