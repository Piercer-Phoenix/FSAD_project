// components/Home.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="home-nav">
        <div className="nav-logo">
          <span className="logo-icon">🛠️</span>
          <span className="logo-text">SkillFinder</span>
        </div>
        <div className="nav-buttons">
          <button onClick={() => navigate('/login')} className="nav-btn login-btn">Login</button>
          <button onClick={() => navigate('/signup')} className="nav-btn signup-btn">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Find the Perfect <span className="highlight">Professional</span> for Your Needs
          </h1>
          <p className="hero-subtitle">
            Connect with skilled professionals, get your work done, and grow your business - all in one platform.
          </p>
          <div className="hero-actions">
            <button onClick={() => navigate('/signup')} className="primary-btn">
              Join as a Professional
            </button>
            <button onClick={() => navigate('/signup')} className="secondary-btn">
              Hire a Professional
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Professionals</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Jobs Done</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Services</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            <span className="placeholder-icon">👥</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title">How It <span className="highlight">Works</span></h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon">1️⃣</div>
            <h3>Sign Up</h3>
            <p>Create your account as a client or professional in minutes</p>
          </div>
          <div className="step-card">
            <div className="step-icon">2️⃣</div>
            <h3>Find or List Services</h3>
            <p>Search for professionals or showcase your skills</p>
          </div>
          <div className="step-card">
            <div className="step-icon">3️⃣</div>
            <h3>Connect & Hire</h3>
            <p>Connect with the right professional and get the job done</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose <span className="highlight">SkillFinder</span></h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✓</div>
            <h3>Verified Professionals</h3>
            <p>All professionals are vetted and verified for quality service</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Secure Payments</h3>
            <p>Safe and secure payment processing for peace of mind</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Ratings & Reviews</h3>
            <p>Transparent feedback system to help you make informed decisions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>24/7 Support</h3>
            <p>Dedicated customer support team always ready to help</p>
          </div>
        </div>
      </section>

      {/* For Professionals Section */}
      <section className="professionals-cta">
        <div className="cta-content">
          <h2>Are You a Professional?</h2>
          <p>Join thousands of professionals growing their business on SkillFinder</p>
          <button onClick={() => navigate('/signup')} className="cta-btn">
            Become a Professional
          </button>
        </div>
        <div className="cta-image">
          <span className="cta-icon">👔</span>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our <span className="highlight">Users Say</span></h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">
              "Found an amazing electrician within hours. The platform is so easy to use!"
            </p>
            <div className="testimonial-author">
              <span className="author-name">Sarah Johnson</span>
              <span className="author-role">Homeowner</span>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">
              "As a freelancer, this platform has helped me find consistent work and grow my client base."
            </p>
            <div className="testimonial-author">
              <span className="author-name">Mike Chen</span>
              <span className="author-role">Graphic Designer</span>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">
              "Great platform! The customer support is exceptional and the professionals are top-notch."
            </p>
            <div className="testimonial-author">
              <span className="author-name">Emily Rodriguez</span>
              <span className="author-role">Small Business Owner</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>SkillFinder</h4>
            <p>Connecting you with the best professionals since 2024</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li>📧 support@skillfinder.com</li>
              <li>📞 (555) 123-4567</li>
              <li>📍 San Francisco, CA</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 SkillFinder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;