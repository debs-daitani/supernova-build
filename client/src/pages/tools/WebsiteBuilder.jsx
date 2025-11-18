import { useState, useEffect } from 'react';
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
  const [sidebarTab, setSidebarTab] = useState('pages'); // 'pages' or 'blocks'

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
        content: { blocks: [] }
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

  const handleAddBlock = (blockType) => {
    if (!currentPage) return;

    const newBlock = createBlockTemplate(blockType);

    setCurrentPage({
      ...currentPage,
      content: {
        ...currentPage.content,
        blocks: [...(currentPage.content.blocks || []), newBlock]
      }
    });

    toast.success('Block added! Remember to save.');
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

  const handleDeleteBlock = (blockId) => {
    if (!currentPage) return;

    setCurrentPage({
      ...currentPage,
      content: {
        ...currentPage.content,
        blocks: currentPage.content.blocks.filter(b => b.id !== blockId)
      }
    });

    toast.success('Block removed! Remember to save.');
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

        <div className="flex items-center gap-3">
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
              Add Blocks
            </button>
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
                Click to add blocks to your page
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
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          {currentPage ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg min-h-screen p-8">
                {currentPage.content?.blocks?.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <div className="text-6xl mb-4">🎨</div>
                    <p>This page is empty. Add blocks from the sidebar to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentPage.content.blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className="relative border-2 border-dashed border-gray-300 hover:border-pink-500 rounded p-4 group"
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDeleteBlock(block.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>

                        <BlockPreview block={block} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
      </div>
    </div>
  );
}

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
            <p className="text-gray-400 text-sm">Empty section - add child blocks</p>
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
