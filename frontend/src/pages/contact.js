import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can integrate an API call here
    alert('Message sent!');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section className="contact container">
      <h1>Contact Us</h1>
      <p>We'd love to hear from you. Fill out the form below or email us directly at contact@[yourdomain].com</p>

      <form onSubmit={handleSubmit}>
        <label>
          Your Name:
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          Your Email:
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Your Message:
          <textarea name="message" value={form.message} onChange={handleChange} rows="5" required />
        </label>

        <button type="submit">Send Message</button>
      </form>
    </section>
  );
};

export default Contact;
