import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { api } from '../lib/api';
import { ChatRoom, RoomMessage, Conversation, DirectMessage } from '../types';
import {
  MessageSquare,
  Globe,
  Users,
  Send,
  CornerDownRight,
  Shield,
  Briefcase,
  ShoppingBag,
  ExternalLink,
  Loader2,
  Clock,
  Check,
  CheckCheck,
  Sparkles,
  ArrowDown,
  X,
  Reply,
} from 'lucide-react';

interface ChatViewProps {
  initialRoomId?: string;
  initialConversationId?: string;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  initialRoomId,
  initialConversationId,
  onOpenAuth,
}) => {
  const { user, quickLogin } = useAuth();
  const { joinRoom, leaveRoom, joinConversation, leaveConversation, sendTyping, subscribe, isConnected } =
    useWebSocket();

  const [activeMode, setActiveMode] = useState<'rooms' | 'direct'>(
    initialConversationId ? 'direct' : 'rooms'
  );

  // Rooms state
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const [roomInput, setRoomInput] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ id: string; senderName: string; content: string } | null>(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const [isSendingRoomMsg, setIsSendingRoomMsg] = useState(false);

  // Direct conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [directInput, setDirectInput] = useState('');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [directReplyTarget, setDirectReplyTarget] = useState<{ id: string; senderName: string; content: string } | null>(null);
  const [isSendingDirectMsg, setIsSendingDirectMsg] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to and highlight a specific message when a reply quote is clicked
  const handleScrollToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(messageId);
      setTimeout(() => setHighlightedMsgId(null), 2500);
    }
  };

  // Load Rooms
  useEffect(() => {
    api.getRooms()
      .then((res) => {
        const list: ChatRoom[] = res.rooms || [];
        setRooms(list);
        if (list.length > 0 && !selectedRoom) {
          const target = initialRoomId
            ? list.find((r) => r.id === initialRoomId) || list[0]
            : list[0];
          setSelectedRoom(target);
        }
      })
      .catch(() => {});
  }, [initialRoomId]);

  // Load Conversations if authenticated
  const fetchConversations = () => {
    if (!user) return;
    api.getConversations()
      .then((res) => {
        const list: Conversation[] = res.conversations || [];
        setConversations(list);
        if (initialConversationId) {
          const target = list.find((c) => c.id === initialConversationId);
          if (target) {
            setSelectedConversation(target);
            setActiveMode('direct');
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchConversations();
  }, [user, initialConversationId]);

  // Join selected room & listen to incoming WebSocket messages + fallback polling
  useEffect(() => {
    if (!selectedRoom) return;

    joinRoom(selectedRoom.id);

    // Initial load
    api.getRoomMessages(selectedRoom.id)
      .then((res) => {
        setRoomMessages(res.messages || []);
        setTimeout(() => scrollToBottom('auto'), 50);
      })
      .catch(() => {});

    // Real-time WebSocket listener
    const unsubscribe = subscribe(`room_${selectedRoom.id}`, (newMsg: RoomMessage) => {
      setRoomMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(() => scrollToBottom('smooth'), 50);
    });

    // 3-second fallback polling interval to guarantee multi-user sync across separate browsers/tabs
    const pollInterval = setInterval(() => {
      api.getRoomMessages(selectedRoom.id)
        .then((res) => {
          const freshMessages: RoomMessage[] = res.messages || [];
          setRoomMessages((prev) => {
            // Check if there are any new messages
            const existingIds = new Set(prev.map((m) => m.id));
            const hasNew = freshMessages.some((m) => !existingIds.has(m.id));
            if (hasNew) {
              setTimeout(() => scrollToBottom('smooth'), 50);
              return freshMessages;
            }
            return prev;
          });
        })
        .catch(() => {});
    }, 3000);

    return () => {
      leaveRoom(selectedRoom.id);
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [selectedRoom, joinRoom, leaveRoom, subscribe]);

  // Join selected direct conversation & listen to incoming WebSocket messages + polling
  useEffect(() => {
    if (!selectedConversation) return;

    joinConversation(selectedConversation.id);
    api.getConversationMessages(selectedConversation.id)
      .then((res) => {
        setDirectMessages(res.messages || []);
        setTimeout(() => scrollToBottom('auto'), 50);
      })
      .catch(() => {});

    const unsubscribeMsg = subscribe(`conv_${selectedConversation.id}`, (newMsg: DirectMessage) => {
      setDirectMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(() => scrollToBottom('smooth'), 50);
    });

    const unsubscribeTyping = subscribe(`typing_${selectedConversation.id}`, (data: any) => {
      if (data.userId !== user?.id) {
        setIsOtherUserTyping(data.isTyping);
      }
    });

    // 3-second fallback polling for DM conversation
    const dmPollInterval = setInterval(() => {
      api.getConversationMessages(selectedConversation.id)
        .then((res) => {
          const freshDms: DirectMessage[] = res.messages || [];
          setDirectMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const hasNew = freshDms.some((m) => !existingIds.has(m.id));
            if (hasNew) {
              setTimeout(() => scrollToBottom('smooth'), 50);
              return freshDms;
            }
            return prev;
          });
        })
        .catch(() => {});
    }, 3000);

    return () => {
      leaveConversation(selectedConversation.id);
      unsubscribeMsg();
      unsubscribeTyping();
      clearInterval(dmPollInterval);
    };
  }, [selectedConversation, joinConversation, leaveConversation, subscribe, user?.id]);

  const handleSelectReply = (msg: RoomMessage) => {
    setReplyTarget({
      id: msg.id,
      senderName: msg.senderName,
      content: msg.content,
    });
    inputRef.current?.focus();
  };

  const handleSendRoomMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (!roomInput.trim() || !selectedRoom || isSendingRoomMsg) return;

    const content = roomInput.trim();
    const reply = replyTarget;
    setRoomInput('');
    setReplyTarget(null);
    setIsSendingRoomMsg(true);

    try {
      const res = await api.sendRoomMessage(selectedRoom.id, {
        content,
        replyToId: reply ? reply.id : undefined,
        replyToContent: reply ? reply.content.substring(0, 80) : undefined,
        replyToSenderName: reply ? reply.senderName : undefined,
      });

      // Immediately append sent message
      if (res && res.message) {
        setRoomMessages((prev) => {
          if (prev.some((m) => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
      setRoomInput(content); // restore on error
    } finally {
      setIsSendingRoomMsg(false);
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConversation || isSendingDirectMsg) return;
    if (!directInput.trim()) return;

    const content = directInput.trim();
    const reply = directReplyTarget;
    setDirectInput('');
    setDirectReplyTarget(null);
    sendTyping(selectedConversation.id, false);
    setIsSendingDirectMsg(true);

    try {
      const res = await api.sendDirectMessage(selectedConversation.id, {
        content,
        replyToId: reply ? reply.id : undefined,
      });

      if (res && res.message) {
        setDirectMessages((prev) => {
          if (prev.some((m) => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send direct message');
      setDirectInput(content);
    } finally {
      setIsSendingDirectMsg(false);
    }
  };

  const otherParticipant = selectedConversation?.participantDetails?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Quick Test Persona Switcher Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:px-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">
            {user ? (
              <>
                Chatting as: <span className="text-[#008751]">{user.fullName}</span> ({user.role})
              </>
            ) : (
              <span className="text-slate-500">You are browsing as Guest. Select an account to send and reply:</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline mr-1">
            Switch user to test replies:
          </span>
          <button
            onClick={() => quickLogin('chidi')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
              user?.username === 'chidi_tech'
                ? 'bg-[#008751] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📱 Chidi (Seller)
          </button>
          <button
            onClick={() => quickLogin('amina')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
              user?.username === 'amina_couture'
                ? 'bg-[#008751] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ✂️ Amina (Tailor)
          </button>
          <button
            onClick={() => quickLogin('folake')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
              user?.username === 'folake_diaspora'
                ? 'bg-[#008751] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🌍 Folake (Diaspora)
          </button>
          <button
            onClick={() => quickLogin('admin')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
              user?.role === 'admin'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden h-[740px] flex flex-col md:flex-row">
        {/* LEFT SIDEBAR: ROOMS & DIRECT CONVERSATIONS */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
          {/* Header Switcher */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-900">NaijaHub Business Connect</span>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span>{isConnected ? 'Realtime Live' : 'Connecting...'}</span>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveMode('rooms')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeMode === 'rooms'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Public Rooms ({rooms.length})
              </button>
              <button
                onClick={() => {
                  if (!user) onOpenAuth('login');
                  else setActiveMode('direct');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeMode === 'direct'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Direct Messages ({conversations.length})
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {activeMode === 'rooms' ? (
              rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white border-l-4 border-l-[#008751] shadow-xs'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#008751] flex items-center justify-center font-bold shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {room.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {room.memberCount} members
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {room.description}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <p>No direct message conversations yet.</p>
                <p className="text-[11px]">Click "Message Seller" on any marketplace item or "Message" on any user profile to start chatting privately.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                const other = conv.participantDetails?.[0];
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white border-l-4 border-l-[#008751] shadow-xs'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <img
                      src={other?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {other?.name || 'Direct Conversation'}
                        </h4>
                        {conv.unreadCount && conv.unreadCount > 0 ? (
                          <span className="text-[10px] font-bold text-white bg-[#008751] px-1.5 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.lastMessage || 'Conversation started'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT CHAT PANE */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {activeMode === 'rooms' && selectedRoom ? (
            <>
              {/* Room Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{selectedRoom.name}</h3>
                    <span className="text-[10px] font-semibold text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-md">
                      {selectedRoom.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedRoom.description}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="tabular-nums font-semibold">{selectedRoom.memberCount} Participants</span>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
                {roomMessages.length === 0 ? (
                  <div className="py-24 text-center space-y-2">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-700">No messages in this room yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Start the conversation by posting an inquiry, business proposal, or opportunity below!
                    </p>
                  </div>
                ) : (
                  roomMessages.map((msg) => {
                    const isMine = msg.userId === user?.id;
                    const isHighlighted = highlightedMsgId === msg.id;

                    return (
                      <div
                        key={msg.id}
                        id={`msg-${msg.id}`}
                        className={`flex items-start gap-3 max-w-2xl transition-all duration-300 ${
                          isMine ? 'ml-auto flex-row-reverse' : ''
                        } ${isHighlighted ? 'scale-102 bg-amber-50/60 p-2 rounded-2xl ring-2 ring-amber-400' : ''}`}
                      >
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-9 h-9 rounded-2xl object-cover shrink-0 mt-1 shadow-xs border border-slate-200"
                        />
                        <div className={`space-y-1 ${isMine ? 'items-end' : 'items-start'} max-w-[85%]`}>
                          {/* Sender name + Role badge + Timestamp + Reply Button */}
                          <div className={`flex items-center gap-2 text-[11px] ${isMine ? 'justify-end' : ''}`}>
                            <span className="font-bold text-slate-900">{msg.senderName}</span>
                            {msg.senderRole === 'admin' && (
                              <span className="text-[9px] font-bold bg-slate-900 text-white px-1.5 py-0.2 rounded-md">
                                Admin
                              </span>
                            )}
                            {msg.senderRole === 'business' && (
                              <span className="text-[9px] font-bold bg-emerald-50 text-[#008751] px-1.5 py-0.2 rounded-md border border-emerald-200">
                                Verified Business
                              </span>
                            )}
                            <span className="text-slate-400 tabular-nums">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>

                            {/* Reply Action Button */}
                            <button
                              onClick={() => handleSelectReply(msg)}
                              className="text-slate-400 hover:text-[#008751] flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md hover:bg-emerald-50 transition-colors"
                              title="Reply to this message"
                            >
                              <Reply className="w-3 h-3" />
                              <span>Reply</span>
                            </button>
                          </div>

                          {/* Quoted Replying-To Card (If this message was a reply to another) */}
                          {msg.replyToContent && (
                            <div
                              onClick={() => msg.replyToId && handleScrollToMessage(msg.replyToId)}
                              className={`cursor-pointer text-[11px] p-2 rounded-xl border-l-4 border-l-[#008751] transition-all hover:opacity-90 ${
                                isMine
                                  ? 'bg-emerald-800/40 text-emerald-100'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                              title="Click to view original message"
                            >
                              <div className="font-bold text-[10px] flex items-center gap-1 opacity-90">
                                <CornerDownRight className="w-3 h-3 text-[#008751]" />
                                <span>Replying to @{msg.replyToSenderName || 'Member'}</span>
                              </div>
                              <p className="italic line-clamp-2 mt-0.5 font-normal">
                                "{msg.replyToContent}"
                              </p>
                            </div>
                          )}

                          {/* Message Body Bubble */}
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMine
                                ? 'bg-[#008751] text-white rounded-tr-xs shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                            }`}
                          >
                            <p className="whitespace-pre-line select-text">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Active Reply Banner (Displays when user clicked Reply) */}
              {replyTarget && (
                <div className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-950 animate-in fade-in slide-in-from-bottom-2 shrink-0">
                  <div className="flex items-center gap-2 truncate">
                    <Reply className="w-4 h-4 text-[#008751] shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-[#008751]">Replying to {replyTarget.senderName}:</span>{' '}
                      <span className="text-slate-600 italic">"{replyTarget.content}"</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyTarget(null)}
                    className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-emerald-100 transition-colors ml-2 shrink-0"
                    title="Cancel reply"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Room Message Input Bar */}
              <form onSubmit={handleSendRoomMessage} className="p-4 border-t border-slate-200 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={
                      user
                        ? replyTarget
                          ? `Type your reply to ${replyTarget.senderName}...`
                          : `Message ${selectedRoom.name}...`
                        : 'Log in as a member to join the discussion and post replies'
                    }
                    disabled={!user || isSendingRoomMsg}
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    className="flex-1 text-xs px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751] disabled:bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={!user || !roomInput.trim() || isSendingRoomMsg}
                    className="px-5 py-3 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                  >
                    {isSendingRoomMsg ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{replyTarget ? 'Send Reply' : 'Send'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : activeMode === 'direct' && selectedConversation ? (
            <>
              {/* Direct Conversation Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={otherParticipant?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {otherParticipant?.name || 'Direct Chat'}
                    </h3>
                    <div className="text-[11px] text-slate-500">
                      @{otherParticipant?.username || 'member'} · Direct Encrypted Messaging
                    </div>
                  </div>
                </div>

                {selectedConversation.relatedItemId && (
                  <div className="text-xs bg-emerald-50 text-[#008751] font-semibold px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px]">
                      {selectedConversation.relatedItemTitle || 'Linked Item'}
                    </span>
                  </div>
                )}
              </div>

              {/* Direct Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
                {directMessages.length === 0 ? (
                  <div className="py-24 text-center text-xs text-slate-400">
                    No messages yet in this direct conversation.
                  </div>
                ) : (
                  directMessages.map((msg) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-3 max-w-xl ${
                          isMine ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        <div className={`space-y-1 ${isMine ? 'items-end' : ''}`}>
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMine
                                ? 'bg-[#008751] text-white rounded-tr-xs shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                            }`}
                          >
                            <p className="whitespace-pre-line select-text">{msg.content}</p>
                          </div>
                          <div
                            className={`flex items-center gap-1 text-[10px] text-slate-400 ${
                              isMine ? 'justify-end' : ''
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMine && (
                              <CheckCheck
                                className={`w-3.5 h-3.5 ${
                                  msg.status === 'read' ? 'text-emerald-500' : 'text-slate-400'
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {isOtherUserTyping && (
                  <div className="text-[11px] text-slate-500 italic animate-pulse">
                    {otherParticipant?.name} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Direct Message Input */}
              <form onSubmit={handleSendDirectMessage} className="p-4 border-t border-slate-200 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type private message..."
                    value={directInput}
                    disabled={isSendingDirectMsg}
                    onChange={(e) => {
                      setDirectInput(e.target.value);
                      sendTyping(selectedConversation.id, e.target.value.length > 0);
                    }}
                    className="flex-1 text-xs px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                  />
                  <button
                    type="submit"
                    disabled={!directInput.trim() || isSendingDirectMsg}
                    className="px-5 py-3 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSendingDirectMsg ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-400">
              Select a chat room or direct conversation to begin messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
