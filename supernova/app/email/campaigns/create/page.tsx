'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react';

interface EmailList {
  id: string;
  name: string;
  activeSubscriberCount: number;
}

// Rich Text Editor Component
function RichTextEditor({
  value,
  onChange
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your email content here...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="bg-white/10 border border-white/20 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b border-white/20 bg-white/5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('bold') ? 'bg-white/20' : ''}`}
        >
          <Bold size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('italic') ? 'bg-white/20' : ''}`}
        >
          <Italic size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('bulletList') ? 'bg-white/20' : ''}`}
        >
          <List size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-white/20 ${editor.isActive('orderedList') ? 'bg-white/20' : ''}`}
        >
          <ListOrdered size={18} className="text-white" />
        </button>
        <div className="w-px bg-white/20 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-white/20 disabled:opacity-50"
        >
          <Undo size={18} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-white/20 disabled:opacity-50"
        >
          <Redo size={18} className="text-white" />
        </button>
      </div>
      {/* Editor Content */}
      <EditorContent editor={editor} className="text-white" />
    </div>
  );
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [lists, setLists] = useState<EmailList[]>([]);

  // Campaign data
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [fromName, setFromName] = useState('dAItaniverse');
  const [fromEmail, setFromEmail] = useState('hello@daitaniverse.com');
  const [htmlContent, setHtmlContent] = useState('');
  const [selectedLists, setSelectedLists] = useState<string[]>([]);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await fetch('/api/email/lists');
      const data = await res.json();
      setLists(data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const res = await fetch('/api/email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subject,
          previewText,
          fromName,
          fromEmail,
          htmlContent,
          listIds: selectedLists,
          type: 'BROADCAST'
        })
      });

      if (res.ok) {
        router.push('/email/campaigns');
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  const handleSendNow = async () => {
    if (!confirm(`Send to ${getTotalSubscribers()} subscribers now?`)) return;

    try {
      // Create campaign
      const createRes = await fetch('/api/email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subject,
          previewText,
          fromName,
          fromEmail,
          htmlContent,
          listIds: selectedLists,
          type: 'BROADCAST'
        })
      });

      if (createRes.ok) {
        const campaign = await createRes.json();

        // Send campaign
        await fetch(`/api/email/campaigns/${campaign.id}/send`, {
          method: 'POST'
        });

        router.push('/email/campaigns');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
    }
  };

  const getTotalSubscribers = () => {
    return lists
      .filter(list => selectedLists.includes(list.id))
      .reduce((sum, list) => sum + (list.activeSubscriberCount || 0), 0);
  };

  const toggleList = (listId: string) => {
    setSelectedLists(prev =>
      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'Supernova, sans-serif', color: '#FF008E' }}>
          Create Campaign
        </h1>

        {/* Steps */}
        <div className="flex mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 ${s <= step ? 'bg-gradient-to-r from-pink-500 to-cyan-400' : 'bg-white/20'} ${s > 1 ? 'ml-2' : ''} rounded`}
            />
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8">
          {/* Step 1: Campaign Details */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Campaign Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Weekly Newsletter - Dec 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Your weekly dose of badassery"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preview Text</label>
                  <input
                    type="text"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="Text shown in email preview"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">From Name</label>
                    <input
                      type="text"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">From Email</label>
                    <input
                      type="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!name || !subject}
                  className="px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
                >
                  Next: Compose Email
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Email Content */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Email Content</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Body</label>
                <RichTextEditor value={htmlContent} onChange={setHtmlContent} />
                <p className="text-xs text-gray-400 mt-2">
                  Use variables: {'{{firstName}}'}, {'{{lastName}}'}, {'{{email}}'}
                </p>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!htmlContent}
                  className="px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
                >
                  Next: Select Lists
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Lists */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Select Lists</h2>
              <div className="space-y-3">
                {lists.map((list) => (
                  <label
                    key={list.id}
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLists.includes(list.id)}
                      onChange={() => toggleList(list.id)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">{list.name}</p>
                      <p className="text-sm text-gray-400">{list.activeSubscriberCount} subscribers</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-6 p-4 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
                <p className="text-cyan-300 font-semibold">
                  Total Recipients: {getTotalSubscribers()} subscribers
                </p>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={selectedLists.length === 0}
                  className="px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
                >
                  Next: Review & Send
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Send */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Review & Send</h2>
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400">Campaign Name</p>
                  <p className="text-white font-medium">{name}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400">Subject</p>
                  <p className="text-white font-medium">{subject}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400">Recipients</p>
                  <p className="text-white font-medium">{getTotalSubscribers()} subscribers</p>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20"
                >
                  Back
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveDraft}
                    className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={handleSendNow}
                    className="px-6 py-3 rounded-lg font-semibold"
                    style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
                  >
                    Send Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
