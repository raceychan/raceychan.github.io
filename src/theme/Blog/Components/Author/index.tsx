import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import type {Props} from '@theme/Blog/Components/Author';
import AuthorSocials from '@theme/Blog/Components/Author/Socials';
import Heading from '@theme/Heading';
import { XIcon, GitHubIcon } from '@site/src/components/SocialIcons';
import styles from './styles.module.css';

function MaybeLink(props: {href?: string; children: React.ReactNode}): JSX.Element {
  if (props.href) {
    return <Link {...props} />;
  }
  return <>{props.children}</>;
}

export default function BlogAuthor({author, className}: Props): JSX.Element {
  const {name, title, url, imageURL, email} = author;
  const link = url || (email && `mailto:${email}`) || undefined;
  
  // Hardcoded social handles - decoupled from YAML configuration
  const socialLinks = {
    x: {
      handle: 'lihil_cc',
      url: 'https://x.com/lihil_cc'
    },
    github: {
      handle: 'raceychan',
      url: 'https://github.com/raceychan'
    }
  };

  return (
    <div className={clsx('avatar margin-bottom--sm', className)}>
      {imageURL && (
        <MaybeLink href={link} className="avatar__photo-link">
          <img className="avatar__photo" src={imageURL} alt={name} />
        </MaybeLink>
      )}

      {name && (
        <div className="avatar__intro" itemProp="author" itemScope itemType="https://schema.org/Person">
          {/* Row 1: Author Name */}
          <div className="avatar__name">
            <MaybeLink href={link} itemProp="url">
              <span itemProp="name">{name}</span>
            </MaybeLink>
          </div>
          
          {/* Row 2: Author Title */}
          {title && (
            <div className="avatar__subtitle-row">
              <small className="avatar__subtitle" itemProp="description">
                {title}
              </small>
            </div>
          )}
          
          {/* Row 3: Follow me on Social Links */}
          <div className={styles.followRow}>
            <div className={styles.followSection}>
              <span className={styles.followText}>Follow me on</span>
              <div className={styles.socialIcons}>
                {/* X/Twitter */}
                <Link
                  href={socialLinks.x.url}
                  className={styles.socialIcon}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Follow @${socialLinks.x.handle} on X`}
                >
                  <XIcon className={styles.xIcon} />
                </Link>
                
                {/* GitHub */}
                <Link
                  href={socialLinks.github.url}
                  className={styles.socialIcon}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Follow @${socialLinks.github.handle} on GitHub`}
                >
                  <GitHubIcon className={styles.githubIcon} />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Social Links */}
          {author.socials && (
            <div className={styles.socialLinksContainer}>
              <AuthorSocials author={author} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}