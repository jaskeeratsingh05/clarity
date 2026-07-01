import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';

const NotebookPage = () => {
  const { get, del } = useApi();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get('/notebook').then(d => d?.notes && setNotes(d.notes)).finally(() => setLoading(false));
  }, []);

  const deleteNote = async (id) => {
    await del(`/notebook/${id}`);
    setNotes(n => n.filter(x => x._id !== id));
  };

  return (
    <div className="page-container animate-fade-in">
      <h1 className="section-title">Notebook</h1>
      <p className="text-muted" style={{ marginBottom: 32 }}>Your saved AI answers, linked to source pages</p>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center' }}>
          <p style={{ fontSize: '2rem' }}>📓</p>
          <h3 style={{ marginTop: 12 }}>No saved notes yet</h3>
          <p className="text-muted">Save AI answers from the chat page to build your notebook</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notes.map(note => (
            <div key={note._id} className="card" style={{ borderLeft: `4px solid ${note.color || 'var(--color-accent)'}`, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {note.bookId?.title && <span className="badge badge-accent">{note.bookId.title}</span>}
                  {note.page && <span className="badge badge-green">Page {note.page}</span>}
                  {note.chapter && <span className="badge badge-orange">{note.chapter}</span>}
                </div>
                <button id={`delete-note-${note._id}`} className="btn btn-ghost btn-sm" onClick={() => deleteNote(note._id)}>🗑</button>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{note.content}</p>
              <p className="text-xs text-muted" style={{ marginTop: 8 }}>{new Date(note.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotebookPage;
