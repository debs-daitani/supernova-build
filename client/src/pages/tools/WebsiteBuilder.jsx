import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { websites, websitePages } from '../../services/api';
import toast from 'react-hot-toast';

export default function WebsiteBuilder() {
  const { websiteId } = useParams();
  const [website, setWebsite] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sidebar state
  const [sidebarTab, setSidebarTab] = useState('pages'); // 'pages' or 'blocks' or 'layers'

  // NEW: Editor mode
  const [editorMode, setEditorMode] = useState('block'); // 'block' or 'freeform'

  // NEW: Freeform state
  const [selectedElements, setSelectedElements] = useState([]); // Array of element IDs
  const [draggingElement, setDraggingElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchWebsite();
  }, [websiteId]);

  const fetchWebsite = async () => {
    try {
      const res = await websites.get(websiteId);
      setWebsite(res.data);
      setPages(res.data.pages || []);

      // Select first page by default
      if (res.data.pages && res.data.pages.length > 0) {
        setCurrentPage(res.data.pages[0]);
      }
    } catch (error) {
      console.error('Error fetching website:', error);
      toast.error('Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePage = async () => {
    if (!currentPage) return;

    setSaving(true);
    try {
      await websitePages.update(websiteId, currentPage.id, {
        content: currentPage.content
      });
      toast.success('Page saved!');
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPage = async () => {
    const title = prompt('Page title:');
    if (!title) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      const res = await websitePages.create(websiteId, {
        title,
        slug,
        pageType: 'custom',
        content: { mode: editorMode, blocks: [], elements: [] }
      });

      toast.success('Page created!');
      fetchWebsite();
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Failed to create page');
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!confirm('Delete this page?')) return;

    try {
      await websitePages.delete(websiteId, pageId);
      toast.success('Page deleted');
      fetchWebsite();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  // Switch editor mode
  const handleSwitchMode = (newMode) => {
    if (!currentPage) return;

    if (newMode === editorMode) return;

    // Warn when switching from freeform to block
    if (editorMode === 'freeform' && newMode === 'block') {
      if (!confirm('⚠️ Converting to Block Mode will attempt to convert your freeform layout. Complex overlapping elements may not convert perfectly. Continue?')) {
        return;
      }
    }

    // Warn when switching from block to freeform
    if (editorMode === 'block' && newMode === 'freeform') {
      if (!confirm('🎨 Switching to Freeform Mode gives you total creative freedom but requires manual responsive design. Continue?')) {
        return;
      }
    }

    setEditorMode(newMode);

    // Update page content mode
    setCurrentPage({
      ...currentPage,
      content: {
        ...currentPage.content,
        mode: newMode
      }
    });

    toast.success(`Switched to ${newMode === 'block' ? 'Block' : 'Freeform'} Mode`);
  };

  // BLOCK MODE: Add block
  const handleAddBlock = (blockType) => {
    if (!currentPage) return;

    if (editorMode === 'freeform') {
      // In freeform, add as element with absolute positioning
      const newElement = createFreeformElement(blockType);
      setCurrentPage({
        ...currentPage,
        content: {
          ...currentPage.content,
          elements: [...(currentPage.content.elements || []), newElement]
        }
      });
    } else {
      // In block mode, add as block
      const newBlock = createBlockTemplate(blockType);
      setCurrentPage({
        ...currentPage,
        content: {
          ...currentPage.content,
          blocks: [...(currentPage.content.blocks || []), newBlock]
        }
      });
    }

    toast.success('Element added! Remember to save.');
  };

  const createBlockTemplate = (type) => {
    const id = `block-${Date.now()}`;

    switch (type) {
      case 'section':
        return {
          id,
          type: 'section',
          props: {
            backgroundColor: '#FFFFFF',
            padding: '60px 20px',
            textAlign: 'left'
          },
          children: []
        };
      case 'heading':
        return {
          id,
          type: 'heading',
          props: {
            text: 'Your Heading Here',
            level: 'h2',
            color: '#1F2937',
            fontSize: '36px'
          }
        };
      case 'paragraph':
        return {
          id,
          type: 'paragraph',
          props: {
            text: 'Your paragraph text here...',
            color: '#4B5563',
            fontSize: '16px'
          }
        };
      case 'button':
        return {
          id,
          type: 'button',
          props: {
            text: 'Click Me',
            link: '#',
            backgroundColor: '#FF1493',
            color: '#FFFFFF'
          }
        };
      case 'image':
        return {
          id,
          type: 'image',
          props: {
            src: 'https://via.placeholder.com/800x400',
            alt: 'Image description',
            width: '100%'
          }
        };
      default:
        return { id, type, props: {} };
    }
  };

  // FREEFORM MODE: Create element with absolute positioning
  const createFreeformElement = (type) => {
    const id = `elem-${Date.now()}`;
    const baseTemplate = createBlockTemplate(type);

    // Find highest z-index
    const maxZ = (currentPage.content.elements || []).reduce((max, el) =>
      Math.max(max, el.position?.zIndex || 0), 0);

    return {
      ...baseTemplate,
      position: {
        x: 100, // Default position
        y: 100,
        width: type === 'image' ? 400 : type === 'button' ? 200 : 300,
        height: type === 'image' ? 300 : 'auto',
        zIndex: maxZ + 1
      }
    };
  };

  // FREEFORM: Start dragging element
  const handleElementMouseDown = (e, elementId) => {
    if (editorMode !== 'freeform') return;

    e.stopPropagation();

    const element = currentPage.content.elements.find(el => el.id === elementId);
    if (!element) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();

    setDraggingElement(elementId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setSelectedElements([elementId]);
  };

  // FREEFORM: Mouse move (dragging)
  const handleCanvasMouseMove = (e) => {
    if (!draggingElement || editorMode !== 'freeform') return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    // Update element position
    setCurrentPage({
      ...currentPage,
      content: {
        ...currentPage.content,
        elements: currentPage.content.elements.map(el =>
          el.id === draggingElement
            ? { ...el, position: { ...el.position, x: Math.max(0, newX), y: Math.max(0, newY) } }
            : el
        )
      }
    });
  };

  // FREEFORM: Mouse up (stop dragging)
  const handleCanvasMouseUp = () => {
    setDraggingElement(null);
  };

  // FREEFORM: Delete element
  const handleDeleteElement = (elementId) => {
    if (editorMode === 'freeform') {
      setCurrentPage({
        ...currentPage,
        content: {
          ...currentPage.content,
          elements: currentPage.content.elements.filter(el => el.id !== elementId)
        }
      });
    } else {
      setCurrentPage({
        ...currentPage,
        content: {
          ...currentPage.content,
          blocks: currentPage.content.blocks.filter(b => b.id !== elementId)
        }
      });
    }
    toast.success('Element removed! Remember to save.');
  };

  // FREEFORM: Update element position/size
  const handleUpdateElementPosition = (elementId, updates) => {
    setCurrentPage({
      ...currentPage,
      content: {
        ...currentPage.content,
        elements: currentPage.content.elements.map(el =>
          el.id === elementId
            ? { ...el, position: { ...el.position, ...updates } }
            : el
        )
      }
    });
  };

  // FREEFORM: Bring to front/back
  const handleBringToFront = (elementId) => {
    const maxZ = currentPage.content.elements.reduce((max, el) =>
      Math.max(max, el.position?.zIndex || 0), 0);

    handleUpdateElementPosition(elementId, { zIndex: maxZ + 1 });
    toast.success('Brought to front');
  };

  const handleSendToBack = (elementId) => {
    handleUpdateElementPosition(elementId, { zIndex: 1 });
    toast.success('Sent to back');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Website not found</h2>
          <Link to="/tools/websites" className="text-pink-600 hover:underline">
            Back to Websites
          </Link>
        </div>
      </div>
    );
  }

  const currentMode = currentPage?.content?.mode || editorMode;
  const isBlock Mode = currentMode === 'block';
  const isFreeformMode = currentMode === 'freeform';

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/tools/websites" className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
          <div>
            <h1 className="font-bold text-gray-900">{website.name}</h1>
            <div className="text-xs text-gray-500">{currentPage?.title || 'No page selected'}</div>
          </div>
        </div>

        {/* MODE TOGGLE */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => handleSwitchMode('block')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isBlockMode
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📦 Block Mode
            </button>
            <button
              onClick={() => handleSwitchMode('freeform')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isFreeformMode
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              🎨 Freeform Mode
            </button>
          </div>

          <Link
            to={`/tools/websites/${websiteId}/settings`}
            className="btn-secondary text-sm"
          >
            Settings
          </Link>
          <button
            onClick={handleSavePage}
            disabled={saving || !currentPage}
            className="btn-primary text-sm"
          >
            {saving ? 'Saving...' : 'Save Page'}
          </button>
          {website.subdomain && (
            <a
              href={`https://${website.subdomain}.daitaniverse.space`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm"
            >
              Preview 🔗
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-gray-50 border-r overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setSidebarTab('pages')}
              className={`flex-1 py-3 text-sm font-medium ${
                sidebarTab === 'pages'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600'
              }`}
            >
              Pages
            </button>
            <button
              onClick={() => setSidebarTab('blocks')}
              className={`flex-1 py-3 text-sm font-medium ${
                sidebarTab === 'blocks'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600'
              }`}
            >
              Add
            </button>
            {isFreeformMode && (
              <button
                onClick={() => setSidebarTab('layers')}
                className={`flex-1 py-3 text-sm font-medium ${
                  sidebarTab === 'layers'
                    ? 'text-pink-600 border-b-2 border-pink-600'
                    : 'text-gray-600'
                }`}
              >
                Layers
              </button>
            )}
          </div>

          {/* Pages Tab */}
          {sidebarTab === 'pages' && (
            <div className="p-4">
              <button
                onClick={handleAddPage}
                className="w-full btn-primary text-sm mb-3"
              >
                + New Page
              </button>

              <div className="space-y-2">
                {pages.map(page => (
                  <div
                    key={page.id}
                    className={`p-3 rounded cursor-pointer ${
                      currentPage?.id === page.id
                        ? 'bg-pink-100 border-2 border-pink-600'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    <div className="font-medium text-sm">{page.title}</div>
                    <div className="text-xs text-gray-500">/{page.slug}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Mode: {page.content?.mode || 'block'}
                    </div>
                    {currentPage?.id === page.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePage(page.id);
                        }}
                        className="text-xs text-red-600 hover:underline mt-1"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blocks Tab */}
          {sidebarTab === 'blocks' && (
            <div className="p-4">
              <p className="text-xs text-gray-600 mb-4">
                {isFreeformMode
                  ? 'Click to add elements (will be positioned at 100, 100)'
                  : 'Click to add blocks to your page'}
              </p>

              <div className="space-y-2">
                <BlockButton
                  icon="📦"
                  label="Section"
                  description="Container for content"
                  onClick={() => handleAddBlock('section')}
                />
                <BlockButton
                  icon="📝"
                  label="Heading"
                  description="H1, H2, H3, etc."
                  onClick={() => handleAddBlock('heading')}
                />
                <BlockButton
                  icon="📄"
                  label="Paragraph"
                  description="Text content"
                  onClick={() => handleAddBlock('paragraph')}
                />
                <BlockButton
                  icon="🔘"
                  label="Button"
                  description="Call to action"
                  onClick={() => handleAddBlock('button')}
                />
                <BlockButton
                  icon="🖼️"
                  label="Image"
                  description="Photo or graphic"
                  onClick={() => handleAddBlock('image')}
                />
                <BlockButton
                  icon="➖"
                  label="Divider"
                  description="Horizontal line"
                  onClick={() => handleAddBlock('divider')}
                />
              </div>
            </div>
          )}

          {/* Layers Tab (Freeform only) */}
          {sidebarTab === 'layers' && isFreeformMode && (
            <LayersPanel
              elements={currentPage?.content?.elements || []}
              selectedElements={selectedElements}
              onSelect={setSelectedElements}
              onBringToFront={handleBringToFront}
              onSendToBack={handleSendToBack}
              onDelete={handleDeleteElement}
            />
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          {currentPage ? (
            <div className="max-w-4xl mx-auto">
              {isBlockMode ? (
                <BlockCanvas
                  page={currentPage}
                  onDeleteBlock={handleDeleteElement}
                />
              ) : (
                <FreeformCanvas
                  page={currentPage}
                  canvasRef={canvasRef}
                  selectedElements={selectedElements}
                  onElementMouseDown={handleElementMouseDown}
                  onCanvasMouseMove={handleCanvasMouseMove}
                  onCanvasMouseUp={handleCanvasMouseUp}
                  onDeleteElement={handleDeleteElement}
                  onUpdatePosition={handleUpdateElementPosition}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <p>Select a page from the sidebar to start editing</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties (Freeform only, when element selected) */}
        {isFreeformMode && selectedElements.length === 1 && currentPage && (
          <PropertiesPanel
            element={currentPage.content.elements.find(el => el.id === selectedElements[0])}
            onUpdatePosition={handleUpdateElementPosition}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
          />
        )}
      </div>
    </div>
  );
}

// Block Canvas (original structured mode)
function BlockCanvas({ page, onDeleteBlock }) {
  if (!page.content?.blocks || page.content.blocks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg min-h-screen p-8">
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🎨</div>
          <p>This page is empty. Add blocks from the sidebar to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg min-h-screen p-8">
      <div className="space-y-4">
        {page.content.blocks.map((block, index) => (
          <div
            key={block.id}
            className="relative border-2 border-dashed border-gray-300 hover:border-pink-500 rounded p-4 group"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onDeleteBlock(block.id)}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Delete
              </button>
            </div>

            <BlockPreview block={block} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Freeform Canvas (absolute positioning mode)
function FreeformCanvas({
  page,
  canvasRef,
  selectedElements,
  onElementMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onDeleteElement,
  onUpdatePosition
}) {
  const elements = page.content?.elements || [];

  if (elements.length === 0) {
    return (
      <div
        ref={canvasRef}
        className="bg-white rounded-lg shadow-lg relative"
        style={{ minHeight: '1000px' }}
        onMouseMove={onCanvasMouseMove}
        onMouseUp={onCanvasMouseUp}
      >
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🎨</div>
          <p>Freeform mode: Drop elements anywhere!</p>
          <p className="text-sm mt-2">Elements will have absolute positioning</p>
        </div>
      </div>
    );
  }

  // Sort by z-index for rendering
  const sortedElements = [...elements].sort((a, b) =>
    (a.position?.zIndex || 0) - (b.position?.zIndex || 0)
  );

  return (
    <div
      ref={canvasRef}
      className="bg-white rounded-lg shadow-lg relative"
      style={{ minHeight: '1000px' }}
      onMouseMove={onCanvasMouseMove}
      onMouseUp={onCanvasMouseUp}
    >
      {sortedElements.map(element => {
        const isSelected = selectedElements.includes(element.id);
        const pos = element.position || { x: 0, y: 0, width: 300, height: 'auto', zIndex: 1 };

        return (
          <div
            key={element.id}
            className={`absolute cursor-move group ${
              isSelected ? 'ring-2 ring-pink-500' : ''
            }`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: typeof pos.width === 'number' ? `${pos.width}px` : pos.width,
              height: typeof pos.height === 'number' ? `${pos.height}px` : pos.height,
              zIndex: pos.zIndex || 1
            }}
            onMouseDown={(e) => onElementMouseDown(e, element.id)}
          >
            {/* Position indicator */}
            <div className="absolute -top-6 left-0 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              x: {Math.round(pos.x)}, y: {Math.round(pos.y)} | z: {pos.zIndex}
            </div>

            {/* Delete button */}
            <button
              onClick={() => onDeleteElement(element.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              ×
            </button>

            {/* Content */}
            <div className="border-2 border-dashed border-gray-300 group-hover:border-pink-500 p-2">
              <BlockPreview block={element} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Layers Panel (shows z-index order)
function LayersPanel({ elements, selectedElements, onSelect, onBringToFront, onSendToBack, onDelete }) {
  const sortedElements = [...elements].sort((a, b) =>
    (b.position?.zIndex || 0) - (a.position?.zIndex || 0)
  );

  return (
    <div className="p-4">
      <h3 className="font-semibold text-sm mb-3">Layers (Z-Index Order)</h3>
      <div className="space-y-1">
        {sortedElements.map(element => (
          <div
            key={element.id}
            className={`p-2 rounded text-sm cursor-pointer ${
              selectedElements.includes(element.id)
                ? 'bg-pink-100 border border-pink-600'
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onSelect([element.id])}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {element.type} (z:{element.position?.zIndex || 0})
              </span>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBringToFront(element.id);
                  }}
                  className="text-xs px-1 hover:bg-gray-200 rounded"
                  title="Bring to front"
                >
                  ⬆
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendToBack(element.id);
                  }}
                  className="text-xs px-1 hover:bg-gray-200 rounded"
                  title="Send to back"
                >
                  ⬇
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(element.id);
                  }}
                  className="text-xs px-1 hover:bg-red-200 rounded text-red-600"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              x:{Math.round(element.position?.x || 0)}, y:{Math.round(element.position?.y || 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Properties Panel (right sidebar for selected element)
function PropertiesPanel({ element, onUpdatePosition, onBringToFront, onSendToBack }) {
  if (!element) return null;

  const pos = element.position || {};

  return (
    <div className="w-64 bg-gray-50 border-l overflow-y-auto p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Properties</h3>

      <div className="space-y-4">
        {/* Position */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">X Position (px)</label>
          <input
            type="number"
            value={Math.round(pos.x || 0)}
            onChange={(e) => onUpdatePosition(element.id, { x: parseInt(e.target.value) || 0 })}
            className="input text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Y Position (px)</label>
          <input
            type="number"
            value={Math.round(pos.y || 0)}
            onChange={(e) => onUpdatePosition(element.id, { y: parseInt(e.target.value) || 0 })}
            className="input text-sm"
          />
        </div>

        {/* Size */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Width (px)</label>
          <input
            type="number"
            value={typeof pos.width === 'number' ? pos.width : 300}
            onChange={(e) => onUpdatePosition(element.id, { width: parseInt(e.target.value) || 300 })}
            className="input text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
          <input
            type="text"
            value={pos.height || 'auto'}
            onChange={(e) => onUpdatePosition(element.id, { height: e.target.value })}
            className="input text-sm"
            placeholder="auto or px value"
          />
        </div>

        {/* Z-Index */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Z-Index (Layer)</label>
          <input
            type="number"
            value={pos.zIndex || 1}
            onChange={(e) => onUpdatePosition(element.id, { zIndex: parseInt(e.target.value) || 1 })}
            className="input text-sm"
          />
        </div>

        {/* Quick Actions */}
        <div className="pt-3 border-t space-y-2">
          <button
            onClick={() => onBringToFront(element.id)}
            className="w-full btn-secondary text-sm"
          >
            ⬆ Bring to Front
          </button>
          <button
            onClick={() => onSendToBack(element.id)}
            className="w-full btn-secondary text-sm"
          >
            ⬇ Send to Back
          </button>
        </div>
      </div>
    </div>
  );
}

// Block Button (add to palette)
function BlockButton({ icon, label, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 bg-white hover:bg-gray-50 rounded border border-gray-200 hover:border-pink-500 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </div>
    </button>
  );
}

// Block Preview (renders block content)
function BlockPreview({ block }) {
  const { type, props = {}, children = [] } = block;

  switch (type) {
    case 'section':
      return (
        <div
          style={{
            backgroundColor: props.backgroundColor,
            padding: props.padding,
            textAlign: props.textAlign
          }}
        >
          <div className="text-xs font-mono text-gray-400 mb-2">SECTION</div>
          {children.length > 0 ? (
            children.map(child => <BlockPreview key={child.id} block={child} />)
          ) : (
            <p className="text-gray-400 text-sm">Empty section</p>
          )}
        </div>
      );

    case 'heading':
      const HeadingTag = props.level || 'h2';
      return (
        <>
          <div className="text-xs font-mono text-gray-400 mb-2">HEADING ({props.level})</div>
          <HeadingTag
            style={{
              color: props.color,
              fontSize: props.fontSize,
              fontWeight: props.fontWeight,
              textAlign: props.textAlign
            }}
          >
            {props.text || 'Heading'}
          </HeadingTag>
        </>
      );

    case 'paragraph':
      return (
        <>
          <div className="text-xs font-mono text-gray-400 mb-2">PARAGRAPH</div>
          <p
            style={{
              color: props.color,
              fontSize: props.fontSize,
              textAlign: props.textAlign
            }}
          >
            {props.text || 'Paragraph text'}
          </p>
        </>
      );

    case 'button':
      return (
        <>
          <div className="text-xs font-mono text-gray-400 mb-2">BUTTON</div>
          <a
            href={props.link || '#'}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: props.backgroundColor || '#FF1493',
              color: props.color || '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 600
            }}
          >
            {props.text || 'Button'}
          </a>
        </>
      );

    case 'image':
      return (
        <>
          <div className="text-xs font-mono text-gray-400 mb-2">IMAGE</div>
          <img
            src={props.src || 'https://via.placeholder.com/800x400'}
            alt={props.alt || ''}
            style={{
              width: props.width,
              height: props.height,
              borderRadius: props.borderRadius
            }}
          />
        </>
      );

    case 'divider':
      return (
        <>
          <div className="text-xs font-mono text-gray-400 mb-2">DIVIDER</div>
          <hr style={{ margin: props.margin || '20px 0', borderTop: '1px solid #E5E7EB' }} />
        </>
      );

    default:
      return (
        <div className="text-gray-400">
          Unknown block type: {type}
        </div>
      );
  }
}
