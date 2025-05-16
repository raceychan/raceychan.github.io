import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  image: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Performant',
    image: require('@site/static/img/performant_pic.png').default,
    description: (
      <>
        Blazing fast across tasks and conditions—Lihil ranks among the fastest Python web frameworks, outperforming comparable ASGI frameworks by 50%–100%.
      </>
    ),
  },
  {
    title: 'Professional',
    image: require('@site/static/img/professional_pic.png').default,
    description: (
      <>
        Lihil comes with middlewares essential for enterprise development—authentication, authorization, event publishing, etc.
        <br />
        Designed for productivity from day one with support for TDD and DDD.
      </>
    ),
  },
  {
    title: 'Productive',
    image: require('@site/static/img/productive_pic.png').default,
    description: (
      <>
        A rich API with strong typing, built-in solutions for common problems, and OpenAPI doc generation.
        <br />
        Everything to get started fast—without giving up flexibility.
      </>
    ),
  },
];

function Feature({title, image, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.card}>
        <div className="text--center">
          <img src={image} className={styles.featureImage} alt={title} />
        </div>
        <div className="text--center padding-horiz--md padding-vert--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}