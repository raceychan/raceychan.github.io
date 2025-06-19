import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import type {Props} from '@theme/BlogPostItem/Container';

export default function BlogPostItemContainer({
  children,
  className,
}: Props): ReactNode {
  return (
    <article 
      className={clsx(className)} 
      style={{
        marginBottom: '3rem',
        padding: '2rem 0',
        borderBottom: '1px solid var(--ifm-color-emphasis-200)'
      }}
    >
      {children}
    </article>
  );
}
