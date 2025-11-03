import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useHistory } from '@docusaurus/router';
import { loadAuthors, loadTags, type Author, type Tag } from '@site/src/utils/yamlLoader';
import JSZip from 'jszip';

export default function WritePage(): React.ReactElement {
  const history = useHistory();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    authors: [] as string[],
    tags: [] as string[],
    content: '',
    tocMinLevel: 2,
    tocMaxLevel: 5,
  });

  const [availableAuthors, setAvailableAuthors] = useState<Author[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<any>(null);
  const [showImageSuccessModal, setShowImageSuccessModal] = useState(false);
  const [imageSuccessDetails, setImageSuccessDetails] = useState<string>('');

  // Load authors and tags from YAML files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [authors, tags] = await Promise.all([loadAuthors(), loadTags()]);
        setAvailableAuthors(authors);
        setAvailableTags(tags);

        // Set default author if only one exists
        if (authors.length === 1) {
          setFormData(prev => ({ ...prev, authors: [authors[0].id] }));
        }
      } catch (error) {
        console.error('Failed to load authors/tags:', error);
      }
    };

    loadData();
  }, []);


  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAuthor = (authorId: string) => {
    if (!formData.authors.includes(authorId)) {
      setFormData(prev => ({
        ...prev,
        authors: [...prev.authors, authorId]
      }));
    }
  };

  const removeAuthor = (authorId: string) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.filter(id => id !== authorId)
    }));
  };

  const addTag = (tagId: string) => {
    if (!formData.tags.includes(tagId)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagId] }));
    }
  };

  const removeTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(id => id !== tagId)
    }));
  };

  const toKebabCase = (str: string): string => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  };

  const generateMarkdownContent = () => {
    const slug = toKebabCase(formData.title);
    const authorList = formData.authors.length > 0 ? `[${formData.authors.join(', ')}]` : '[raceychan]';
    const tagList = formData.tags.length > 0 ? `[${formData.tags.join(', ')}]` : '[]';

    return `---
slug: ${slug}
title: ${formData.title}
authors: ${authorList}
tags: ${tagList}
toc_min_heading_level: ${formData.tocMinLevel}
toc_max_heading_level: ${formData.tocMaxLevel}
---

${formData.content}
`;
  };

  const addImage = async () => {
    if (!imageUrl.trim()) return;

    try {
      // Extract filename from URL or generate one
      const urlParts = imageUrl.split('/');
      const originalName = urlParts[urlParts.length - 1];
      const extension = originalName.includes('.') ? originalName.split('.').pop() : 'jpg';
      const imageName = originalName.includes('.') ? originalName : `image-${images.length + 1}.${extension}`;

      setImages(prev => [...prev, imageName]);
      setImageUrl('');
      setShowImageModal(false);

      // Add image to content
      const imageMarkdown = `\n\n![${imageName}](${imageUrl})\n\n`;
      setFormData(prev => ({
        ...prev,
        content: prev.content + imageMarkdown
      }));

      // Show success modal instead of alert
      setImageSuccessDetails(imageName);
      setShowImageSuccessModal(true);
    } catch (error) {
      alert('Failed to process image. Please check the URL.');
    }
  };

  const getBlogPostDetails = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0] + 'T' + now.toISOString().split('T')[1].substring(0, 5);
    const slug = toKebabCase(formData.title);
    const dirName = `${dateStr}-${slug}`;
    const filename = `content.md`;
    const fullPath = `blog/${dirName}/${filename}`;

    return {
      title: formData.title,
      description: formData.description || 'No description',
      authors: formData.authors.map(id => availableAuthors.find(a => a.id === id)?.name || id),
      tags: formData.tags.map(id => availableTags.find(t => t.id === id)?.label || id),
      tocMinLevel: formData.tocMinLevel,
      tocMaxLevel: formData.tocMaxLevel,
      dirName,
      filename,
      fullPath,
      images,
      hasContent: !!formData.content.trim()
    };
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  const renderPreviewModal = () => {
    if (!showPreviewModal) return null;

    const details = getBlogPostDetails();

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowPreviewModal(false);
          }
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '700px',
            border: '2px solid #e0e0e0',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ color: '#000000', marginBottom: '1.5rem' }}>Blog Post Preview</h3>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Title:</strong> {details.title}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Description:</strong> {details.description}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Authors:</strong> {details.authors.length > 0 ? details.authors.join(', ') : 'raceychan (default)'}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Tags:</strong> {details.tags.length > 0 ? details.tags.join(', ') : 'None'}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>TOC Levels:</strong> H{details.tocMinLevel} to H{details.tocMaxLevel}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Content:</strong> {details.hasContent ? 'Yes' : 'No content provided'}
          </div>

          {details.images.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Images:</strong>
              <ul>
                {details.images.map((img, index) => (
                  <li key={index}>{img}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <strong>File Path:</strong> <code>{details.fullPath}</code>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Directory to Create:</strong> <code>blog/{details.dirName}/</code>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            border: '1px solid #bbdefb'
          }}>
            <small style={{ color: '#000000' }}>
              <strong>📁 Folder Download:</strong><br />
              A zip file containing the blog post folder structure will be downloaded.
            </small>
          </div>

          <div>
            <button
              className="button button--success margin-right--sm"
              onClick={confirmCreate}
              style={{ marginRight: '1rem' }}
            >
              📁 Create & Download Folder
            </button>
            <button
              className="button button--secondary"
              onClick={() => setShowPreviewModal(false)}
            >
              Back to Edit
            </button>
          </div>
        </div>
      </div>
    );
  };

  const downloadBlogPostFolder = async (details: any, content: string) => {
    const zip = new JSZip();
    const folderName = details.dirName;

    // Create the main folder
    const folder = zip.folder(folderName);

    // Add content.md file
    folder?.file('content.md', content);


    // Generate and download the zip
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);
    const zipLink = document.createElement('a');
    zipLink.href = zipUrl;
    zipLink.download = `${folderName}.zip`;
    document.body.appendChild(zipLink);
    zipLink.click();
    document.body.removeChild(zipLink);
    URL.revokeObjectURL(zipUrl);

    return {
      folderName,
      filesCreated: ['content.md']
    };
  };

  const confirmCreate = async () => {
    const content = generateMarkdownContent();
    const details = getBlogPostDetails();

    setShowPreviewModal(false);

    try {
      // Download the blog post folder structure
      const result = await downloadBlogPostFolder(details, content);

      // Show success modal instead of alert
      setSuccessDetails({
        ...details,
        ...result
      });
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Failed to download blog post:', error);
      // You could create an error modal here too, but for now just throw
      throw new Error('Failed to download blog post files. Please try again.');
    }
  };

  const renderImageSuccessModal = () => {
    if (!showImageSuccessModal || !imageSuccessDetails) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowImageSuccessModal(false);
          }
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            border: '2px solid #25c2a0',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ color: '#25c2a0', marginBottom: '1.5rem' }}>✅ Image Added Successfully!</h3>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Image Name:</strong> <code>{imageSuccessDetails}</code>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: '#e8f5e8',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            border: '1px solid #25c2a0'
          }}>
            <small style={{ color: '#000000' }}>
              <strong>📷 Next Steps:</strong><br />
              1. The image markdown has been added to your post content<br />
              2. When you create the blog post, place <code>{imageSuccessDetails}</code> in the blog post folder<br />
              3. The image will be referenced as: <code>![{imageSuccessDetails}]({imageSuccessDetails})</code>
            </small>
          </div>

          <div>
            <button
              className="button button--primary button--lg"
              onClick={() => setShowImageSuccessModal(false)}
            >
              Continue Writing
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSuccessModal = () => {
    if (!showSuccessModal || !successDetails) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowSuccessModal(false);
          }
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '700px',
            border: '2px solid #4caf50',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ color: '#4caf50', marginBottom: '1.5rem' }}>✅ Blog Post Created Successfully!</h3>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Downloaded:</strong> <code>{successDetails.folderName}.zip</code>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Folder Name:</strong> <code>{successDetails.folderName}</code>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Files Created:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              {successDetails.filesCreated.map((file: string, index: number) => (
                <li key={index}><code>{file}</code></li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Blog Post Details:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li><strong>Title:</strong> {successDetails.title}</li>
              <li><strong>Authors:</strong> {successDetails.authors.join(', ') || 'raceychan (default)'}</li>
              <li><strong>Tags:</strong> {successDetails.tags.join(', ') || 'None'}</li>
              <li><strong>TOC Levels:</strong> H{successDetails.tocMinLevel} to H{successDetails.tocMaxLevel}</li>
            </ul>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: '#e8f5e8',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            border: '1px solid #4caf50'
          }}>
            <small style={{ color: '#000000' }}>
              <strong>📂 Next Steps:</strong><br />
              1. Extract the downloaded zip file<br />
              2. Move the <code>{successDetails.folderName}/</code> folder to your <code>blog/</code> directory<br />
              3. Replace any image placeholder files with actual images<br />
              4. Your blog post will be available at: <code>blog/{successDetails.folderName}/</code>
            </small>
          </div>

          <div>
            <button
              className="button button--primary button--lg margin-right--sm"
              onClick={() => {
                setShowSuccessModal(false);
                // Reset form or redirect as needed
                setFormData({
                  title: '',
                  description: '',
                  authors: [],
                  tags: [],
                  content: '',
                  tocMinLevel: 2,
                  tocMaxLevel: 5,
                });
                setImages([]);
              }}
              style={{ marginRight: '1rem' }}
            >
              Create Another Post
            </button>
            <button
              className="button button--secondary button--lg"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <Layout
      title="Write New Blog Post"
      description="Create a new blog post">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <h1> New Blog Post</h1>

            <div className="margin-bottom--lg">
              <label className="margin-bottom--sm" style={{ display: 'block', fontWeight: 'bold' }}>
                Title *
              </label>
              <input
                type="text"
                className="form-control"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter your blog post title"
              />
            </div>

            <div className="margin-bottom--lg">
              <label className="margin-bottom--sm" style={{ display: 'block', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                className="form-control"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  minHeight: '80px'
                }}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of your post"
              />
            </div>

            <div className="margin-bottom--lg">
              <label className="margin-bottom--sm" style={{ display: 'block', fontWeight: 'bold' }}>
                Authors
              </label>
              <div style={{ marginBottom: '0.5rem' }}>
                {formData.authors.map(authorId => {
                  const author = availableAuthors.find(a => a.id === authorId);
                  return author ? (
                    <span
                      key={authorId}
                      className="badge badge--primary"
                      style={{ marginRight: '0.5rem', cursor: availableAuthors.length > 1 ? 'pointer' : 'default' }}
                      onClick={availableAuthors.length > 1 ? () => removeAuthor(authorId) : undefined}
                    >
                      {author.name} {availableAuthors.length > 1 ? '×' : ''}
                    </span>
                  ) : null;
                })}
              </div>
              {availableAuthors.length > 1 && (
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addAuthor(e.target.value);
                    }
                  }}
                >
                  <option value="">Select an author...</option>
                  {availableAuthors
                    .filter(author => !formData.authors.includes(author.id))
                    .map(author => (
                      <option key={author.id} value={author.id}>
                        {author.name} - {author.title}
                      </option>
                    ))}
                </select>
              )}
            </div>

            <div className="margin-bottom--lg">
              <label className="margin-bottom--sm" style={{ display: 'block', fontWeight: 'bold' }}>
                Tags
              </label>
              <div style={{ marginBottom: '0.5rem' }}>
                {formData.tags.map(tagId => {
                  const tag = availableTags.find(t => t.id === tagId);
                  return tag ? (
                    <span
                      key={tagId}
                      className="badge badge--secondary"
                      style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                      onClick={() => removeTag(tagId)}
                    >
                      {tag.label} ×
                    </span>
                  ) : null;
                })}
              </div>
              {availableTags.length > 1 ? (
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addTag(e.target.value);
                    }
                  }}
                >
                  <option value="">Select a tag...</option>
                  {availableTags
                    .filter(tag => !formData.tags.includes(tag.id))
                    .map(tag => (
                      <option key={tag.id} value={tag.id}>
                        {tag.label} - {tag.description}
                      </option>
                    ))}
                </select>
              ) : availableTags.length === 1 && !formData.tags.includes(availableTags[0].id) ? (
                <button
                  type="button"
                  className="button button--outline button--secondary"
                  onClick={() => addTag(availableTags[0].id)}
                >
                  Add "{availableTags[0].label}" tag
                </button>
              ) : null}
            </div>

            <div className="row margin-bottom--lg">
              <div className="col col--6">
                <label className="margin-bottom--sm" style={{ display: 'block', fontWeight: 'bold' }}>
                  TOC Min Heading Level
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  value={formData.tocMinLevel}
                  onChange={(e) => handleInputChange('tocMinLevel', parseInt(e.target.value))}
                >
                  <option value={1}>H1</option>
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                  <option value={4}>H4</option>
                  <option value={5}>H5</option>
                  <option value={6}>H6</option>
                </select>
              </div>
              <div className="col col--6">
                <label className="margin-bottom--sm" style={{ display: 'block', fontWeight: 'bold' }}>
                  TOC Max Heading Level
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  value={formData.tocMaxLevel}
                  onChange={(e) => handleInputChange('tocMaxLevel', parseInt(e.target.value))}
                >
                  <option value={1}>H1</option>
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                  <option value={4}>H4</option>
                  <option value={5}>H5</option>
                  <option value={6}>H6</option>
                </select>
              </div>
            </div>

            <div className="margin-bottom--lg">
              <label className="margin-bottom--sm" style={{ display: 'block', fontWeight: 'bold' }}>
                Content
              </label>
              <div style={{ marginBottom: '1rem' }}>
                <button
                  type="button"
                  className="button button--primary button--lg"
                  onClick={() => setShowImageModal(true)}
                  style={{
                    backgroundColor: '#25c2a0',
                    borderColor: '#25c2a0',
                    fontWeight: 'bold',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1.1rem'
                  }}
                >
                  📷 Add Image to Post
                </button>
              </div>

              {/* Show added images */}
              {images.length > 0 && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px'
                }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#25c2a0' }}>
                    📷 Images Added ({images.length}):
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {images.map((image, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: '#25c2a0',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace'
                        }}
                      >
                        {image}
                      </span>
                    ))}
                  </div>
                  <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
                    These images will be included in your blog post folder when created.
                  </small>
                </div>
              )}

              <textarea
                className="form-control"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  minHeight: '300px',
                  fontFamily: 'monospace'
                }}
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your blog post content here using Markdown..."
              />
            </div>

            <div className="margin-bottom--lg">
              <button
                className="button button--primary button--lg margin-right--md"
                onClick={handlePreview}
                disabled={!formData.title}
              >
                Create Blog Post
              </button>
              <button
                className="button button--secondary button--lg"
                onClick={() => history.goBack()}
              >
                Cancel
              </button>
            </div>

            <div className="alert alert--info">
              <strong>Preview:</strong> The blog post will be saved as a Markdown file that you can move to your <code>blog/</code> directory.
            </div>

            {/* Image Modal */}
            {showImageModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10000,
                  backdropFilter: 'blur(4px)',
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowImageModal(false);
                    setImageUrl('');
                  }
                }}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    padding: '2rem',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '500px',
                    border: '2px solid #e0e0e0',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    position: 'relative',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ color: '#000000', marginBottom: '1.5rem' }}>Add Image to Post</h3>
                  <div className="margin-bottom--md">
                    <label className="margin-bottom--sm" style={{ display: 'block', fontWeight: 'bold', color: '#000000' }}>
                      Image URL
                    </label>
                    <input
                      type="url"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        color: '#000000',
                        backgroundColor: '#ffffff'
                      }}
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <button
                      className="button button--primary margin-right--sm"
                      onClick={addImage}
                      disabled={!imageUrl.trim()}
                      style={{ marginRight: '1rem' }}
                    >
                      Add Image
                    </button>
                    <button
                      className="button button--secondary"
                      onClick={() => {
                        setShowImageModal(false);
                        setImageUrl('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Modal */}
            {renderPreviewModal()}

            {/* Image Success Modal */}
            {renderImageSuccessModal()}

            {/* Success Modal */}
            {renderSuccessModal()}
          </div>
        </div>
      </div>
    </Layout>
  );
}