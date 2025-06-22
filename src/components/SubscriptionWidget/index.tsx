import React from 'react';

interface SubscriptionWidgetProps {
  isMobile?: boolean;
}

export default function SubscriptionWidget({ isMobile = false }: SubscriptionWidgetProps) {
  return (
    <div style={{
      marginTop: '1rem',
      position: isMobile ? 'static' : 'sticky',
      top: isMobile ? 'auto' : 'calc(var(--ifm-navbar-height) + 2rem + 500px)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        padding: '0.5rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--ifm-color-content-secondary)',
        backgroundColor: 'var(--ifm-background-surface-color)',
        borderRadius: '0.25rem 0.25rem 0 0',
      }}>
        Daily updates with GPT-free, unique insights
      </div>
      <iframe
        style={{
          width: '100%',
          height: '200px',
          border: 'none',
          borderRadius: '0 0 0.25rem 0.25rem',
        }}
        src="https://buttondown.com/enterprise?as_embed=true"
        title="Newsletter Subscription"
      />
    </div>
  );
}