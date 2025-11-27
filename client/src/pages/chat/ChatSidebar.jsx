import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate, getPillarIcon, getPillarColor } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function ChatSidebar({
  conversations,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onUpdateConversation,
  isOpen,
  onToggle,
}) {
  const [search, setSearch] = useState('');
  const [filterPillar, setFilterPillar] = useState('all');

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.title.toLowerCase().includes(search.toLowerCase());
    const matchesPillar = filterPillar === 'all' || conv.pillar === filterPillar;
    return matchesSearch && matchesPillar && !conv.isArchived;
  });

  if (!isOpen) return null;

  return (
    <div className="w-80 border-r bg-gray-50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <Link to="/dashboard">
            <h2 className="text-lg font-heading font-bold gradient-text">
              SUPERNova AI
            </h2>
          </Link>
        </div>

        <Button
          className="w-full mb-4"
          onClick={() => onNewConversation(null)}
        >
          + New Conversation
        </Button>

        {/* Search */}
        <Input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />

        {/* Pillar Filter */}
        <div className="flex gap-2">
          <FilterButton
            active={filterPillar === 'all'}
            onClick={() => setFilterPillar('all')}
          >
            All
          </FilterButton>
          <FilterButton
            active={filterPillar === 'body'}
            onClick={() => setFilterPillar('body')}
          >
            💪
          </FilterButton>
          <FilterButton
            active={filterPillar === 'brain'}
            onClick={() => setFilterPillar('brain')}
          >
            🧠
          </FilterButton>
          <FilterButton
            active={filterPillar === 'business'}
            onClick={() => setFilterPillar('business')}
          >
            💼
          </FilterButton>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === currentConversationId}
                onClick={() => onSelectConversation(conv)}
                onDelete={() => {
                  if (confirm('Delete this conversation?')) {
                    onDeleteConversation(conv.id);
                  }
                }}
                onToggleStar={() => {
                  onUpdateConversation({
                    id: conv.id,
                    isStarred: !conv.isStarred,
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'bg-white border hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
  onToggleStar,
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-primary/10 border-2 border-primary'
          : 'hover:bg-white border border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            {conversation.pillar && (
              <span className="text-sm">
                {getPillarIcon(conversation.pillar)}
              </span>
            )}
            <h3 className="font-medium text-sm truncate">
              {conversation.title}
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            {formatDate(conversation.lastMessageAt)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {conversation.isStarred && <span className="text-yellow-500">⭐</span>}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
          >
            ⋮
          </button>
        </div>
      </div>

      {showMenu && (
        <div
          className="absolute right-2 top-12 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
          >
            {conversation.isStarred ? 'Unstar' : 'Star'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
