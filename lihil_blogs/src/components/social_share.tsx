import React from 'react';
import {  TwitterShareButton, XIcon, LinkedinShareButton, LinkedinIcon, RedditShareButton, RedditIcon, BlueskyShareButton, BlueskyIcon } from 'react-share';

interface SocialShareProps {
  url: string;
  title: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ url, title }) => {
  const icon_size = 32
  const source = "lihil"

  return (
    <div className="social-share-buttons">
      <TwitterShareButton url={url} title={title}>
        <XIcon size={icon_size} round />
      </TwitterShareButton>
      <LinkedinShareButton url={url} title={title} source={source}>
        <LinkedinIcon size={icon_size} round />
      </LinkedinShareButton>
      <RedditShareButton url={url} title={title}>
        <RedditIcon size={icon_size} round />
      </RedditShareButton>
      <BlueskyShareButton url={url} title={title}>
        <BlueskyIcon size={icon_size} round />
      </BlueskyShareButton>
    </div>
  );
};

export default SocialShare;