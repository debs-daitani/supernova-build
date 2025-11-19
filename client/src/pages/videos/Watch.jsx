import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videos, videoComments, videoChannels, videoDiscovery } from '../../services/api';

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVideo();
    }
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const [videoRes, commentsRes, recommendedRes] = await Promise.all([
        videos.get(id),
        videoComments.list(id, { limit: 20, sort: 'top' }),
        videoDiscovery.recommendations({ limit: 10 }),
      ]);

      setVideo(videoRes.data);
      setComments(commentsRes.data.comments || []);
      setRecommended(recommendedRes.data.videos || []);

      // Log view
      await videos.view(id, { watchTime: 0, completed: false });
    } catch (error) {
      console.error('Failed to load video:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (video.userLike === 'like') {
        await videos.unlike(id);
        setVideo({ ...video, userLike: null, likesCount: video.likesCount - 1 });
      } else {
        await videos.like(id, { likeType: 'like' });
        setVideo({ ...video, userLike: 'like', likesCount: video.likesCount + 1 });
      }
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (video.channel.isSubscribed) {
        await videoChannels.unsubscribe(video.channel.id);
      } else {
        await videoChannels.subscribe(video.channel.id, {});
      }
      loadVideo();
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await videoComments.add(id, { content: commentText });
      setCommentText('');
      const res = await videoComments.list(id, { limit: 20, sort: 'top' });
      setComments(res.data.comments || []);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const formatViews = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Video not found</p>
          <button onClick={() => navigate('/videos')} className="mt-4 text-red-600 hover:underline">
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-full px-6 py-3 flex items-center space-x-4">
          <button onClick={() => navigate('/videos')} className="text-2xl font-bold text-red-600">
            📹 SupernovaTV
          </button>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <div className="bg-black aspect-video rounded-lg mb-4 flex items-center justify-center">
            <img
              src={video.thumbnailUrl || 'https://via.placeholder.com/1280x720'}
              alt={video.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Video Info */}
          <div className="bg-white rounded-lg p-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {formatViews(video.viewsCount)} views • {new Date(video.publishedAt).toLocaleDateString()}
              </p>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                    video.userLike === 'like' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span>{video.likesCount}</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Channel Info */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-lg">
                  {video.channel?.channelName?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{video.channel?.channelName}</h3>
                  <p className="text-sm text-gray-600">{video.channel?.subscribersCount} subscribers</p>
                </div>
              </div>
              <button
                onClick={handleSubscribe}
                className={`px-6 py-2 rounded-full font-semibold ${
                  video.channel?.isSubscribed
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {video.channel?.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Description */}
            {video.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{video.commentsCount} Comments</h3>

            {/* Add Comment */}
            <form onSubmit={handleComment} className="mb-6">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:border-red-600 focus:outline-none"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => setCommentText('')}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comment
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 flex-shrink-0">
                    {comment.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">{comment.user?.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <button className="text-sm text-gray-600 hover:text-gray-900">
                        👍 {comment.likesCount}
                      </button>
                      <button className="text-sm text-gray-600 hover:text-gray-900">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Recommended */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Up next</h3>
          <div className="space-y-3">
            {recommended.map((rec) => (
              <div
                key={rec.id}
                onClick={() => navigate(`/videos/watch/${rec.id}`)}
                className="flex space-x-2 cursor-pointer group"
              >
                <img
                  src={rec.thumbnailUrl || 'https://via.placeholder.com/168x94'}
                  alt={rec.title}
                  className="w-42 h-24 object-cover rounded group-hover:rounded-none transition-all"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600">{rec.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{rec.channel?.channelName}</p>
                  <p className="text-xs text-gray-500">{formatViews(rec.viewsCount)} views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
