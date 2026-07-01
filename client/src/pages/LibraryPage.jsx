import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

const LibraryPage = () => {
  const { get, del } = useApi();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get('/books').then(d => d?.books && setBooks(d.books)).finally(() => setLoading(false));
  }, []);

  const filtered = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id) => {
    if (!confirm('Delete this book and all its conversations?')) return;
    await del(`/books/${id}`);
    setBooks(b => b.filter(x => x._id !== id));
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <h1 className="section-title" style={{ margin: 0 }}>My Library</h1>
        <Link to="/upload" className="btn btn-primary">⬆ Upload Book</Link>
      </div>

      <input id="library-search" className="input" placeholder="🔍 Search books..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400, marginBottom: 24 }} />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center' }}>
          <p style={{ fontSize: '2rem' }}>📚</p>
          <h3 style={{ marginTop: 12 }}>No books found</h3>
          <p className="text-muted">Upload your first book to get started</p>
          <Link to="/upload" className="btn btn-primary" style={{ marginTop: 16 }}>Upload Book</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(book => (
            <div key={book._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 60, background: 'linear-gradient(135deg, var(--color-accent), var(--color-teal))', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: 'white', fontWeight: 700 }}>
                  {book.title[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</h3>
                  <p className="text-muted text-sm">{book.pageCount} pages · {book.fileType.toUpperCase()}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge badge-${book.status === 'ready' ? 'green' : book.status === 'error' ? 'red' : 'orange'}`}>{book.status}</span>
                <div style={{ flex: 1 }} />
                {book.status === 'ready' && (
                  <Link id={`chat-${book._id}`} to={`/book/${book._id}/chat`} className="btn btn-primary btn-sm">Chat →</Link>
                )}
                <Link id={`detail-${book._id}`} to={`/book/${book._id}`} className="btn btn-secondary btn-sm">Info</Link>
                <button id={`delete-${book._id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(book._id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
