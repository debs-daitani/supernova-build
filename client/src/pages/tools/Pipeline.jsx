import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { crmDeals, crmContacts } from '../../services/api';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-gray-100', icon: '🎯' },
  { id: 'qualified', name: 'Qualified', color: 'bg-blue-100', icon: '✅' },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-100', icon: '📄' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-100', icon: '🤝' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-green-100', icon: '🎉' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-100', icon: '❌' },
];

export default function Pipeline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState(null);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowCreateModal(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dealsRes, contactsRes] = await Promise.all([
        crmDeals.list(),
        crmContacts.list(),
      ]);
      setDeals(dealsRes.data);
      setContacts(contactsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (stage) => {
    if (!draggedDeal || draggedDeal.stage === stage) {
      setDraggedDeal(null);
      return;
    }

    try {
      await crmDeals.update(draggedDeal.id, { stage });
      toast.success(`Deal moved to ${STAGES.find(s => s.id === stage)?.name}`);
      loadData();
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error('Failed to move deal');
    } finally {
      setDraggedDeal(null);
    }
  };

  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const getTotalValue = () => {
    return deals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const getWeightedValue = () => {
    return deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Sales Pipeline</h1>
            <p className="text-gray-600 text-sm">Drag and drop deals to move them between stages</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span>➕</span>
            New Deal
          </button>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Total Pipeline Value</p>
            <p className="text-2xl font-bold">£{getTotalValue().toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Weighted Value</p>
            <p className="text-2xl font-bold">£{getWeightedValue().toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Total Deals</p>
            <p className="text-2xl font-bold">{deals.length}</p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full" style={{ minWidth: 'max-content' }}>
          {STAGES.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                {/* Column Header */}
                <div className={`${stage.color} p-4 rounded-t-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">
                      {stage.icon} {stage.name}
                    </h3>
                    <span className="text-xs bg-white px-2 py-1 rounded-full font-medium">
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    £{stageValue.toLocaleString()}
                  </p>
                </div>

                {/* Deals List */}
                <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                  {stageDeals.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No deals</p>
                  ) : (
                    stageDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        contacts={contacts}
                        onDragStart={() => handleDragStart(deal)}
                        onUpdate={loadData}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Deal Modal */}
      {showCreateModal && (
        <CreateDealModal
          contacts={contacts}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function DealCard({ deal, contacts, onDragStart, onUpdate }) {
  const [showDetails, setShowDetails] = useState(false);

  const contact = contacts.find(c => c.id === deal.contactId);

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        onClick={() => setShowDetails(true)}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <h4 className="font-semibold text-gray-900 mb-2">{deal.title}</h4>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Value</span>
            <span className="font-bold text-pink-600">£{deal.value.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Probability</span>
            <span className="font-medium">{deal.probability}%</span>
          </div>

          {contact && (
            <div className="flex items-center gap-2 text-gray-600 pt-2 border-t">
              <span>👤</span>
              <span className="text-xs">{contact.firstName} {contact.lastName}</span>
            </div>
          )}

          {deal.expectedCloseDate && (
            <div className="text-xs text-gray-500 pt-1">
              Expected close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Deal Details Modal */}
      {showDetails && (
        <DealDetailsModal
          deal={deal}
          contact={contact}
          onClose={() => setShowDetails(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}

function CreateDealModal({ contacts, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    contactId: '',
    title: '',
    value: '',
    currency: 'GBP',
    stage: 'lead',
    probability: 0,
    expectedCloseDate: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contactId || !formData.title || !formData.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await crmDeals.create({
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability),
        expectedCloseDate: formData.expectedCloseDate || null,
      });
      toast.success('Deal created!');
      onSuccess();
    } catch (error) {
      console.error('Error creating deal:', error);
      toast.error('Failed to create deal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Create New Deal</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Contact *</label>
              <select
                value={formData.contactId}
                onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Select contact...</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName} {contact.company && `(${contact.company})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Deal Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Enterprise License - Acme Corp"
                className="input w-full"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Value (£) *</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="10000"
                  className="input w-full"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label">Probability (%)</label>
                <input
                  type="number"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                  className="input w-full"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="input w-full"
                >
                  {STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Expected Close Date</label>
                <input
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="input w-full"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Creating...' : 'Create Deal'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function DealDetailsModal({ deal, contact, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(deal);

  const handleSave = async () => {
    try {
      await crmDeals.update(deal.id, {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability),
      });
      toast.success('Deal updated!');
      setEditing(false);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error('Failed to update deal');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      await crmDeals.delete(deal.id);
      toast.success('Deal deleted');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast.error('Failed to delete deal');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{deal.title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Value</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="label">Probability (%)</label>
                  <input
                    type="number"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                    className="input w-full"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="btn-primary flex-1">
                  Save Changes
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-pink-600 mb-2">
                  £{deal.value.toLocaleString()}
                </p>
                <p className="text-gray-600">Probability: {deal.probability}%</p>
              </div>

              {contact && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Contact</p>
                  <p className="font-medium">
                    {contact.firstName} {contact.lastName}
                  </p>
                  {contact.company && <p className="text-sm text-gray-600">{contact.company}</p>}
                </div>
              )}

              {deal.expectedCloseDate && (
                <div>
                  <p className="text-sm text-gray-600">Expected Close Date</p>
                  <p className="font-medium">{new Date(deal.expectedCloseDate).toLocaleDateString()}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditing(true)} className="btn-primary flex-1">
                  ✏️ Edit
                </button>
                <button onClick={handleDelete} className="btn-secondary text-red-600">
                  🗑️ Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
