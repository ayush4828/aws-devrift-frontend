import React from 'react';
import Layout from './Layout';

const Terms = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-xl">
        <h1 className="font-headline-xl text-primary mb-md">Terms of Service</h1>
        <div className="glass-panel p-xl rounded-xl border border-outline-variant/30 space-y-md text-on-surface-variant">
          <p>Last updated: June 2026</p>
          <h2 className="font-headline-sm text-white mt-lg">1. Acceptance of Terms</h2>
          <p>By accessing and using DevRift, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h2 className="font-headline-sm text-white mt-lg">2. User Conduct</h2>
          <p>You agree to not use the service to post or transmit any content that is unlawful, threatening, abusive, defamatory, invasive of privacy, or otherwise objectionable.</p>
          
          <h2 className="font-headline-sm text-white mt-lg">3. Termination</h2>
          <p>We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
