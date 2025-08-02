import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import WriteButton from '@site/src/components/WriteButton';
import SubscriptionWidget from '@site/src/components/SubscriptionWidget';

import type { Props } from '@theme/BlogLayout';

export default function BlogLayout(props: Props): ReactNode {
  const { sidebar, toc, children, ...layoutProps } = props;
  const hasSidebar = sidebar && sidebar.items.length > 0;

  return (
    <Layout {...layoutProps}>
      <div className="container-fluid margin-vert--lg" style={{ maxWidth: '80%', margin: '0 auto' }}>
      <div className="row">
        <BlogSidebar sidebar={sidebar} />
        <main
          className={clsx('col', {
            'col--7': hasSidebar,
            'col--10 col--offset-1': !hasSidebar,
          })}
          style={hasSidebar ? {
            borderLeft: '1px solid var(--ifm-color-emphasis-200)',
            paddingLeft: '2rem',
            paddingRight: '1.5rem'
          } : {}}>
          {children}
          {/* Mobile subscription widget - only shows on mobile when sidebar is hidden */}
          <div style={{
            display: 'block',
            marginTop: '2rem',
          }} 
          className="mobile-subscription">
            <SubscriptionWidget isMobile={true} isFixed={false} />
          </div>
        </main>
        {toc ? (
          <div className="col col--2" style={{ fontSize: '0.875rem', position: 'relative' }}>
            <WriteButton />
            <SubscriptionWidget isFixed={true} />
            {toc}
          </div>
        ) : (
          <div className="col col--3" style={{ position: 'relative' }}>
            <WriteButton />
            <SubscriptionWidget isFixed={true} />
          </div>
        )}
      </div>
    </div>
    </Layout >
  );
}
