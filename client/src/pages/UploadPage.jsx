import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import './UploadPage.css';

const STAGES = [
  { key: 'uploading', label: 'Uploading Book', icon: '⬆️' },
  { key: 'extracting', label: 'Extracting Text', icon: '📄' },
  { key: 'chunking', label: 'Understanding Chapters', icon: '🧩' },
  { key: 'embedding', label: 'Building AI Search Index', icon: '🧠' },
  { key: 'ready', label: 'Ready!', icon: '✅' },
];

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0, message: '' });
  const [error, setError] = useState('');
  const { uploadFile } = useApi();
  const navigate = useNavigate();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  }, []);

  const validateAndSetFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) { setError('Only PDF and DOCX files are supported'); return; }
    if (f.size > 50 * 1024 * 1024) { setError('File size must be under 50 MB'); return; }
    setFile(f);
    setError('');
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setProgress({ stage: 'uploading', percent: 10, message: 'Uploading your book...' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name.replace(/\.[^/.]+$/, ''));

      const data = await uploadFile('/books/upload', formData);

      if (data?.book) {
        // Connect to Socket.io for real-time progress updates
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        const { io } = await import('socket.io-client');
        const socket = io(socketUrl);

        socket.on(`book:progress:${data.book._id}`, ({ stage, progress: pct, message }) => {
          setProgress({ stage, percent: pct, message });
          if (stage === 'ready') {
            socket.disconnect();
            setTimeout(() => navigate(`/book/${data.book._id}/chat`), 1500);
          }
          if (stage === 'error') {
            setError(message);
            setUploading(false);
            socket.disconnect();
          }
        });
      }
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  const currentStageIdx = STAGES.findIndex(s => s.key === progress.stage);

  return (
    <div className="page-container upload-page animate-fade-in">
      <h1 className="section-title">Upload a Book</h1>
      <p className="text-muted" style={{ marginBottom: 32 }}>Upload a PDF or DOCX and our AI will make it interactive</p>

      {!uploading ? (
        <>
          {/* Drop Zone */}
          <div
            id="drop-zone"
            className={`drop-zone card ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input id="file-input" type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={(e) => validateAndSetFile(e.target.files[0])} />
            {file ? (
              <div className="file-preview">
                <div className="file-icon">{file.name.endsWith('.pdf') ? '📕' : '📘'}</div>
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="text-muted text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="drop-zone-content">
                <div className="drop-icon">📁</div>
                <h3>Drop your book here</h3>
                <p className="text-muted">or click to browse — PDF or DOCX, up to 50 MB</p>
              </div>
            )}
          </div>

          {file && (
            <div className="upload-form card" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Book Title</label>
                <input id="book-title" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter book title" />
              </div>
            </div>
          )}

          {error && <div className="auth-error" style={{ marginTop: 16 }}>{error}</div>}

          {file && (
            <button id="start-upload-btn" className="btn btn-primary btn-lg" style={{ marginTop: 20 }} onClick={handleUpload}>
              🚀 Start Processing
            </button>
          )}
        </>
      ) : (
        /* Processing Pipeline Progress */
        <div className="processing-card card">
          <h2 style={{ marginBottom: 32 }}>Processing Your Book</h2>
          <div className="stages-list">
            {STAGES.map((stage, idx) => {
              const isActive = stage.key === progress.stage;
              const isDone = idx < currentStageIdx || progress.stage === 'ready';
              return (
                <div key={stage.key} className={`stage-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <div className="stage-icon-wrap">
                    <span>{isDone ? '✅' : isActive ? '⏳' : '○'}</span>
                  </div>
                  <div className="stage-info">
                    <p className="stage-label">{stage.label}</p>
                    {isActive && (
                      <>
                        <div className="progress-bar" style={{ marginTop: 8 }}>
                          <div className="progress-bar-fill" style={{ width: `${progress.percent}%` }} />
                        </div>
                        <p className="text-sm text-muted" style={{ marginTop: 6 }}>{progress.message}</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
