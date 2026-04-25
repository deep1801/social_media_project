import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Send, ArrowLeft, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSentiment } from '../helper/huggingFaceSentiment';

// 🔹 Helper to build conversation-level sentiment summary

const buildConversationSummary = (messages, sentiments) => {
  const stats = {
    POSITIVE: 0,
    NEGATIVE: 0,
    NEUTRAL: 0,
    total: 0,
  };

  messages.forEach((m) => {
    const s = sentiments[m._id];
    if (!s || !s.label) return;

    const label = s.label.toUpperCase();
    if (stats[label] === undefined) return;

    stats[label] += 1;
    stats.total += 1;
  });

  if (!stats.total) return null;

  // individual percentages
  const positivePct = Math.round((stats.POSITIVE / stats.total) * 100);
  const negativePct = Math.round((stats.NEGATIVE / stats.total) * 100);
  const neutralPct  = Math.round((stats.NEUTRAL  / stats.total) * 100);

  // 🔹 DEFAULT → NEUTRAL
  let dominantLabel = 'NEUTRAL';

  console.log("positive pct",positivePct);
  console.log("negative pct",negativePct);
  

  // 🔹 Strong dominance rules ONLY
  if (positivePct >= 60 && positivePct > negativePct) {
    if(positivePct>80)
    {  
      dominantLabel = 'POSITIVE';
    }else{
      dominantLabel = 'POSITIVE';
    }
  } else if (negativePct >= 60 && negativePct > positivePct) {
    dominantLabel = 'NEGATIVE';
  }

  let emoji = '😐';
  let moodText = 'Mixed / Neutral';

  if (dominantLabel === 'POSITIVE') {
    emoji = '😊';
    moodText = 'Mostly Happy / Positive';
  } else if (dominantLabel === 'NEGATIVE') {
    emoji = '😡';
    moodText = 'Mostly Angry / Negative';
  }

  const dominantPercentage =
    dominantLabel === 'POSITIVE'
      ? positivePct
      : dominantLabel === 'NEGATIVE'
      ? negativePct
      : Math.max(positivePct, negativePct, neutralPct);

  return {
    dominantLabel,
    dominantPercentage,
    emoji,
    moodText,
    positivePct,
    negativePct,
    neutralPct,
  };
};


const AUTO_SCROLL_THRESHOLD = 400;
const NEAR_BOTTOM_DELTA = 120;

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  // 🔹 sentiment cache: { [messageId]: { label, score } }
  const [sentiments, setSentiments] = useState({});

  const { userId } = useParams();
  const { user } = useAuth();

  // ---------- SCROLLING refs & state ----------
  const messagesRef = useRef(null); // container DOM ref
  const userScrolledUpRef = useRef(false); // tracks if user scrolled away from bottom

  // ---------- POLLING refs ----------
  const pollingIntervalRef = useRef(null);
  const isFetchingMessagesRef = useRef(false); // prevent overlapping fetches
  const currentConversationIdRef = useRef(null); // keep current convo id between closures

  // helper: check whether container is near bottom
  const isContainerNearBottom = (container) => {
    if (!container) return true;
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - (scrollTop + clientHeight) <= NEAR_BOTTOM_DELTA;
  };

  // scroll to bottom helper
  const scrollToBottom = (behavior = 'smooth') => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  // attach onScroll handler to detect user scrolling up/down
  const handleMessagesScroll = (e) => {
    const el = e.target;
    if (!el) return;

    const nearBottom = isContainerNearBottom(el);
    // if user scrolled away from bottom beyond delta, mark as scrolled up
    userScrolledUpRef.current = !nearBottom;
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      getOrCreateConversation(userId);
    }
  }, [userId]);

  const fetchConversations = async () => {
    try {
      const res = await axiosInstance.get('/api/v1/messages/conversations');
      setConversations(res.data.data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateConversation = async (targetUserId) => {
    try {
      const res = await axiosInstance.get(`/api/v1/messages/conversation/${targetUserId}`);
      setSelectedConversation(res.data.data);
      fetchMessages(res.data.data._id);
    } catch (err) {
      console.error('Failed to get conversation:', err);
    }
  };

  const fetchMessages = async (conversationId) => {
    // guard: don't fetch if another fetch in progress for messages
    if (isFetchingMessagesRef.current) return;
    if (!conversationId) return;

    isFetchingMessagesRef.current = true;
    try {
      const res = await axiosInstance.get(`/api/v1/messages/${conversationId}`);
      setMessages(res.data.data);
      await axiosInstance.put(`/api/v1/messages/${conversationId}/read`);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      isFetchingMessagesRef.current = false;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const res = await axiosInstance.post(`/api/v1/messages/${selectedConversation._id}`, {
        text: messageText,
      });
      const newMessage = res.data.data;

      setMessages((prev) => [...prev, newMessage]);
      setMessageText('');

      // 🔹 immediately fetch sentiment for newly sent message
      fetchSentimentForMessage(newMessage);

      fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message');
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation._id);
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find((p) => p._id !== user._id);
  };

  // 🔹 helper to call backend for single message sentiment
  const fetchSentimentForMessage = async (message) => {
    if (!message?.text || !message?._id) return;
    if (sentiments[message._id]) return; // already computed

    const result = await getSentiment(message.text);

    
    
    if (result) {
      setSentiments((prev) => ({
        ...prev,
        [message._id]: result,
      }));
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const ok = window.confirm('Delete this message? This cannot be undone.');
    if (!ok) return;

    try {
      await axiosInstance.delete(`/api/v1/messages/${messageId}`);
      // remove from messages state
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      // remove from sentiment cache
      setSentiments((prev) => {
        const copy = { ...prev };
        delete copy[messageId];
        return copy;
      });
      // refresh conversations so lastMessage updates
      fetchConversations();
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete message');
    }
  };

  // NEW: delete ALL messages for selected conversation
  const handleDeleteAllMessages = async () => {
    if (!selectedConversation || !selectedConversation._id) return;
    const ok = window.confirm(
      'Delete ALL messages in this conversation? This will remove every message permanently. Are you sure?'
    );
    if (!ok) return;

    try {
      await axiosInstance.delete(
        `/api/v1/messages/conversation/${selectedConversation._id}/clear`
      );

      // clear UI state for messages + sentiments
      setMessages([]);
      setSentiments({});

      // refresh conversations so lastMessage updates
      await fetchConversations();

      // Optionally, keep conversation selected (empty) or deselect
      // keep selectedConversation as-is (it now has no messages)
      // setSelectedConversation(null); // uncomment if you want to auto-deselect

    } catch (err) {
      console.error('Failed to delete all messages:', err);
      alert('Failed to delete all messages');
    }
  };

  // 🔹 whenever messages change, ensure sentiment for each
  useEffect(() => {
    messages.forEach((msg) => {
      fetchSentimentForMessage(msg);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // ---------- POLLING: fetch messages every 1s for selected conversation ----------
  useEffect(() => {
    // clear any previous interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // if no conversation selected, nothing to poll
    if (!selectedConversation || !selectedConversation._id) {
      currentConversationIdRef.current = null;
      return;
    }

    const convId = selectedConversation._id;
    currentConversationIdRef.current = convId;

    // create interval
    pollingIntervalRef.current = setInterval(() => {
      // only fetch if conversation hasn't changed and no fetch in-flight
      if (currentConversationIdRef.current === convId && !isFetchingMessagesRef.current) {
        fetchMessages(convId);
      }
    }, 1000);

    // immediate first fetch (already done on selectConversation, but safe)
    fetchMessages(convId);

    // cleanup on unmount or when selectedConversation changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      currentConversationIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  // ---------- AUTO-SCROLL behavior ----------
  // scroll when messages or selectedConversation change, respecting user's scroll position
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;

    // if content is short, always scroll to bottom
    if (el.scrollHeight <= AUTO_SCROLL_THRESHOLD) {
      scrollToBottom('auto');
      userScrolledUpRef.current = false;
      return;
    }

    // if user is near bottom or not scrolled up, auto-scroll
    if (!userScrolledUpRef.current || isContainerNearBottom(el)) {
      scrollToBottom('smooth');
      userScrolledUpRef.current = false;
    }
    // otherwise do not disturb user's scroll position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, selectedConversation]);

  // When switching conversations immediately scroll to bottom
  useEffect(() => {
    scrollToBottom('auto');
    userScrolledUpRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 🔹 sentiment badge with emoji
  const SentimentBadge = ({ sentiment }) => {

  

    if (!sentiment) return null;

    const { label, score } = sentiment;
    let bgClass = 'bg-gray-300 text-gray-800';
    let emoji = '😐';

    if (label === 'POSITIVE') {
      bgClass = 'bg-green-100 text-green-800';
      emoji = '😊';
    } else if (label === 'NEGATIVE') {
      bgClass = 'bg-red-100 text-red-800';
      emoji = '😡';
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ml-2 ${bgClass}`}
      >
        <span className="mr-1">{emoji}</span>
        {label} • {(score * 100).toFixed(1)}%
      </span>
    );
  };

  // 🔹 conversation-level summary (angry / happy based on percentage)
  const conversationSummary = buildConversationSummary(messages, sentiments);

  // reply tone suggestion based on conversation mood
  let suggestedReplyTone = '';
  if (conversationSummary) {
    if (conversationSummary.dominantLabel === 'NEGATIVE') {
      suggestedReplyTone =
        'User is mostly angry/negative. Reply politely, acknowledge their feelings, and offer help calmly.';
    } else if (conversationSummary.dominantLabel === 'POSITIVE') {
      suggestedReplyTone =
        'User is mostly happy/positive. You can reply in a friendly, enthusiastic tone and appreciate their message.';
    } else {
      suggestedReplyTone =
        'Mood is mixed/neutral. Keep reply balanced, clear, and professional.';
    }
  }


  

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <Link to="/users" className="btn-primary">
          New Message
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="card overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Conversations</h2>
          {conversations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No conversations yet</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation);
                return (
                  <div
                    key={conversation._id}
                    onClick={() => selectConversation(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation?._id === conversation._id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {otherUser?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate ">
                          {otherUser?.name}
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="md:col-span-2 card flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  {/* NEW: Delete All Messages button - only show when conversation selected */}
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={handleDeleteAllMessages}
                      className="text-red-600 hover:text-red-800 text-sm hidden md:inline-flex items-center gap-1"
                      title="Delete all messages in this conversation"
                    >
                      <Trash2 size={16} /> Delete All
                    </button>
                    {/* small icon-only button for mobile */}
                    <button
                      onClick={handleDeleteAllMessages}
                      className="text-red-600 hover:text-red-800 md:hidden"
                      title="Delete all messages"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {getOtherParticipant(selectedConversation)?.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getOtherParticipant(selectedConversation)?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* 🔹 Conversation mood + summary */}
              {conversationSummary && (
                <div className="mb-3 p-3 rounded-lg border border-gray-200 bg-gray-50 text-xs md:text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{conversationSummary.emoji}</span>
                    <div>
                      <p className="font-semibold">
                        Overall mood: {conversationSummary.moodText}
                      </p>
                      <p className="text-gray-500">
                        Dominant sentiment: {conversationSummary.dominantLabel} (
                        {conversationSummary.dominantPercentage}% of analysed messages)
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-500 text-[11px] md:text-xs">
                    P: {conversationSummary.positivePct}% • N:{' '}
                    {conversationSummary.negativePct}% • Ne:{' '}
                    {conversationSummary.neutralPct}%
                  </div>
                </div>
              )}

              {/* Messages */}
              <div
                ref={messagesRef}
                onScroll={handleMessagesScroll}
                className="flex-1 overflow-y-auto mb-4 space-y-3"
              >
                {messages.map((message) => {
                  const isMe = message?.sender?._id === user?._id;
                  const sentiment = sentiments[message._id];

                  return (
                    <div
                      key={message._id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${isMe
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                          }`}
                      >
                        <div className="flex items-center">
                          <p className="break-words">{message.text}</p>
                          {/* Sentiment badge with emoji */}
                          <SentimentBadge sentiment={sentiment} />
                        </div>
                        {isMe && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(message._id)}
                            className="ml-2 text-xs md:text-sm text-red-600 hover:underline"
                            title="Delete message"
                          >
                            🗑️
                          </button>
                        )}

                        <p
                          className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'
                            }`}
                        >
                          {new Date(message?.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Suggested reply tone based on mood */}
              {conversationSummary && (
                <div className="mb-2 text-[11px] md:text-xs text-gray-600 italic">
                  Suggested reply tone: {suggestedReplyTone}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 input-field"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="btn-primary"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
