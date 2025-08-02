import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface BaseAdItem {
  id: string;
  link?: string;
}

interface TextAd extends BaseAdItem {
  type: 'text';
  text: string;
}

interface ImageAd extends BaseAdItem {
  type: 'image';
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

type AdItem = TextAd | ImageAd;

const ads: AdItem[] = [
  {
    id: '1',
    type: 'text',
    text: "The Fastest ASGI Webframework with Django Like Developing Experience",
    link: "https://github.com/raceychan/lihil"
  },
  {
    id: '2',
    type: 'text',
    text: "Add API-Gateway Features to Your ASGI App in 1 Line of Code",
    link: "https://github.com/raceychan/premier"
  },
  {
    id: "3",
    type: "text",
    text: "Interactive, Automated Benchmarks for Lihil and Other ASGI Webframeworks",
    link: "https://github.com/raceychan/lhl_bench"
  }
];


const RollingAd: React.FC = () => {
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0);

  useEffect(() => {
    const handleAnimationEnd = () => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    };

    const textElement = document.querySelector(`.${styles.adText}`);
    if (textElement) {
      textElement.addEventListener('animationiteration', handleAnimationEnd);
      return () => textElement.removeEventListener('animationiteration', handleAnimationEnd);
    }
  }, [currentAdIndex]);

  const currentAd = ads[currentAdIndex];

  const handleAdClick = () => {
    if (currentAd.link) {
      window.open(currentAd.link, '_blank', 'noopener,noreferrer');
    }
  };

  const renderAdContent = () => {
    if (currentAd.type === 'text') {
      return (
        <span
          className={`${styles.adText} ${currentAd.link ? styles.clickable : styles.nonClickable
            }`}
          onClick={currentAd.link ? handleAdClick : undefined}
          role={currentAd.link ? "button" : undefined}
          tabIndex={currentAd.link ? 0 : undefined}
          onKeyDown={currentAd.link ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleAdClick();
            }
          } : undefined}
        >
          {currentAd.text}
        </span>
      );
    } else {
      return (
        <img
          src={currentAd.src}
          alt={currentAd.alt}
          width={currentAd.width}
          height={currentAd.height}
          className={`${styles.adImage} ${currentAd.link ? styles.clickable : styles.nonClickable
            }`}
          onClick={currentAd.link ? handleAdClick : undefined}
          role={currentAd.link ? "button" : undefined}
          tabIndex={currentAd.link ? 0 : undefined}
          onKeyDown={currentAd.link ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleAdClick();
            }
          } : undefined}
        />
      );
    }
  };

  return (
    <div className={styles.rollingAd}>
      {renderAdContent()}
    </div>
  );
};

export default RollingAd;