import React from 'react';

const PrivacyPolicy = () => {
  return (
    <section className="privacy-policy container">
      <h1>Privacy Policy</h1>
      <p>Last updated: [Insert Date]</p>

      <p>
        Your privacy is important to us. This policy explains what data we collect, why we collect it, and how we use it.
      </p>

      <h2>Information We Collect</h2>
      <ul>
        <li>Personal data you provide when filling out forms or contacting us</li>
        <li>Usage data (IP address, browser type, time spent, etc.)</li>
      </ul>

      <h2>How We Use It</h2>
      <p>To improve our services, respond to your messages, and analyze trends.</p>

      <h2>Cookies</h2>
      <p>
        We may use cookies to enhance your experience. You can disable cookies in your browser settings.
      </p>

      <h2>Your Rights</h2>
      <p>
        You may request access to or deletion of your data by emailing us at privacy@[yourdomain].com.
      </p>
    </section>
  );
};

export default PrivacyPolicy;
