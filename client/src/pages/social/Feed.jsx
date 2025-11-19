import React, { useState, useEffect } from 'react';
import { socialPosts, socialComments, socialStories, socialProfile, socialNotifications } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Feed() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [algorithm, setAlgorithm] = useState('chronological');

  // New post state
  const [newPost, setNewPost] = useState('');
  const [postVisibility, setPostVisibility] = useState('public');
  const [creating, setCreating] = useState(false);

  // Comment state
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    loadData();
  }, [algorithm]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load multiple things in parallel
      const [feedRes, storiesRes, profileRes, notifRes] = await Promise.all([
        socialPosts.getFeed({ page: 1, limit: 20, algorithm }),
        socialStories.get(),
        socialProfile.get(),
        socialNotifications.get({ page: 1, limit: 5 }),
      ]);

      setPosts(feedRes.data.posts);
      setHasMore(feedRes.data.pagination.page < feedRes.data.pagination.pages);
      setStories(storiesRes.data.storyGroups || []);
      setProfile(profileRes.data);
      setNotifications(notifRes.data.notifications || []);
      setUnreadCount(notifRes.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load feed:', error);
      alert('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = page + 1;
      const res = await socialPosts.getFeed({ page: nextPage, limit: 20, algorithm });
      setPosts([...posts, ...res.data.posts]);
      setPage(nextPage);
      setHasMore(res.data.pagination.page < res.data.pagination.pages);
    } catch (error) {
      console.error('Failed to load more posts:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      setCreating(true);
      await socialPosts.create({
        content: newPost,
        visibility: postVisibility,
      });
      setNewPost('');
      setPostVisibility('public');
      loadData(); // Reload feed
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (postId, currentReaction) => {
    try {
      if (currentReaction) {
        await socialPosts.unlike(postId);
      } else {
        await socialPosts.like(postId, { reactionType: 'like' });
      }

      // Update local state
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            hasLiked: !currentReaction,
            userReaction: currentReaction ? null : 'like',
            likes: currentReaction ? p.likes - 1 : p.likes + 1,
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      await socialPosts.like(postId, { reactionType });

      // Update local state
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            hasLiked: true,
            userReaction: reactionType,
            likes: p.hasLiked ? p.likes : p.likes + 1,
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to react to post:', error);
    }
  };

  const handleComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    try {
      await socialComments.create(postId, { content });
      setCommentInputs({ ...commentInputs, [postId]: '' });

      // Update comment count
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, comments: p.comments + 1 };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to create comment:', error);
      alert('Failed to create comment');
    }
  };

  const toggleComments = (postId) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId],
    });
  };

  const getReactionEmoji = (type) => {
    const emojis = {
      like: '👍',
      love: '❤️',
      celebrate: '🎉',
      support: '💪',
      insightful: '💡',
    };
    return emojis[type] || '👍';
  };

  const formatTime = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diff = Math.floor((now - posted) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return posted.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/dashboard')} className="text-2xl font-bold text-blue-600">
                Supernova Social
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 hover:bg-gray-100 rounded-full relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Profile */}
              <button
                onClick={() => navigate(`/social/profile/${profile?.userId}`)}
                className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {profile?.user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium hidden sm:block">{profile?.user?.name}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stories Bar */}
            {stories.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex space-x-4 overflow-x-auto">
                  {stories.map((storyGroup) => (
                    <button
                      key={storyGroup.user.id}
                      className="flex-shrink-0 text-center"
                    >
                      <div className={`w-16 h-16 rounded-full p-1 ${storyGroup.hasViewed ? 'bg-gray-300' : 'bg-gradient-to-tr from-yellow-400 to-pink-600'}`}>
                        <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {storyGroup.user.name.charAt(0)}
                        </div>
                      </div>
                      <p className="text-xs mt-1 truncate w-16">{storyGroup.user.name.split(' ')[0]}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create Post */}
            <div className="bg-white rounded-lg shadow p-4">
              <form onSubmit={handleCreatePost}>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
                <div className="flex items-center justify-between mt-3">
                  <select
                    value={postVisibility}
                    onChange={(e) => setPostVisibility(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="public">🌍 Public</option>
                    <option value="followers">👥 Followers</option>
                    <option value="private">🔒 Only Me</option>
                  </select>
                  <button
                    type="submit"
                    disabled={creating || !newPost.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>

            {/* Algorithm Toggle */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Feed:</span>
                <button
                  onClick={() => setAlgorithm('chronological')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    algorithm === 'chronological'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setAlgorithm('engagement')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    algorithm === 'engagement'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Top
                </button>
              </div>
            </div>

            {/* Posts */}
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow">
                {/* Post Header */}
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {post.user?.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.user?.user?.name || 'Unknown User'}</h3>
                      <p className="text-sm text-gray-500">{formatTime(post.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {post.visibility === 'followers' && <span className="text-gray-500">👥</span>}
                    {post.visibility === 'private' && <span className="text-gray-500">🔒</span>}
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>

                  {/* Media */}
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {post.mediaUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Post media"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Poll */}
                  {post.pollOptions && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(post.pollOptions).map(([option, votes]) => (
                        <button
                          key={option}
                          className="w-full p-3 border rounded-lg text-left hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                            <span>{option}</span>
                            <span className="text-sm text-gray-500">{votes || 0} votes</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Stats */}
                <div className="px-4 py-2 border-t border-b flex items-center justify-between text-sm text-gray-500">
                  <span>{post.likes} reactions</span>
                  <div className="flex space-x-4">
                    <span>{post.comments} comments</span>
                    <span>{post.shares} shares</span>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="px-4 py-2 flex items-center justify-around">
                  {/* Like Button with Reactions */}
                  <div className="relative group">
                    <button
                      onClick={() => handleLike(post.id, post.hasLiked)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 ${
                        post.hasLiked ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      <span className="text-xl">{post.userReaction ? getReactionEmoji(post.userReaction) : '👍'}</span>
                      <span className="font-medium">Like</span>
                    </button>

                    {/* Reaction Picker */}
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex bg-white border rounded-full shadow-lg p-2 space-x-1">
                      {['like', 'love', 'celebrate', 'support', 'insightful'].map((reaction) => (
                        <button
                          key={reaction}
                          onClick={() => handleReaction(post.id, reaction)}
                          className="text-2xl hover:scale-125 transition-transform"
                          title={reaction}
                        >
                          {getReactionEmoji(reaction)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-medium">Comment</span>
                  </button>

                  <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="font-medium">Share</span>
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="border-t p-4 bg-gray-50">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        placeholder="Write a comment..."
                        className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleComment(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMorePosts}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg shadow hover:bg-gray-50 font-medium"
                >
                  Load More Posts
                </button>
              </div>
            )}

            {posts.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">👋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your feed is empty</h3>
                <p className="text-gray-600 mb-4">Follow people to see their posts here</p>
                <button
                  onClick={() => navigate('/social/discover')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Discover People
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.user?.name?.charAt(0) || 'U'}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{profile?.user?.name}</h3>
                {profile?.headline && (
                  <p className="text-sm text-gray-600 mt-1">{profile.headline}</p>
                )}
                <div className="flex justify-around mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{profile?.postsCount || 0}</div>
                    <div className="text-xs text-gray-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{profile?.followersCount || 0}</div>
                    <div className="text-xs text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{profile?.followingCount || 0}</div>
                    <div className="text-xs text-gray-600">Following</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/social/profile/${profile?.userId}`)}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Profile
                </button>
              </div>
            </div>

            {/* Recent Notifications */}
            {notifications.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className="flex items-start space-x-3 text-sm">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {notif.actor?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800">
                          <span className="font-semibold">{notif.actor?.name}</span>{' '}
                          <span className="text-gray-600">{notif.message}</span>
                        </p>
                        <p className="text-gray-500 text-xs mt-1">{formatTime(notif.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Explore</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3">
                  <span>👥</span>
                  <span className="text-sm">Find Friends</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3">
                  <span>🎭</span>
                  <span className="text-sm">Groups</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3">
                  <span>📅</span>
                  <span className="text-sm">Events</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3">
                  <span>🛍️</span>
                  <span className="text-sm">Marketplace</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
