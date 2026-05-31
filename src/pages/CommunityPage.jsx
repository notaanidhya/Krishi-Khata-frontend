/**
 * CommunityPage — "The Chaupal Noticeboard" Krishi redesign.
 *
 * - chaupal-bg: warm off-white with faint agricultural pattern
 * - No WhatsApp bubbles — each message is a clean shadow-sm card (Twitter-style)
 * - Region/crop tag highlighted next to sender name
 * - Input bar: warm Krishi style
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Paperclip, X, Loader2, Users, Wifi, WifiOff } from 'lucide-react';
import { getChatHistory, uploadChatImage } from '../api/chat';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8001'
    : 'https://krishi-khata.onrender.com'
);
const BACKEND_BASE = apiBaseUrl;

const CommunityPage = () => {
  const deviceId = localStorage.getItem('agroo_device_id');
  const userName  = localStorage.getItem('agroo_user_name');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef         = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef  = useRef(null);

  const { data: history } = useQuery({
    queryKey: ['chat', 'history'],
    queryFn: getChatHistory,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => { if (history) setMessages(history); }, [history]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // WebSocket
  useEffect(() => {
    let ws;
    let reconnectTimer;
    let isClosingIntentionally = false;

    const connect = () => {
      if (isClosingIntentionally) return;

      const token = localStorage.getItem('agroo_jwt');
      if (!token) {
        console.warn('No authentication token found. Skipping WebSocket connection.');
        return;
      }

      const wsBaseUrl = apiBaseUrl.replace(/^http/, 'ws');
      const wsUrl = `${wsBaseUrl}/api/v1/chat/ws/chat?token=${token}`;

      ws = new WebSocket(wsUrl);
      ws.onopen  = () => setIsConnected(true);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) return;
          setMessages((prev) => {
            if (msg.id && prev.some((p) => p.id === msg.id)) return prev;
            return [...prev, msg];
          });
        } catch (e) { console.error('Failed to parse WS message:', e); }
      };
      ws.onclose = () => {
        setIsConnected(false);
        if (!isClosingIntentionally) reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
      wsRef.current = ws;
    };

    connect();
    return () => {
      isClosingIntentionally = true;
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) { alert('Please select an image file (JPG, PNG, GIF, or WEBP)'); return; }
    if (file.size > 5 * 1024 * 1024)  { alert('Image must be under 5MB'); return; }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!input.trim() && !selectedImage) return;

    let imageUrl = null;
    if (selectedImage) {
      setIsUploading(true);
      try { imageUrl = await uploadChatImage(selectedImage); }
      catch (err) { console.error('Image upload failed:', err); setIsUploading(false); return; }
      setIsUploading(false);
    }

    wsRef.current.send(JSON.stringify({
      device_id: deviceId,
      sender_name: userName,
      content: input.trim() || null,
      image_url: imageUrl,
    }));
    setInput('');
    clearImage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (iso) => {
    try { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  const getInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  // Warm earthy avatar palette
  const getAvatarColor = (name) => {
    const colors = [
      { bg: '#166534', text: '#ffffff' },
      { bg: '#92400e', text: '#ffffff' },
      { bg: '#1e3a5f', text: '#ffffff' },
      { bg: '#7c2d12', text: '#ffffff' },
      { bg: '#14532d', text: '#ffffff' },
      { bg: '#78350f', text: '#ffffff' },
      { bg: '#1c1917', text: '#ffffff' },
      { bg: '#713f12', text: '#ffffff' },
    ];
    let hash = 0;
    for (let i = 0; i < (name?.length || 0); i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">

      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="px-4 py-3 border-b"
        style={{ background: 'var(--color-cream)', borderColor: '#e5e0d8' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-lg font-bold font-serif-accent flex items-center gap-2"
              style={{ color: 'var(--color-forest)' }}
            >
              <Users size={20} className="text-amber-600" />
              Kisan Chaupal
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">Share tips, ask questions, help each other</p>
          </div>
          <div className="flex items-center gap-1.5">
            {isConnected
              ? <Wifi size={14} className="text-emerald-600" />
              : <WifiOff size={14} className="text-red-400" />
            }
            <span className={`text-[10px] font-bold ${isConnected ? 'text-emerald-700' : 'text-red-400'}`}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Messages Area — chaupal bg pattern ─────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 chaupal-bg">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-stone-400">
            <Users size={48} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">Be the first to say hello! 👋</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.device_id === deviceId;
          const avatarColor = getAvatarColor(msg.sender_name);

          return (
            <div key={msg.id || `msg-${i}`} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-1"
                style={{ background: avatarColor.bg, color: avatarColor.text }}
              >
                {getInitials(msg.sender_name)}
              </div>

              {/* Message Card — Twitter/noticeboard style */}
              <div
                className="max-w-[78%] rounded-2xl px-4 py-3 shadow-sm"
                style={
                  isMe
                    ? {
                        background: 'linear-gradient(135deg,#166534,#14532d)',
                        color: '#ffffff',
                        borderRadius: '1rem 0.25rem 1rem 1rem',
                      }
                    : {
                        background: 'var(--color-cream)',
                        border: '1.5px solid #e5e0d8',
                        color: 'var(--color-forest)',
                        borderRadius: '0.25rem 1rem 1rem 1rem',
                      }
                }
              >
                {/* Sender name + crop tag */}
                {!isMe && (
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[11px] font-bold text-amber-700">{msg.sender_name}</p>
                    {/* Faux region tag — would be real data in prod */}
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: '#ecfdf5', color: '#166534' }}
                    >
                      Kisan
                    </span>
                  </div>
                )}

                {msg.image_url && (
                  <img
                    src={`${BACKEND_BASE}${msg.image_url}`}
                    alt="shared"
                    className="rounded-xl max-w-full max-h-48 object-cover mb-2"
                    loading="lazy"
                  />
                )}

                {msg.content && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                )}

                <p
                  className="text-[10px] mt-1.5"
                  style={{ color: isMe ? 'rgba(255,255,255,0.55)' : '#a8a29e', textAlign: isMe ? 'right' : 'left' }}
                >
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Image Preview ──────────────────────────────────── */}
      {imagePreview && (
        <div className="px-4 py-2 border-t" style={{ background: 'var(--color-soil)', borderColor: '#e5e0d8' }}>
          <div className="relative inline-block">
            <img src={imagePreview} alt="preview" className="h-20 rounded-xl object-cover border border-stone-200" />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* ── Input Area ─────────────────────────────────────── */}
      <div
        className="px-3 py-2.5 border-t"
        style={{ background: 'var(--color-cream)', borderColor: '#e5e0d8' }}
      >
        <div className="flex items-end gap-2">
          {/* Attach */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ background: '#f0ebe4', color: '#78716c' }}
          >
            <Paperclip size={18} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Kuch poochho ya batao..."
              disabled={isUploading}
              className="w-full px-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 transition-all"
              style={{
                background: '#f5f0eb',
                border: '1.5px solid #d6cfc6',
                color: 'var(--color-forest)',
              }}
            />
          </div>

          {/* Send */}
          <button
            onClick={sendMessage}
            disabled={(!input.trim() && !selectedImage) || isUploading}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
            style={
              (input.trim() || selectedImage) && !isUploading
                ? { background: 'linear-gradient(135deg,#166534,#14532d)', color: '#fff', boxShadow: '0 4px 16px rgba(22,101,52,0.35)' }
                : { background: '#e0dcd6', color: '#a8a29e' }
            }
          >
            {isUploading
              ? <Loader2 size={18} className="animate-spin" />
              : <Send size={18} />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
