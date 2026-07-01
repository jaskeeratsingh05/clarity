import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import './BookChatPage.css';

const AI_MODES = ['book', 'hybrid'];
const STYLES = ['beginner', 'student', 'exam', 'interview', 'technical', 'simple'];
const LANGUAGES = ['english', 'hindi'];

const CitationCard = ({ citation }) => {
  if (!citation) return null;
  return (
    <div className="citation-card">
      <p className="citation-title">📍 Found In</p>
      <div className="citation-grid">
        {citation.chapter && <div className="citation-item"><span className="citation-label">Chapter</span><span>{citation.chapter}</span></div>}
        <div className="citation-item"><span className="citation-label">Page</span><span>{citation.page}</span></div>
        <div className="citation-item"><span className="citation-label">Paragraph</span><span>{citation.paragraph}</span></div>
        <div className="citation-item"><span className="citation-label">Confidence</span><span className="citation-confidence">{citation.confidence}%</span></div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, onJumpToPage, onSave }) => {
  const isUser = message.role === 'user';
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const utter = new SpeechSynthesisUtterance(message.content);
    utter.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className={`message-wrap ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
        <p className="message-content">{message.content}</p>
        {!isUser && (
          <div className="message-actions">
            {message.citation && (
              <button className="btn btn-ghost btn-sm" onClick={() => onJumpToPage(message.citation.page)}>
                📖 Page {message.citation.page}
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={handleSpeak}>
              {speaking ? '⏹ Stop' : '▶ Listen'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => onSave(message)}>💾 Save</button>
          </div>
        )}
      </div>
      {!isUser && <CitationCard citation={message.citation} />}
    </div>
  );
};

const BookChatPage = () => {
  const { bookId } = useParams();
  const { get, post, token } = useApi();
  const [book, setBook] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [aiMode, setAiMode] = useState('book');
  const [style, setStyle] = useState('student');
  const [language, setLanguage] = useState('english');
  const [currentPage, setCurrentPage] = useState(1);
  const messagesEndRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    get(`/books/${bookId}`).then(d => d?.book && setBook(d.book));
    get(`/chat/${bookId}/conversations`).then(d => {
      if (d?.conversations?.length) {
        setConversations(d.conversations);
        setActiveConvId(d.conversations[0]._id);
      }
    });
  }, [bookId]);

  useEffect(() => {
    if (activeConvId) {
      get(`/chat/${bookId}/conversations/${activeConvId}`).then(d => d?.messages && setMessages(d.messages));
    }
  }, [activeConvId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamingText]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const q = input.trim();
    setInput('');
    setStreaming(true);
    setStreamingText('');
    setMessages(prev => [...prev, { role: 'user', content: q, _id: Date.now() }]);

    try {
      const res = await fetch(`${API_URL}/chat/${bookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: q, conversationId: activeConvId, aiMode, explanationStyle: style, language }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let finalData = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data:'));
        for (const line of lines) {
          const json = JSON.parse(line.replace('data: ', ''));
          if (json.chunk) { fullText += json.chunk; setStreamingText(fullText); }
          if (json.done) {
            finalData = json;
            if (!activeConvId && json.conversationId) {
              setActiveConvId(json.conversationId);
              get(`/chat/${bookId}/conversations`).then(d => d?.conversations && setConversations(d.conversations));
            }
          }
        }
      }

      setMessages(prev => [...prev, {
        role: 'assistant', content: fullText, _id: finalData?.messageId || Date.now(),
        citation: finalData?.citation,
      }]);
      setStreamingText('');
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}`, _id: Date.now() }]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center gap-3">
          <Link to="/library" className="btn btn-ghost btn-icon">←</Link>
          <div>
            <h1 className="chat-book-title">{book?.title || 'Loading...'}</h1>
            <p className="text-muted text-sm">{book?.pageCount} pages</p>
          </div>
        </div>
        <div className="chat-controls flex items-center gap-3">
          {/* AI Mode */}
          <div className="control-group">
            {AI_MODES.map(m => (
              <button key={m} id={`mode-${m}`} className={`btn btn-sm ${aiMode === m ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAiMode(m)}>
                {m === 'book' ? '📖 Book' : '🌐 Hybrid'}
              </button>
            ))}
          </div>
          {/* Style */}
          <select id="style-select" className="input" style={{ width: 'auto', padding: '6px 10px' }} value={style} onChange={e => setStyle(e.target.value)}>
            {STYLES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          {/* Language */}
          <select id="lang-select" className="input" style={{ width: 'auto', padding: '6px 10px' }} value={language} onChange={e => setLanguage(e.target.value)}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l === 'english' ? '🇬🇧 English' : '🇮🇳 Hindi'}</option>)}
          </select>
        </div>
      </div>

      <div className="chat-body">
        {/* Conversations Sidebar */}
        <div className="conv-sidebar">
          <button id="new-conversation-btn" className="btn btn-secondary w-full btn-sm" onClick={async () => {
            const d = await post(`/chat/${bookId}/conversations`, { title: 'New Conversation' });
            if (d?.conversation) { setConversations(p => [d.conversation, ...p]); setActiveConvId(d.conversation._id); setMessages([]); }
          }}>+ New Chat</button>
          <div className="conv-list">
            {conversations.map(c => (
              <button key={c._id} id={`conv-${c._id}`} className={`conv-item ${activeConvId === c._id ? 'active' : ''}`} onClick={() => setActiveConvId(c._id)}>
                <p className="conv-title">{c.title}</p>
                <p className="text-xs text-muted">{new Date(c.lastMessageAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-main">
          <div className="messages-area">
            {messages.length === 0 && !streaming && (
              <div className="chat-empty">
                <div style={{ fontSize: '3rem' }}>✦</div>
                <h3>Ask anything about <em>{book?.title}</em></h3>
                <p className="text-muted">I'll find the exact page and paragraph for every answer.</p>
              </div>
            )}
            {messages.map(msg => (
              <MessageBubble key={msg._id} message={msg}
                onJumpToPage={setCurrentPage}
                onSave={(m) => post('/notebook', { bookId, messageId: m._id, content: m.content, page: m.citation?.page, chapter: m.citation?.chapter })}
              />
            ))}
            {streaming && streamingText && (
              <div className="message-wrap assistant">
                <div className="message-bubble assistant">
                  <p className="message-content">{streamingText}<span className="cursor-blink">|</span></p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <div className="chat-input-wrap">
              <textarea
                id="question-input"
                className="chat-input"
                placeholder="Ask a question about this book..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                rows={2}
                disabled={streaming}
              />
              <button id="send-btn" className="btn btn-primary send-btn" onClick={sendMessage} disabled={streaming || !input.trim()}>
                {streaming ? '⏳' : '➤'}
              </button>
            </div>
            <p className="text-xs text-muted" style={{ marginTop: 8, textAlign: 'center' }}>
              Press Enter to send · Shift+Enter for new line · Mode: <strong>{aiMode}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookChatPage;
