import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, ChevronLeft, BookOpen, Layers, Edit } from 'lucide-react';
import { renderMarkdownToJSX } from '../utils/markdown';
import { useData } from '../context/DataContext';
import './Blog.css';

export default function Blog() {
  const { technicalDocs, openAdminModal } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState(null);
  const [activePostSlug, setActivePostSlug] = useState(null);

  // Normalize posts from technicalDocs
  const posts = useMemo(() => {
    return (technicalDocs || [])
      .filter((d) => d.status === 'published')
      .map((doc) => ({
        slug: doc.slug || doc.id,
        metadata: {
          title: doc.title || 'Untitled Document',
          date: doc.date || '2026-07-10',
          category: doc.category || 'Cybersecurity',
          tags: Array.isArray(doc.tags) ? doc.tags : [],
          summary: doc.summary || 'Click to read full article...',
          readTime: doc.readTime || '5 min read',
        },
        content: doc.content || '',
      }))
      .sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date));
  }, [technicalDocs]);

  // Extract dynamic categories and tags from actual posts
  const categories = useMemo(() => {
    const cats = new Set(['All']);
    posts.forEach((p) => {
      if (p.metadata.category) cats.add(p.metadata.category);
    });
    return Array.from(cats);
  }, [posts]);

  const tags = useMemo(() => {
    const tSet = new Set();
    posts.forEach((p) => {
      p.metadata.tags.forEach((t) => tSet.add(t));
    });
    return Array.from(tSet);
  }, [posts]);

  // Filter posts based on search, category, and tag
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.metadata.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || post.metadata.category === selectedCategory;

      const matchesTag = !selectedTag || post.metadata.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [posts, searchQuery, selectedCategory, selectedTag]);

  // Find currently opened post
  const activePost = useMemo(() => {
    return posts.find((post) => post.slug === activePostSlug);
  }, [posts, activePostSlug]);

  const handlePostClick = (slug) => {
    setActivePostSlug(slug);
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
            aria-label="Return to technical archives"
          >
            <ChevronLeft size={16} />
            Back to Technical Documents
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

            <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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
              </div>

              <button
                onClick={openAdminModal}
                className="btn-text"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--color-gold)' }}
              >
                <Edit size={14} /> Edit in Admin Studio
              </button>
            </footer>
          </article>
        </div>

        <div className="double-divider" role="presentation">
          <div className="double-divider-center"></div>
        </div>
      </section>
    );
  }

  // Render Blog / Technical Documents Catalog Index
  return (
    <section id="blog" className="section" aria-labelledby="blog-title">
      <div className="section-header">
        <span className="section-subtitle">Documentation & Insights</span>
        <h2 id="blog-title" className="section-title">Technical Documents</h2>
      </div>

      <div className="blog-layout">
        {/* Main Posts Stream */}
        <div className="blog-posts-stream">
          <div className="blog-search-bar" role="search">
            <input
              type="text"
              placeholder="Search technical documents, architecture specs, or code snippets..."
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
              <h3 style={{ fontFamily: 'var(--font-serif-display)', color: 'var(--text-primary)' }}>No technical documents found</h3>
              <p>Try resetting search or category filters.</p>
              <button
                onClick={openAdminModal}
                className="btn btn-secondary"
                style={{ marginTop: '1rem', cursor: 'pointer' }}
              >
                <Edit size={16} /> Write Document in Admin
              </button>
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
                      Read Technical Document →
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
        <aside className="blog-sidebar" role="complementary" aria-label="Document filters">
          {/* Write Doc Action Card */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontFamily: 'var(--font-serif-display)', color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              Author Portal
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Create or edit technical documents, specs, and post-mortems via the Admin Studio.
            </p>
            <button
              onClick={openAdminModal}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem 0.75rem', justifyContent: 'center' }}
            >
              <Edit size={14} /> Open Admin Studio
            </button>
          </div>

          {/* Categories Widget */}
          <section className="sidebar-widget">
            <h3 className="widget-title">Categories</h3>
            <ul className="widget-list">
              {categories.map((cat) => (
                <li
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`widget-list-item ${selectedCategory === cat ? 'active' : ''}`}
                >
                  <span>{cat}</span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    ({cat === 'All' ? posts.length : posts.filter((p) => p.metadata.category === cat).length})
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
              {tags.map((tag) => (
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
