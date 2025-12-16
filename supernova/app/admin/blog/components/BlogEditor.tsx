'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Check,
} from 'lucide-react';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  publishedAt: string | null;
  metaTitle: string;
  metaDescription: string;
}

interface BlogEditorProps {
  post?: BlogPost;
  isEditing?: boolean;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Rich Text Editor Component
function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Write your blog post content here...',
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#00F0E9] underline' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg my-4' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[400px] p-4 focus:outline-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#FF008E] [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:bg-white/10 [&_pre]:p-4 [&_pre]:rounded-lg',
      },
    },
  });

  const insertLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkModal(false);
    }
  }, [linkUrl, editor]);

  const insertImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageModal(false);
    }
  }, [imageUrl, editor]);

  if (!editor) return null;

  return (
    <div className="bg-white/10 border border-white/20 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-white/20 bg-white/5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('bold') ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Bold"
        >
          <Bold size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('italic') ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Italic"
        >
          <Italic size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('underline') ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Underline"
        >
          <UnderlineIcon size={18} className="text-white" />
        </button>

        <div className="w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('heading', { level: 1 }) ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('heading', { level: 2 }) ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('heading', { level: 3 }) ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={18} className="text-white" />
        </button>

        <div className="w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive({ textAlign: 'left' }) ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Align Left"
        >
          <AlignLeft size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive({ textAlign: 'center' }) ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Align Center"
        >
          <AlignCenter size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive({ textAlign: 'right' }) ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Align Right"
        >
          <AlignRight size={18} className="text-white" />
        </button>

        <div className="w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('bulletList') ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Bullet List"
        >
          <List size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('orderedList') ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Numbered List"
        >
          <ListOrdered size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('blockquote') ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Blockquote"
        >
          <Quote size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('codeBlock') ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Code Block"
        >
          <Code size={18} className="text-white" />
        </button>

        <div className="w-px bg-white/20 mx-1" />

        <button
          type="button"
          onClick={() => setShowLinkModal(true)}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('link') ? 'bg-white/30 ring-1 ring-[#00F0E9]' : ''}`}
          title="Insert Link"
        >
          <LinkIcon size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          className="p-2 rounded hover:bg-white/20"
          title="Insert Image"
        >
          <ImageIcon size={18} className="text-white" />
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-white/20 disabled:opacity-50"
          title="Undo"
        >
          <Undo size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-white/20 disabled:opacity-50"
          title="Redo"
        >
          <Redo size={18} className="text-white" />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="text-white" />

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && insertLink()}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="px-4 py-2 bg-[#00F0E9] text-black rounded-lg font-medium"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Insert Image</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && insertImage()}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertImage}
                className="px-4 py-2 bg-[#00F0E9] text-black rounded-lg font-medium"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogEditor({ post, isEditing = false }: BlogEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<BlogPost>({
    title: post?.title || '',
    slug: post?.slug || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    featuredImage: post?.featuredImage || '',
    status: post?.status || 'DRAFT',
    publishedAt: post?.publishedAt || null,
    metaTitle: post?.metaTitle || '',
    metaDescription: post?.metaDescription || '',
  });

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title),
    }));
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!formData.title || !formData.content) {
      setError('Title and content are required');
      return;
    }

    const isPublishing = status === 'PUBLISHED';
    if (isPublishing) {
      setPublishing(true);
    } else {
      setSaving(true);
    }
    setError('');
    setSuccess('');

    try {
      const url = isEditing ? `/api/blog/${post?.id}` : '/api/blog';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status,
          publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : formData.publishedAt,
        }),
      });

      if (res.ok) {
        const savedPost = await res.json();
        setSuccess(status === 'PUBLISHED' ? 'Published!' : 'Saved as draft');
        setTimeout(() => {
          router.push('/admin/blog');
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      setError('Failed to save post');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  return (
    <div className="text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/admin/blog"
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm"
            >
              <ArrowLeft size={16} /> Back to Blog
            </Link>
            <h1 className="text-3xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-teal to-neon-lime">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {formData.status === 'PUBLISHED' && post?.slug && (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                <Eye size={18} /> View
              </Link>
            )}
            <button
              onClick={() => handleSave('DRAFT')}
              disabled={saving || publishing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Draft
            </button>
            <button
              onClick={() => handleSave('PUBLISHED')}
              disabled={saving || publishing}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
            >
              {publishing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              Publish
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 flex items-center gap-2">
            <Check size={18} /> {success}
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-xl font-semibold placeholder-gray-500 focus:outline-none focus:border-[#00F0E9]"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">/blog/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="url-friendly-slug"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0E9]"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Featured Image URL</label>
            <input
              type="url"
              value={formData.featuredImage}
              onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0E9]"
            />
            {formData.featuredImage && (
              <img
                src={formData.featuredImage}
                alt="Featured"
                className="mt-3 max-h-48 rounded-lg object-cover"
              />
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt / Summary</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Brief summary for previews..."
              rows={3}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0E9] resize-none"
            />
          </div>

          {/* SEO Section */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="SEO title (defaults to post title)"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0E9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Meta Description</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="SEO description (defaults to excerpt)"
                  rows={2}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0E9] resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
