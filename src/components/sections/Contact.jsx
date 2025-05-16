import React from 'react';

export function Contact() {
  return (
    <div className="section-content">
      <h2>Contact</h2>
      <div className="content-block">
        <div className="contact-info">
          <h3>Let's Connect!</h3>
          <p>
            I'm always interested in hearing about new projects and opportunities.
            Feel free to reach out through any of the following channels:
          </p>
          
          <div className="contact-methods">
            <div className="contact-method">
              <h4>📧 Email</h4>
              <p>your.email@example.com</p>
            </div>
            
            <div className="contact-method">
              <h4>💼 LinkedIn</h4>
              <p>linkedin.com/in/yourprofile</p>
            </div>
            
            <div className="contact-method">
              <h4>🐱 GitHub</h4>
              <p>github.com/yourusername</p>
            </div>
          </div>

          <div className="contact-form">
            <h3>Send a Message</h3>
            <form>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" placeholder="Your Name" />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" placeholder="your@email.com" />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message:</label>
                <textarea id="message" placeholder="Your message here..." rows="4"></textarea>
              </div>
              
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 