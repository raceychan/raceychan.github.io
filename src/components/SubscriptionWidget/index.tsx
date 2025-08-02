import React, { useState, useEffect } from 'react';

interface SubscriptionWidgetProps {
  isMobile?: boolean;
  isFixed?: boolean; // New prop for fixed positioning above TOC
}

export default function SubscriptionWidget({ isMobile = false, isFixed = false }: SubscriptionWidgetProps) {
  const [isVisible, setIsVisible] = useState(true); // Always visible by default
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  // Check localStorage for previous subscription state only (not close state)
  useEffect(() => {
    const wasSubscribed = localStorage.getItem('lihil-subscribed') === 'true';
    setIsSubscribed(wasSubscribed);
    // Don't persist close state - widget should reappear on refresh
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    try {
      // Submit to Buttondown
      const response = await fetch('https://buttondown.com/api/emails/embed-subscribe/lihil', {
        method: 'POST',
        body: formData,
        mode: 'no-cors', // Buttondown doesn't support CORS
      });
      
      // Since we can't check response due to no-cors, assume success after delay
      setTimeout(() => {
        setIsSubscribed(true);
        setIsSubmitting(false);
        localStorage.setItem('lihil-subscribed', 'true');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Subscription error:', error);
      setIsSubmitting(false);
    }
  };

  // Handle manual close
  const handleClose = () => {
    setIsClosed(true);
    setIsVisible(false);
    // Don't persist close state to localStorage - widget should reappear on refresh
  };

  // Don't render if closed or subscribed and hidden
  if (isClosed || (isSubscribed && !isVisible)) {
    return null;
  }

  return (
    <div 
      id="subscription-widget"
      style={{
        marginTop: isFixed ? '0' : '1rem',
        marginBottom: isFixed ? '1rem' : '0',
        position: 'static', // Always static - will be positioned above TOC in DOM order
        top: 'auto',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        border: '1px solid var(--ifm-color-emphasis-200)',
        borderRadius: '0.5rem',
        backgroundColor: 'var(--ifm-background-surface-color)',
        boxShadow: 'none',
        zIndex: isFixed ? 100 : 10,
      }}>
      {/* Close Button */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
          color: 'var(--ifm-color-emphasis-600)',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '50%',
          width: '1.5rem',
          height: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s ease, background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-200)';
          e.currentTarget.style.color = 'var(--ifm-color-emphasis-800)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--ifm-color-emphasis-600)';
        }}
        title="Close"
      >
        ×
      </button>
      
      {/* Success State */}
      {isSubscribed ? (
        <div style={{
          padding: '2rem 1rem',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '0.5rem',
          }}>
            ✅
          </div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'var(--ifm-color-success)',
            marginBottom: '0.5rem',
          }}>
            Successfully subscribed!
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: 'var(--ifm-color-content-secondary)',
          }}>
            You'll receive notifications for new posts. This widget will disappear automatically.
          </div>
        </div>
      ) : (
        <>
        </>
      )}
      {!isSubscribed && (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.5rem',
            backgroundColor: 'transparent',
            borderRadius: '0 0 0.5rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            border: 'none',
          }}
        >
        <div style={{
          textAlign: 'center',
          marginBottom: '0.75rem',
        }}>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--ifm-color-primary)',
            marginBottom: '0.125rem',
            letterSpacing: '-0.025em',
          }}>
            Enter your email to subscribe.
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: 'var(--ifm-color-content-secondary)',
            lineHeight: '1.2',
          }}>
            Subscribe to receive original, unique insights on OOP, web development and AI.
          </div>
        </div>
        <input
          type="email"
          name="email"
          id="bd-email"
          required
          placeholder="your@email.com"
          style={{
            padding: '0.875rem 1rem',
            border: '1.5px solid var(--ifm-color-emphasis-300)',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            backgroundColor: 'var(--ifm-background-color)',
            color: 'var(--ifm-color-content)',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--ifm-color-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(var(--ifm-color-primary-rgb), 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--ifm-color-emphasis-300)';
            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.875rem 2rem',
            backgroundColor: isSubmitting ? 'var(--ifm-color-emphasis-300)' : 'var(--ifm-color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            letterSpacing: '0.025em',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = 'var(--ifm-color-primary-dark)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = 'var(--ifm-color-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          {isSubmitting ? (
            <>
              <span style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}></span>
              Subscribing...
            </>
          ) : (
            'Subscribe'
          )}
        </button>
        <p style={{
          margin: 0,
          fontSize: '0.75rem',
          color: 'var(--ifm-color-content-secondary)',
          textAlign: 'center',
        }}>
          No spam, unsubscribe anytime.
        </p>
        </form>
      )}
    </div>
  );
}