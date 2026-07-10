import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, ChevronLeft, BookOpen, Layers } from 'lucide-react';
import { parseMarkdown, renderMarkdownToJSX } from '../utils/markdown';
import { blogConfig } from '../data/blogMetadata';
import './Blog.css';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState(null);
  const [activePostSlug, setActivePostSlug] = useState(null);

  // Load all markdown files dynamically from src/content/blog/
  const posts = useMemo(() => {
    try {
      const globbed = import.meta.glob('/src/content/blog/*.md', { query: '?raw', eager: true });
      return Object.entries(globbed).map(([path, fileModule]) => {
        const slug = path.split('/').pop().replace('.md', '');
        
        // Handle Vite raw import format
        const rawContent = typeof fileModule === 'string' 
          ? fileModule 
          : (fileModule.default || '');
          
        const { metadata, content } = parseMarkdown(rawContent);
        
        return {
          slug,
          metadata: {
            title: metadata.title || slug.replace(/-/g, ' '),
            date: metadata.date || '2026-07-10',
            category: metadata.category || 'Uncategorized',
            tags: Array.isArray(metadata.tags) ? metadata.tags : [],
            summary: metadata.summary || 'Click to read full article...',
            readTime: metadata.readTime || '3 min read',
            ...metadata
          },
          content
        };
      }).sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date));
    } catch (e) {
      console.error("Error loading blog posts via import.meta.glob", e);
      return [];
    }
  }, []);

  // Filter posts based on search, category, and tag
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = 
        post.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.metadata.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = 
        selectedCategory === 'All' || 
        post.metadata.category === selectedCategory;
        
      const matchesTag = 
        !selectedTag || 
        post.metadata.tags.includes(selectedTag);
        
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [posts, searchQuery, selectedCategory, selectedTag]);

  // Find currently opened post
  const activePost = useMemo(() => {
    return posts.find(post => post.slug === activePostSlug);
  }, [posts, activePostSlug]);

  const handlePostClick = (slug) => {
    setActivePostSlug(slug);
    // Smooth scroll to top of blog section
    const blogSection = document.getElementById('blog');
    if (blogSection) {
      blogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBackToBlog = () => {
    setActivePostSlug(null);
    const blogSection = document.getElementById('blog');
    if (blogSection) {
      blogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Render Full Post View
  if (activePost) {
    return (
      <section id="blog" className="section" aria-label="Blog Article Reader">
        <div className="article-reader-container">
          <button 
            onClick={handleBackToBlog}
            className="back-to-blog-btn"
            aria-label="Return to blog archives"
          >
            <ChevronLeft size={16} />
            Back to Archives
          </button>

          <article className="glass-panel" style={{ padding: '3rem', border: '1px solid var(--border-color)' }}>
            <header className="article-header">
              <span className="section-subtitle">{activePost.metadata.category}</span>
              <h1 className="article-title">{activePost.metadata.title}</h1>
              
              <div className="article-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={14} />
                  {activePost.metadata.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={14} />
                  {activePost.metadata.readTime}
                </span>
              </div>
            </header>

            <div className="article-body">
              {renderMarkdownToJSX(activePost.content)}
            </div>

            <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {activePost.metadata.tags.map((t, idx) => (
                <span 
                  key={idx} 
                  onClick={() => { setSelectedTag(t); handleBackToBlog(); }}
                  className="tag-cloud-item"
                  title={`View posts tagged with ${t}`}
                >
                  #{t}
                </span>
              ))}
            </footer>
          </article>
        </div>

        <div className="double-divider" role="presentation">
          <div className="double-divider-center"></div>
        </div>
      </section>
    );
  }

  // Render Blog Catalog Index
  return (
    <section id="blog" className="section" aria-labelledby="blog-title">
      <div className="section-header">
        <span className="section-subtitle">Insights</span>
        <h2 id="blog-title" className="section-title">Technical Blog</h2>
      </div>

      <div className="blog-layout">
        {/* Main Posts Stream */}
        <div className="blog-posts-stream">
          <div className="blog-search-bar" role="search">
            <input 
              type="text" 
              placeholder="Search posts or code segments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blog-search-input"
              aria-label="Search posts"
            />
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={18} />
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <BookOpen size={48} style={{ color: 'var(--color-gold-dark)', marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: 'var(--font-serif-display)', color: 'var(--text-primary)' }}>No articles found</h3>
              <p>Try resetting filters or modifying search keywords.</p>
            </div>
          ) : (
            <div className="blog-posts-list">
              {filteredPosts.map((post) => (
                <article key={post.slug} className="blog-post-card glass-panel">
                  <div className="blog-post-meta">
                    <span style={{ color: 'var(--color-gold-dark)' }}>
                      <Layers size={12} />
                      {post.metadata.category}
                    </span>
                    <span>
                      <Calendar size={12} />
                      {post.metadata.date}
                    </span>
                    <span>
                      <Clock size={12} />
                      {post.metadata.readTime}
                    </span>
                  </div>

                  <h3 
                    onClick={() => handlePostClick(post.slug)} 
                    className="blog-post-title"
                  >
                    {post.metadata.title}
                  </h3>

                  <p className="blog-post-summary">{post.metadata.summary}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <button 
                      onClick={() => handlePostClick(post.slug)}
                      className="btn-text"
                      style={{ cursor: 'pointer' }}
                      aria-label={`Read full post: ${post.metadata.title}`}
                    >
                      Read Article →
                    </button>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {post.metadata.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="project-tag" style={{ fontSize: '0.65rem' }}>#{t}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar widgets */}
        <aside className="blog-sidebar" role="complementary" aria-label="Blog filters">
          {/* Categories Widget */}
          <section className="sidebar-widget">
            <h3 className="widget-title">Categories</h3>
            <ul className="widget-list">
              {blogConfig.categories.map((cat) => (
                <li 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`widget-list-item ${selectedCategory === cat ? 'active' : ''}`}
                >
                  <span>{cat}</span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    ({cat === 'All' ? posts.length : posts.filter(p => p.metadata.category === cat).length})
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Tags Widget */}
          <section className="sidebar-widget">
            <h3 className="widget-title">Tags</h3>
            <div className="tag-cloud">
              <span 
                onClick={() => setSelectedTag(null)}
                className={`tag-cloud-item ${!selectedTag ? 'active' : ''}`}
              >
                #ClearFilter
              </span>
              {blogConfig.tags.map((tag) => (
                <span 
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`tag-cloud-item ${selectedTag === tag ? 'active' : ''}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="double-divider" role="presentation">
        <div className="double-divider-center"></div>
      </div>
    </section>
  );
}
