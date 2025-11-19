/**
 * Brand Guidelines
 * Manage brand guidelines and usage rules
 */

import { useState } from 'react';

const GUIDELINE_SECTIONS = [
  { value: 'BRAND_STORY', label: 'Brand Story' },
  { value: 'BRAND_VALUES', label: 'Brand Values' },
  { value: 'BRAND_VOICE', label: 'Brand Voice' },
  { value: 'LOGO_USAGE', label: 'Logo Usage' },
  { value: 'COLOR_USAGE', label: 'Color Usage' },
  { value: 'TYPOGRAPHY', label: 'Typography' },
  { value: 'IMAGERY', label: 'Imagery Style' },
  { value: 'DOS_AND_DONTS', label: "Do's and Don'ts" },
  { value: 'OTHER', label: 'Other' }
];

export default function BrandGuidelines({ brandKit, onRefresh }) {
  const [guidelines, setGuidelines] = useState(brandKit.guidelineSections || []);
  const [showEditor, setShowEditor] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState(null);
  const [guidelineForm, setGuidelineForm] = useState({
    section: 'BRAND_STORY',
    title: '',
    content: ''
  });

  const openEditor = (guideline = null) => {
    if (guideline) {
      setEditingGuideline(guideline);
      setGuidelineForm({
        section: guideline.section,
        title: guideline.title,
        content: guideline.content
      });
    } else {
      setEditingGuideline(null);
      setGuidelineForm({
        section: 'BRAND_STORY',
        title: '',
        content: ''
      });
    }
    setShowEditor(true);
  };

  const saveGuideline = async () => {
    try {
      const data = {
        ...guidelineForm,
        id: editingGuideline?.id
      };

      const response = await fetch(`/api/brand-kits/${brandKit.id}/guidelines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        setShowEditor(false);
        setEditingGuideline(null);
        onRefresh();
      }
    } catch (error) {
      console.error('Error saving guideline:', error);
    }
  };

  const deleteGuideline = async (id) => {
    if (!confirm('Are you sure you want to delete this guideline section?')) return;

    try {
      await fetch(`/api/brand-kits/guidelines/${id}`, {
        method: 'DELETE'
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting guideline:', error);
    }
  };

  const groupedGuidelines = GUIDELINE_SECTIONS.map(section => ({
    ...section,
    guidelines: brandKit.guidelineSections?.filter(g => g.section === section.value) || []
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brand Guidelines</h2>
          <p className="text-gray-400">Document your brand rules and usage</p>
        </div>

        <button
          onClick={() => openEditor()}
          className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-600"
        >
          + Add Section
        </button>
      </div>

      {brandKit.guidelineSections?.length === 0 || !brandKit.guidelineSections ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-bold mb-2">No Guidelines Yet</h3>
          <p className="text-gray-400 mb-4">
            Create brand guidelines to maintain consistency
          </p>
          <button
            onClick={() => openEditor()}
            className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600"
          >
            Create First Section
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedGuidelines.map(section => (
            section.guidelines.length > 0 && (
              <div key={section.value} className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">{section.label}</h3>

                <div className="space-y-4">
                  {section.guidelines.map(guideline => (
                    <div key={guideline.id} className="border-l-4 border-orange-500 pl-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-lg">{guideline.title}</h4>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditor(guideline)}
                            className="text-sm text-gray-400 hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteGuideline(guideline.id)}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="text-gray-300 whitespace-pre-wrap">{guideline.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingGuideline ? 'Edit Guideline' : 'Add Guideline Section'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Section</label>
                <select
                  value={guidelineForm.section}
                  onChange={(e) => setGuidelineForm({ ...guidelineForm, section: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                  disabled={!!editingGuideline}
                >
                  {GUIDELINE_SECTIONS.map(section => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Title</label>
                <input
                  type="text"
                  value={guidelineForm.title}
                  onChange={(e) => setGuidelineForm({ ...guidelineForm, title: e.target.value })}
                  placeholder="e.g., Our Mission"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Content</label>
                <textarea
                  value={guidelineForm.content}
                  onChange={(e) => setGuidelineForm({ ...guidelineForm, content: e.target.value })}
                  placeholder="Write your guideline content here..."
                  rows={12}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 font-mono text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Supports markdown formatting
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveGuideline}
                disabled={!guidelineForm.title || !guidelineForm.content}
                className="flex-1 px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {editingGuideline ? 'Save Changes' : 'Add Section'}
              </button>
              <button
                onClick={() => setShowEditor(false)}
                className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
