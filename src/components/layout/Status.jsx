import React from 'react';
import Layout from './Layout';

const Status = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-xl">
        <h1 className="font-headline-xl text-primary mb-md">System Status</h1>
        <div className="glass-panel p-xl rounded-xl border border-outline-variant/30 text-center">
          <i className="fa-solid fa-check-circle text-5xl text-green-500 mb-md"></i>
          <h2 className="font-headline-md text-white mb-sm">All Systems Operational</h2>
          <p className="text-on-surface-variant">
            DevRift is running smoothly. No current outages or degraded performance reported.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Status;
