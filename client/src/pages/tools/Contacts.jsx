import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { crmContacts } from '../../services/api';
import toast from 'react-hot-toast';

export default function Contacts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowCreateModal(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  useEffect(() => {
    loadContacts();
  }, [statusFilter, searchTerm]);

  const loadContacts = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await crmContacts.list(params);
      setContacts(response.data);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await crmContacts.delete(id);
      toast.success('Contact deleted');
      loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Contacts', icon: '👥' },
    { value: 'lead', label: 'Leads', icon: '🎯' },
    { value: 'prospect', label: 'Prospects', icon: '🔍' },
    { value: 'customer', label: 'Customers', icon: '⭐' },
    { value: 'inactive', label: 'Inactive', icon: '💤' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contacts</h1>
          <p className="text-gray-600">Manage your contacts and leads</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span>➕</span>
          Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="🔍 Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === option.value
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contacts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No contacts found</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            Add Your First Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onDelete={handleDelete}
              onUpdate={loadContacts}
            />
          ))}
        </div>
      )}

      {/* Create Contact Modal */}
      {showCreateModal && (
        <CreateContactModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadContacts();
          }}
        />
      )}
    </div>
  );
}

function ContactCard({ contact, onDelete, onUpdate }) {
  const getStatusBadge = (status) => {
    const badges = {
      lead: { color: 'bg-yellow-100 text-yellow-800', icon: '🎯' },
      prospect: { color: 'bg-blue-100 text-blue-800', icon: '🔍' },
      customer: { color: 'bg-green-100 text-green-800', icon: '⭐' },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: '💤' },
    };
    const badge = badges[status] || badges.lead;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon} {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">
            {contact.firstName} {contact.lastName}
          </h3>
          {contact.company && (
            <p className="text-sm text-gray-600 mb-2">{contact.company}</p>
          )}
          {getStatusBadge(contact.status)}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/tools/crm/contacts/${contact.id}`}
            className="text-blue-600 hover:text-blue-700"
            title="View Details"
          >
            👁️
          </Link>
          <button
            onClick={() => onDelete(contact.id)}
            className="text-red-600 hover:text-red-700"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {contact.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>📧</span>
            <a href={`mailto:${contact.email}`} className="hover:text-pink-600">
              {contact.email}
            </a>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>📞</span>
            <a href={`tel:${contact.phone}`} className="hover:text-pink-600">
              {contact.phone}
            </a>
          </div>
        )}
        {contact.leadScore > 0 && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>🏆</span>
            <span>Lead Score: {contact.leadScore}</span>
          </div>
        )}
      </div>

      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {contact.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {tag}
            </span>
          ))}
          {contact.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              +{contact.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {contact._count && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-gray-500">
          <span>💼 {contact._count.deals || 0} deals</span>
          <span>✅ {contact._count.tasks || 0} tasks</span>
        </div>
      )}
    </div>
  );
}

function CreateContactModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    status: 'lead',
    tags: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      await crmContacts.create(data);
      toast.success('Contact created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating contact:', error);
      toast.error('Failed to create contact');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Add New Contact</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Job Title</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input w-full"
              >
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="label">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., vip, enterprise, hot-lead"
                className="input w-full"
              />
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
                {saving ? 'Creating...' : 'Create Contact'}
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
