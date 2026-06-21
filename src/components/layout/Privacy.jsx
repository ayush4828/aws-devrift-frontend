import React from 'react';
import Layout from './Layout';

const Privacy = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-xl">
        <h1 className="font-headline-xl text-primary mb-md">Privacy Policy</h1>
        <div className="glass-panel p-xl rounded-xl border border-outline-variant/30 space-y-md text-on-surface-variant">
          <p>Last updated: June 2026</p>
          <h2 className="font-headline-sm text-white mt-lg">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, create repositories, or interact with other users on DevRift.</p>
          
          <h2 className="font-headline-sm text-white mt-lg">2. How We Use Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, as well as to develop new features and protect DevRift and our users.</p>
          
          <h2 className="font-headline-sm text-white mt-lg">3. Information Sharing</h2>
          <p>We do not share your personal information with third parties except as described in this privacy policy.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
