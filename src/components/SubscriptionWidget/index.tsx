import React, { useState, useEffect } from 'react';

interface SubscriptionWidgetProps {
  isMobile?: boolean;
}

export default function SubscriptionWidget({ isMobile = false }: SubscriptionWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;
      const scrolledPercentage = (scrollTop + clientHeight) / scrollHeight;
      setIsVisible(scrolledPercentage > 0.9); // Show when 90% scrolled (10% left)
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      marginTop: '1rem',
      position: isMobile ? 'static' : 'sticky',
      top: isMobile ? 'auto' : 'calc(var(--ifm-navbar-height) + 2rem + 500px)',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      border: '1px solid var(--ifm-color-emphasis-200)',
      borderRadius: '0.5rem',
      backgroundColor: 'var(--ifm-background-surface-color)',
      boxShadow: 'var(--ifm-global-shadow-lw)',
    }}>
      <div style={{
        padding: '0.5rem',
        textAlign: 'center',
        fontSize: '1rem',
        // color: 'var(--ifm-color-content-secondary)',
        backgroundColor: 'var(--ifm-background-surface-color)',
        borderRadius: '0.25rem 0.25rem 0 0',
      }}>
        Subscribe to receive notification on new blogs like this, no spam.
      </div>
      <form
        action="https://buttondown.com/api/emails/embed-subscribe/lihil"
        method="post"
        target="popupwindow"
        onSubmit={() => {
          window.open('https://buttondown.com/lihil', 'popupwindow');
        }}
        style={{
          padding: '1rem',
          backgroundColor: 'transparent',
          borderRadius: '0 0 0.5rem 0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          border: 'none',
        }}
      >
        <label
          htmlFor="bd-email"
          style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'var(--ifm-color-content)',
          }}
        >
          Enter your email to subscribe.
        </label>
        <input
          type="email"
          name="email"
          id="bd-email"
          required
          placeholder="your@email.com"
          style={{
            padding: '0.75rem',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            backgroundColor: 'var(--ifm-background-color)',
            color: 'var(--ifm-color-content)',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--ifm-color-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--ifm-color-emphasis-300)'}
        />
        <input
          type="submit"
          value="Subscribe"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--ifm-color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, transform 0.1s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--ifm-color-primary-dark)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--ifm-color-primary)';
            e.target.style.transform = 'translateY(0)';
          }}
        />
        <p style={{
          margin: 0,
          fontSize: '0.75rem',
          color: 'var(--ifm-color-content-secondary)',
          textAlign: 'center',
        }}>

        </p>
      </form>
    </div>
  );
}