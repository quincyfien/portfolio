import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, Layers, BookOpen, X, Download, ExternalLink, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import './Blog.css';

export default function Blog() {
  const { technicalDocs } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null);

  const posts = useMemo(() => {
    return (technicalDocs || [])
      .filter((d) => d.status === 'published')
      .map((doc) => ({
        id: doc.id,
        slug: doc.slug || doc.id,
        title: doc.title || 'Untitled Document',
        date: doc.date || '',
        category: doc.category || 'Cybersecurity',
        tags: Array.isArray(doc.tags) ? doc.tags : [],
        summary: doc.summary || '',
        readTime: doc.readTime || '5 min read',
        fileUrl: doc.fileUrl || '',
        fileName: doc.fileName || '',
        fileType: doc.fileType || '',
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [technicalDocs]);

  const categories = useMemo(() => {
    const cats = new Set(['All']);
    posts.forEach((p) => { if (p.category) cats.add(p.category); });
    return Array.from(cats);
  }, [posts]);

  const tags = useMemo(() => {
    const tSet = new Set();
    posts.forEach((p) => p.tags.forEach((t) => tSet.add(t)));
    return Array.from(tSet);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesTag = !selectedTag || post.tags.includes(selectedTag);
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [posts, searchQuery, selectedCategory, selectedTag]);

  return (
    <section id="blog" className="section" aria-labelledby="blog-title">
      <div className="section-header">
        <span className="section-subtitle">Documentation & Insights</span>
        <h2 id="blog-title" className="section-title">Technical Documents</h2>
      </div>

      <div className="blog-layout">
        <div className="blog-posts-stream">
          <div className="blog-search-bar" role="search">
            <input
              type="text"
              placeholder="Search technical documents, architecture specs, or post-mortems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blog-search-input"
              aria-label="Search documents"
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
            </div>
          ) : (
            <div className="blog-posts-list">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="blog-post-card glass-panel"
                  onClick={() => setActiveDoc(post)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="blog-post-meta">
                    <span style={{ color: 'var(--color-gold-dark)' }}>
                      <Layers size={12} />
                      {post.category}
                    </span>
                    {post.date && (
                      <span><Calendar size={12} />{post.date}</span>
                    )}
                    <span><Clock size={12} />{post.readTime}</span>
                  </div>

                  <h3 className="blog-post-title">{post.title}</h3>
                  <p className="blog-post-summary">{post.summary}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span className="btn-text" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={14} /> View Details
                    </span>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {post.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="project-tag" style={{ fontSize: '0.65rem' }}>#{t}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="blog-sidebar" role="complementary" aria-label="Document filters">
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
                    ({cat === 'All' ? posts.length : posts.filter((p) => p.category === cat).length})
                  </span>
                </li>
              ))}
            </ul>
          </section>

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

      {/* Document Detail Modal */}
      {activeDoc && (
        <div className="doc-modal-backdrop" onClick={() => setActiveDoc(null)} role="dialog" aria-modal="true" aria-labelledby="doc-modal-title">
          <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="doc-modal-close" onClick={() => setActiveDoc(null)} aria-label="Close document details">
              <X size={22} />
            </button>

            <div className="doc-modal-body">
              <div className="doc-modal-header">
                <div className="doc-modal-meta">
                  <span className="doc-modal-category">{activeDoc.category}</span>
                  {activeDoc.date && <span>{activeDoc.date}</span>}
                  <span>{activeDoc.readTime}</span>
                </div>
                <h3 id="doc-modal-title" className="doc-modal-title">{activeDoc.title}</h3>
              </div>

              <p className="doc-modal-summary">{activeDoc.summary}</p>

              {activeDoc.tags.length > 0 && (
                <div className="doc-modal-tags">
                  {activeDoc.tags.map((t, idx) => (
                    <span key={idx} className="project-tag">#{t}</span>
                  ))}
                </div>
              )}

              <div className="doc-modal-actions">
                {activeDoc.fileUrl ? (
                  <>
                    <a href={activeDoc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      <ExternalLink size={16} /> View Document
                    </a>
                    <a href={activeDoc.fileUrl} target="_blank" rel="noopener noreferrer" download className="btn btn-secondary">
                      <Download size={16} /> Download
                    </a>
                  </>
                ) : (
                  <p className="doc-modal-nofile">No file attached to this document yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="double-divider" role="presentation">
        <div className="double-divider-center"></div>
      </div>
    </section>
  );
}
