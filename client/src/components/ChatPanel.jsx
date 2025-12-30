import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const ChatPanel = ({ onDataUpdate }) => {
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Hello! Ask me about specific sectors, trends, or global policies." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const API_BASE = rawBase.replace(/\/+$/, '');
            const res = await axios.post(`${API_BASE}/api/chat`, { message: userMsg });

            let botText = res.data.answer;
            let source = res.data.source;

            let jsonString = null;

            const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
            const codeMatch = botText.match(codeBlockRegex);

            if (codeMatch) {
                jsonString = codeMatch[1];
                botText = botText.replace(codeMatch[0], '').trim();
            } else {
                const rawJsonRegex = /\{[\s\S]*"chart_type"[\s\S]*\}/;
                const rawMatch = botText.match(rawJsonRegex);
                if (rawMatch) {
                    jsonString = rawMatch[0];
                    botText = botText.replace(rawMatch[0], '').trim();
                }
            }

            if (jsonString) {
                try {
                    const parsed = JSON.parse(jsonString);
                    if ((parsed.chart_data || parsed.data) && onDataUpdate) {
                        onDataUpdate(parsed.chart_data ? parsed : parsed.chart_data);
                    }

                    if (parsed.response_text) {
                        botText = parsed.response_text + "\n\n" + botText;
                    }
                } catch (e) {
                    console.warn("Failed to parse extracted JSON:", e);
                }
            }

            botText = botText.replace(/\n\s*\n/g, '\n\n').trim();

            setMessages(prev => [...prev, {
                role: 'bot',
                text: botText,
                source: source
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to the Knowledge Base right now." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-panel">
            <div className="chat-header">
                <div style={{ padding: '0.5rem', background: 'var(--accent-primary)', borderRadius: '8px', color: '#fff' }}>
                    <Bot size={20} />
                </div>
            </div>

            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        {msg.role === 'bot' && msg.source && (
                            <div style={{
                                fontSize: '0.7rem',
                                marginBottom: '0.5rem',
                                opacity: 0.7,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <Sparkles size={12} /> {msg.source}
                            </div>
                        )}
                        <div style={{ whiteSpace: 'normal', fontSize: '0.9rem', overflowWrap: 'break-word' }}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({ node, ...props }) => <p style={{ margin: '0 0 0.8rem 0', lineHeight: '1.5' }} {...props} />,
                                    ul: ({ node, ...props }) => <ul style={{ margin: '0.5rem 0 1rem 0', paddingLeft: '1.2rem' }} {...props} />,
                                    ol: ({ node, ...props }) => <ol style={{ margin: '0.5rem 0 1rem 0', paddingLeft: '1.2rem' }} {...props} />,
                                    li: ({ node, ...props }) => <li style={{ marginBottom: '0.3rem' }} {...props} />,
                                    a: ({ node, ...props }) => <a style={{ color: '#60a5fa', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer" {...props} />,
                                    h1: ({ node, ...props }) => <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', color: '#fff', fontWeight: 600 }} {...props} />,
                                    h2: ({ node, ...props }) => <h4 style={{ fontSize: '1.1rem', marginTop: '0.8rem', color: '#e2e8f0', fontWeight: 600 }} {...props} />,
                                    h3: ({ node, ...props }) => <strong style={{ display: 'block', marginTop: '0.8rem', color: '#f1f5f9' }} {...props} />,
                                    strong: ({ node, ...props }) => <span style={{ fontWeight: '700', color: msg.role === 'bot' ? '#34d399' : 'inherit' }} {...props} />,
                                    table: ({ node, ...props }) => <div style={{ overflowX: 'auto', marginBottom: '1rem' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} {...props} /></div>,
                                    thead: ({ node, ...props }) => <thead style={{ background: 'rgba(255,255,255,0.05)' }} {...props} />,
                                    th: ({ node, ...props }) => <th style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '8px', textAlign: 'left', fontWeight: 600 }} {...props} />,
                                    td: ({ node, ...props }) => <td style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '8px' }} {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote style={{ borderLeft: '3px solid #334155', paddingLeft: '1rem', margin: '1rem 0', color: '#94a3b8' }} {...props} />
                                }}
                            >
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message bot">
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <div className="input-wrapper">
                    <input
                        className="chat-input"
                        placeholder="Ask about emissions..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
