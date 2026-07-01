import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import './Dashboard.css';

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card card">
    <div className="stat-icon" style={{ background: color }}>{icon}</div>
    <div>
      <p className="stat-value">{value}</p>
      <p className="stat-label text-muted text-sm">{label}</p>
    </div>
  </div>
);

const BookCard = ({ book }) => (
  <Link to={`/book/${book._id}/chat`} className="book-card card">
    <div className="book-card-cover">
      <span>{book.title[0]?.toUpperCase()}</span>
    </div>
    <div className="book-card-info">
      <h3 className="book-card-title">{book.title}</h3>
      <p className="text-muted text-sm">{book.pageCount} pages</p>
      <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
        <span className={`badge badge-${book.status === 'ready' ? 'green' : book.status === 'error' ? 'red' : 'orange'}`}>
          {book.status}
        </span>
      </div>
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { get } = useApi();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get('/books').then((data) => { if (data?.books) setBooks(data.books); }).finally(() => setLoading(false));
  }, []);

  const readyBooks = books.filter(b => b.status === 'ready').length;
  const totalQuestions = books.reduce((a, b) => a + (b.questionsAsked || 0), 0);

  return (
    <div className="page-container dashboard-page animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">Good morning, {user?.name?.split(' ')[0]} ✦</h1>
          <p className="text-muted">Ready to learn something new today?</p>
        </div>
        <Link to="/upload" id="upload-book-btn" className="btn btn-primary">
          ⬆ Upload Book
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="📚" label="Books Uploaded" value={books.length} color="rgba(124, 109, 250, 0.2)" />
        <StatCard icon="✅" label="Books Ready" value={readyBooks} color="rgba(52, 211, 153, 0.2)" />
        <StatCard icon="❓" label="Questions Asked" value={totalQuestions} color="rgba(34, 211, 238, 0.2)" />
        <StatCard icon="💎" label="Current Plan" value={user?.plan || 'Free'} color="rgba(244, 114, 182, 0.2)" />
      </div>

      {/* Recent Books */}
      <section className="dashboard-section">
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Your Books</h2>
          <Link to="/library" className="btn btn-ghost btn-sm">View All →</Link>
        </div>

        {loading ? (
          <div className="books-grid">
            {[1,2,3].map(i => <div key={i} className="book-card skeleton" style={{ height: 120 }} />)}
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">📖</div>
            <h3>No books yet</h3>
            <p className="text-muted">Upload your first book and start learning with AI</p>
            <Link to="/upload" className="btn btn-primary" style={{ marginTop: 16 }}>Upload a Book</Link>
          </div>
        ) : (
          <div className="books-grid">
            {books.slice(0, 6).map((book) => <BookCard key={book._id} book={book} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
