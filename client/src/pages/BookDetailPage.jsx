import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

const BookDetailPage = () => {
  const { bookId } = useParams();
  const { get } = useApi();
  const [book, setBook] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    get(`/books/${bookId}`).then(d => d?.book && setBook(d.book));
    get(`/chat/${bookId}/conversations`).then(d => d?.conversations && setConversations(d.conversations));
  }, [bookId]);

  if (!book) return <div className="page-container"><div className="skeleton" style={{ height: 200, borderRadius: 16 }} /></div>;

  return (
    <div className="page-container animate-fade-in">
      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ width: 80, height: 100, background: 'linear-gradient(135deg, var(--color-accent), var(--color-teal))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 700, flexShrink: 0 }}>
            {book.title[0]}
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>{book.title}</h1>
            <p className="text-muted">{book.pageCount} pages · {book.fileType.toUpperCase()} · {(book.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            <p className="text-muted text-sm">Uploaded {new Date(book.createdAt).toLocaleDateString()}</p>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <span className={`badge badge-${book.status === 'ready' ? 'green' : 'orange'}`}>{book.status}</span>
              <span className="badge badge-accent">{book.totalChunks} chunks indexed</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {book.status === 'ready' && (
              <Link id="chat-book-btn" to={`/book/${bookId}/chat`} className="btn btn-primary">Start Learning →</Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Questions Asked', value: book.questionsAsked },
          { label: 'Conversations', value: conversations.length },
          { label: 'Total Chunks', value: book.totalChunks },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: 20 }}>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{s.value}</p>
            <p className="text-muted text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Conversations */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Conversations</h2>
        {conversations.length === 0 ? (
          <p className="text-muted">No conversations yet. <Link to={`/book/${bookId}/chat`} className="auth-link">Start chatting →</Link></p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {conversations.map(c => (
              <Link key={c._id} to={`/book/${bookId}/chat`} className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.title}</p>
                <p className="text-xs text-muted">{new Date(c.lastMessageAt).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
