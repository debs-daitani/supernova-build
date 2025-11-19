import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { accountingInvoices, crmContacts } from '../../services/api';
import toast from 'react-hot-toast';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    contactId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    lineItems: [{ description: '', quantity: 1, price: 0 }],
    tax: 0,
    notes: '',
  });

  useEffect(() => {
    loadContacts();
    if (isEditing) {
      loadInvoice();
    }
  }, [id]);

  const loadContacts = async () => {
    try {
      const response = await crmContacts.list();
      setContacts(response.data);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    }
  };

  const loadInvoice = async () => {
    try {
      const response = await accountingInvoices.get(id);
      const invoice = response.data;
      setFormData({
        contactId: invoice.contactId || '',
        issueDate: invoice.issueDate.split('T')[0],
        dueDate: invoice.dueDate.split('T')[0],
        lineItems: invoice.lineItems,
        tax: invoice.tax,
        notes: invoice.notes || '',
      });
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { description: '', quantity: 1, price: 0 }]
    });
  };

  const handleRemoveLineItem = (index) => {
    const newLineItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData({ ...formData, lineItems: newLineItems });
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index][field] = field === 'description' ? value : parseFloat(value) || 0;
    setFormData({ ...formData, lineItems: newLineItems });
  };

  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + parseFloat(formData.tax || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.contactId) {
      toast.error('Please select a client');
      return;
    }

    if (formData.lineItems.length === 0 || !formData.lineItems[0].description) {
      toast.error('Please add at least one line item');
      return;
    }

    setSaving(true);
    try {
      const data = {
        contactId: formData.contactId,
        issueDate: new Date(formData.issueDate),
        dueDate: new Date(formData.dueDate),
        lineItems: formData.lineItems,
        subtotal: calculateSubtotal(),
        tax: parseFloat(formData.tax || 0),
        total: calculateTotal(),
        notes: formData.notes || null,
      };

      if (isEditing) {
        await accountingInvoices.update(id, data);
        toast.success('Invoice updated!');
      } else {
        await accountingInvoices.create(data);
        toast.success('Invoice created!');
      }

      navigate('/tools/accounting/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tools/accounting/invoices')}
          className="text-pink-600 hover:text-pink-700 mb-4"
        >
          ← Back to Invoices
        </button>
        <h1 className="text-3xl font-bold">{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Invoice Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Client *</label>
              <select
                value={formData.contactId}
                onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Select client...</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                    {contact.company && ` (${contact.company})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Issue Date *</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="label">Due Date *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input w-full"
                required
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Line Items</h2>
            <button
              type="button"
              onClick={handleAddLineItem}
              className="btn-secondary text-sm"
            >
              ➕ Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.lineItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Description (e.g., Web Design Services)"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    className="input w-full"
                    required
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                    className="input w-full"
                    min="1"
                    required
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleLineItemChange(index, 'price', e.target.value)}
                    className="input w-full"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="w-32">
                  <input
                    type="text"
                    value={`£${(item.quantity * item.price).toFixed(2)}`}
                    className="input w-full bg-gray-100"
                    readOnly
                  />
                </div>
                {formData.lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLineItem(index)}
                    className="text-red-600 hover:text-red-700 mt-2"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center gap-4 w-80">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold ml-auto">£{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-4 w-80">
                <span className="text-gray-600">Tax/VAT:</span>
                <input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  className="input w-32 text-right"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex items-center gap-4 w-80 pt-2 border-t">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-pink-600 ml-auto">
                  £{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Additional Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            placeholder="Payment terms, thank you message, etc."
            className="input w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Invoice' : 'Create Invoice'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/tools/accounting/invoices')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
