import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Post, User } from '../types';
import {
  Users,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  UserPlus,
  UserCheck,
  Clock,
  MapPin,
  Search,
  Sparkles,
  Send,
  Loader2,
  MessageSquare,
} from 'lucide-react';

interface ConnectViewProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onStartDirectMessage: (targetUserId: string) => void;
}

export const ConnectView: React.FC<ConnectViewProps> = ({
  onOpenAuth,
  onStartDirectMessage,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'discover'>('feed');

  // Feed state
  const [posts, setPosts] = useState<Post[]>([]);
  const [newContent, setNewContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isPosting, setIsPosting] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Comment state per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Discover state
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchPosts = () => {
    setLoadingPosts(true);
    api.getPosts()
      .then((res) => setPosts(res.posts || []))
      .catch(() => {})
      .finally(() => setLoadingPosts(false));
  };

  const fetchUsers = () => {
    setLoadingUsers(true);
    api.getUsers({ q: searchUserQuery || undefined })
      .then((res) => setDiscoverUsers(res.users || []))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchPosts();
    } else {
      fetchUsers();
    }
  }, [activeTab, searchUserQuery]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (!newContent.trim()) return;

    setIsPosting(true);
    try {
      await api.createPost({
        content: newContent,
        images: selectedImage ? [selectedImage] : [],
      });
      setNewContent('');
      setSelectedImage('');
      fetchPosts();
    } catch (err: any) {
      alert(err.message || 'Failed to post.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    try {
      const res = await api.likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: res.isLiked, likesCount: res.likesCount }
            : p
        )
      );
    } catch (e) {}
  };

  const handleAddComment = async (postId: string) => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      const res = await api.commentPost(postId, commentText);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                commentsCount: res.commentsCount,
                comments: [...(p.comments || []), res.comment],
              }
            : p
        )
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (e) {}
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {}
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    try {
      await api.sendFriendRequest(targetUserId);
      setDiscoverUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, friendshipStatus: 'pending_sent' } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Request failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008751]">
              NaijaConnect
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Social Network & Community</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Connect With Nigerians & Global Diaspora
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Share updates, discuss business milestones, build friendships, and discover verified people.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'feed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Community Feed
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'discover'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Discover People
          </button>
        </div>
      </div>

      {activeTab === 'feed' ? (
        <div className="space-y-6">
          {/* Create Post Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
            {user ? (
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="flex items-start gap-3">
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-2xl object-cover shrink-0"
                  />
                  <div className="flex-1">
                    <textarea
                      rows={3}
                      placeholder={`What's happening in your business or city, ${user.fullName.split(' ')[0]}?`}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-[#008751] placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {selectedImage && (
                  <div className="relative rounded-2xl overflow-hidden h-40 bg-slate-100">
                    <img src={selectedImage} alt="Attachment" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setSelectedImage('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedImage}
                      onChange={(e) => setSelectedImage(e.target.value)}
                      className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
                    >
                      <option value="">Attach Photo (Optional)</option>
                      <option value="/src/assets/images/hero_naijahub_hub_1791791813531.jpg">Tech & Commerce Hub</option>
                      <option value="/src/assets/images/market_fashion_wear_1791791836844.jpg">Fashion & Culture</option>
                      <option value="/src/assets/images/service_pro_tech_1791791847514.jpg">Artisan & Repair Workshop</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isPosting || !newContent.trim()}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Post Update</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-4 text-center space-y-2">
                <p className="text-xs text-slate-500">Log in or create an account to publish updates and connect.</p>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl"
                >
                  Log In to Post
                </button>
              </div>
            )}
          </div>

          {/* Posts List */}
          {loadingPosts ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-[#008751] animate-spin mx-auto" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No public posts yet. Be the first to share an update!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                id={post.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-2xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{post.authorName}</h4>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span>@{post.authorUsername}</span>
                        <span>·</span>
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{post.authorState}</span>
                      </div>
                    </div>
                  </div>

                  {user && (user.id === post.userId || user.role === 'admin') && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Optional Image */}
                {post.images && post.images.length > 0 && (
                  <div className="rounded-2xl overflow-hidden max-h-80 bg-slate-100">
                    <img
                      src={post.images[0]}
                      alt="Post visual"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Interactions bar */}
                <div className="flex items-center gap-6 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      post.isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}`} />
                    <span className="tabular-nums">{post.likesCount}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    <span className="tabular-nums">{post.commentsCount} comments</span>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Post link copied to clipboard!');
                    }}
                    className="flex items-center gap-1.5 hover:text-slate-900 transition-colors ml-auto"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Comments List */}
                {post.comments && post.comments.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2.5">
                    {post.comments.map((cmt) => (
                      <div key={cmt.id} className="text-xs flex items-start gap-2">
                        <img src={cmt.authorAvatar} alt="" className="w-6 h-6 rounded-full shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-900 mr-1.5">{cmt.authorName}</span>
                          <span className="text-slate-700">{cmt.content}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input */}
                {user && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Discover People Tab */
        <div className="space-y-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, username, city, or business category..."
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-white rounded-2xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
            />
          </div>

          {loadingUsers ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-[#008751] animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {discoverUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <img src={u.avatar} alt={u.fullName} className="w-12 h-12 rounded-2xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{u.fullName}</h4>
                        {u.isVerified && (
                          <span className="text-[10px] text-[#008751] font-bold">✓ Verified</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">@{u.username}</div>
                      <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{u.state}, {u.country}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {u.bio || 'NaijaHub community member.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onStartDirectMessage(u.id)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>

                    {u.friendshipStatus === 'friends' ? (
                      <span className="text-xs font-semibold text-[#008751] bg-[#008751]/10 px-3 py-2 rounded-xl flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Connected</span>
                      </span>
                    ) : u.friendshipStatus === 'pending_sent' ? (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Requested</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendFriendRequest(u.id)}
                        className="flex-1 py-2 text-xs font-semibold text-white bg-[#008751] hover:bg-[#007042] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
