import { useState } from 'react';
import { aiImages, aiVideos } from '../../services/api';
import toast from 'react-hot-toast';

/**
 * ImagePreview - Display generated AI image with actions
 */
export function ImagePreview({ imageData, onSave, onDownload, onRegenerate }) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await aiImages.save(imageData.imageId);
      toast.success('Image saved to library!');
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save image');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = imageData.imageUrl;
    link.download = `generated-image-${imageData.imageId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloading image...');
    if (onDownload) onDownload();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(imageData.imageUrl);
    toast.success('Image URL copied to clipboard!');
  };

  return (
    <div className="my-4 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-md max-w-2xl">
      {/* Image */}
      <div className="relative group">
        <img
          src={imageData.imageUrl}
          alt={imageData.prompt}
          className="w-full h-auto"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="text-sm text-gray-600 mb-3">
          <strong>Prompt:</strong> {imageData.prompt}
        </div>

        {imageData.enhancedPrompt && imageData.enhancedPrompt !== imageData.prompt && (
          <details className="text-xs text-gray-500 mb-3">
            <summary className="cursor-pointer hover:text-gray-700">View enhanced prompt</summary>
            <p className="mt-2">{imageData.enhancedPrompt}</p>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm flex items-center gap-1"
            title="Save to library"
          >
            💾 {saving ? 'Saving...' : 'Save'}
          </button>

          <button
            onClick={handleDownload}
            className="btn-secondary text-sm flex items-center gap-1"
            title="Download image"
          >
            ⬇️ Download
          </button>

          <button
            onClick={handleCopyUrl}
            className="btn-secondary text-sm flex items-center gap-1"
            title="Copy image URL"
          >
            🔗 Copy URL
          </button>

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="btn-secondary text-sm flex items-center gap-1"
              title="Generate a new version"
            >
              🔄 Regenerate
            </button>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-3 pt-3 border-t text-xs text-gray-500 flex items-center gap-4">
          <span>Size: {imageData.size}</span>
          <span>Style: {imageData.style}</span>
          <span>Model: DALL-E 3</span>
        </div>
      </div>
    </div>
  );
}

/**
 * VideoPreview - Display generated AI video with actions
 */
export function VideoPreview({ videoData, onSave, onDownload, onCheckStatus }) {
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);

  const { status, videoUrl, thumbnailUrl, prompt, duration, estimatedTime } = videoData;

  const handleSave = async () => {
    setSaving(true);
    try {
      await aiVideos.save(videoData.videoId);
      toast.success('Video saved to library!');
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Failed to save video');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) {
      toast.error('Video not ready yet');
      return;
    }

    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `generated-video-${videoData.videoId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloading video...');
    if (onDownload) onDownload();
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const response = await aiVideos.getStatus(videoData.videoId);
      if (onCheckStatus) onCheckStatus(response);

      if (response.status === 'completed') {
        toast.success('Video is ready!');
      } else if (response.status === 'processing') {
        toast('Video still processing...', { icon: '⏳' });
      } else if (response.status === 'failed') {
        toast.error('Video generation failed');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      toast.error('Failed to check status');
    } finally {
      setChecking(false);
    }
  };

  // Processing view
  if (status === 'processing') {
    return (
      <div className="my-4 rounded-lg border border-gray-200 p-6 bg-white shadow-md max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">🎬 Generating your video...</h3>
            <p className="text-sm text-gray-600 mb-2">{prompt}</p>
            <div className="text-xs text-gray-500 mb-3">
              Estimated time: ~{Math.ceil(estimatedTime / 60)} minutes
            </div>
            <p className="text-xs text-gray-500 mb-4">
              This takes a while! You can continue chatting, and I'll notify you when it's ready.
            </p>
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="btn-secondary text-sm"
            >
              {checking ? 'Checking...' : '🔄 Check Status'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed view
  if (status === 'failed') {
    return (
      <div className="my-4 rounded-lg border border-red-200 p-6 bg-red-50 shadow-md max-w-2xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Video generation failed</h3>
            <p className="text-sm text-red-700 mb-2">{prompt}</p>
            {videoData.errorMessage && (
              <p className="text-xs text-red-600">{videoData.errorMessage}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Completed view
  return (
    <div className="my-4 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-md max-w-2xl">
      {/* Video Player */}
      <div className="relative bg-black">
        <video
          src={videoUrl}
          poster={thumbnailUrl}
          controls
          className="w-full h-auto"
        >
          Your browser doesn't support video playback.
        </video>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="text-sm text-gray-600 mb-3">
          <strong>Prompt:</strong> {prompt}
        </div>

        {videoData.enhancedPrompt && (
          <details className="text-xs text-gray-500 mb-3">
            <summary className="cursor-pointer hover:text-gray-700">View enhanced prompt</summary>
            <p className="mt-2">{videoData.enhancedPrompt}</p>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm flex items-center gap-1"
          >
            💾 {saving ? 'Saving...' : 'Save'}
          </button>

          <button
            onClick={handleDownload}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            ⬇️ Download
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(videoUrl);
              toast.success('Video URL copied!');
            }}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            🔗 Copy URL
          </button>
        </div>

        {/* Metadata */}
        <div className="mt-3 pt-3 border-t text-xs text-gray-500 flex items-center gap-4">
          <span>Duration: {duration}s</span>
          <span>Resolution: {videoData.resolution}</span>
          <span>Model: {videoData.model || 'AI Video'}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * MediaPreview - Auto-detect type and render appropriate preview
 */
export default function MediaPreview({ data, type, ...props }) {
  if (type === 'image' || data.imageId) {
    return <ImagePreview imageData={data} {...props} />;
  }

  if (type === 'video' || data.videoId) {
    return <VideoPreview videoData={data} {...props} />;
  }

  return null;
}
