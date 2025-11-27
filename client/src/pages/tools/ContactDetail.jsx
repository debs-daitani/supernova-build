import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { crmContacts, crmDeals, crmTasks, crmActivities } from '../../services/api';
import toast from 'react-hot-toast';

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadContact();
  }, [id]);

  const loadContact = async () => {
    try {
      const [contactRes, dealsRes, tasksRes, activitiesRes] = await Promise.all([
        crmContacts.get(id),
        crmDeals.list({ contactId: id }),
        crmTasks.list({ contactId: id }),
        crmActivities.list({ contactId: id }),
      ]);

      setContact(contactRes.data);
      setDeals(dealsRes.data);
      setTasks(tasksRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error loading contact:', error);
      toast.error('Failed to load contact');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await crmContacts.update(id, data);
      toast.success('Contact updated!');
      setEditing(false);
      loadContact();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact? This will also delete all associated deals and tasks.')) {
      return;
    }

    try {
      await crmContacts.delete(id);
      toast.success('Contact deleted');
      navigate('/tools/crm/contacts');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Contact Not Found</h2>
          <Link to="/tools/crm/contacts" className="btn-primary">
            Back to Contacts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/tools/crm/contacts" className="text-pink-600 hover:text-pink-700 mb-4 inline-block">
          ← Back to Contacts
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {contact.firstName} {contact.lastName}
            </h1>
            {contact.company && (
              <p className="text-gray-600 text-lg">{contact.jobTitle} at {contact.company}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="btn-secondary">
              ✏️ Edit
            </button>
            <button onClick={handleDelete} className="btn-secondary text-red-600 hover:text-red-700">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          {['overview', 'deals', 'tasks', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-pink-600 text-pink-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab contact={contact} />
      )}
      {activeTab === 'deals' && (
        <DealsTab deals={deals} contactId={id} onRefresh={loadContact} />
      )}
      {activeTab === 'tasks' && (
        <TasksTab tasks={tasks} contactId={id} onRefresh={loadContact} />
      )}
      {activeTab === 'activity' && (
        <ActivityTab activities={activities} />
      )}

      {/* Edit Modal */}
      {editing && (
        <EditContactModal
          contact={contact}
          onClose={() => setEditing(false)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}

function OverviewTab({ contact }) {
  const getStatusBadge = (status) => {
    const badges = {
      lead: 'bg-yellow-100 text-yellow-800',
      prospect: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || badges.lead;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Contact Information</h2>
        <div className="space-y-4">
          <InfoRow label="Status">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(contact.status)}`}>
              {contact.status}
            </span>
          </InfoRow>
          {contact.email && (
            <InfoRow label="Email">
              <a href={`mailto:${contact.email}`} className="text-pink-600 hover:text-pink-700">
                {contact.email}
              </a>
            </InfoRow>
          )}
          {contact.phone && (
            <InfoRow label="Phone">
              <a href={`tel:${contact.phone}`} className="text-pink-600 hover:text-pink-700">
                {contact.phone}
              </a>
            </InfoRow>
          )}
          {contact.company && <InfoRow label="Company">{contact.company}</InfoRow>}
          {contact.jobTitle && <InfoRow label="Job Title">{contact.jobTitle}</InfoRow>}
          {contact.leadScore > 0 && (
            <InfoRow label="Lead Score">
              <span className="font-bold text-pink-600">{contact.leadScore}</span>
            </InfoRow>
          )}
          {contact.tags && contact.tags.length > 0 && (
            <InfoRow label="Tags">
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </InfoRow>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Additional Details</h2>
        <div className="space-y-4">
          {contact.address && <InfoRow label="Address">{contact.address}</InfoRow>}
          {contact.city && <InfoRow label="City">{contact.city}</InfoRow>}
          {contact.postcode && <InfoRow label="Postcode">{contact.postcode}</InfoRow>}
          {contact.country && <InfoRow label="Country">{contact.country}</InfoRow>}
          {contact.notes && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DealsTab({ deals, contactId, onRefresh }) {
  if (deals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 mb-4">No deals yet</p>
        <Link to="/tools/crm/pipeline?action=new" className="btn-primary">
          Create First Deal
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {deals.map((deal) => (
        <div key={deal.id} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-2">{deal.title}</h3>
          <p className="text-2xl font-bold text-pink-600 mb-2">
            £{deal.value.toLocaleString()}
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Stage: <span className="font-medium">{deal.stage}</span></p>
            <p>Probability: <span className="font-medium">{deal.probability}%</span></p>
            {deal.expectedCloseDate && (
              <p>Expected Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksTab({ tasks, contactId, onRefresh }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 mb-4">No tasks yet</p>
        <Link to="/tools/crm/tasks?action=new" className="btn-primary">
          Create First Task
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
        return (
          <div key={task.id} className="bg-white rounded-lg shadow-md p-4 flex items-start gap-4">
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={() => {/* handle complete */}}
              className="mt-1 h-5 w-5 text-pink-600 rounded"
            />
            <div className="flex-1">
              <h4 className="font-medium">{task.title}</h4>
              {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
              {task.dueDate && (
                <p className={`text-sm mt-2 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivityTab({ activities }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{activity.title}</h4>
              {activity.description && (
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm font-medium text-gray-600 min-w-[100px]">{label}</span>
      <div className="text-sm text-gray-900 flex-1 text-right">{children}</div>
    </div>
  );
}

function EditContactModal({ contact, onClose, onSave }) {
  const [formData, setFormData] = useState({
    firstName: contact.firstName || '',
    lastName: contact.lastName || '',
    email: contact.email || '',
    phone: contact.phone || '',
    company: contact.company || '',
    jobTitle: contact.jobTitle || '',
    status: contact.status || 'lead',
    tags: contact.tags ? contact.tags.join(', ') : '',
    notes: contact.notes || '',
    address: contact.address || '',
    city: contact.city || '',
    postcode: contact.postcode || '',
    country: contact.country || '',
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
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Edit Contact</h2>
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
                {saving ? 'Saving...' : 'Save Changes'}
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
