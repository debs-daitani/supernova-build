import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { accountingInvoices, crmContacts } from '../../services/api';
import toast from 'react-hot-toast';

export default function Invoices() {
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const loadInvoices = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await accountingInvoices.list(params);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      await accountingInvoices.markPaid(invoiceId);
      toast.success('Invoice marked as paid!');
      loadInvoices();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
    }
  };

  const handleDelete = async (invoiceId) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await accountingInvoices.delete(invoiceId);
      toast.success('Invoice deleted');
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Invoices', color: 'bg-gray-100' },
    { value: 'unpaid', label: 'Unpaid', color: 'bg-yellow-100' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100' },
    { value: 'overdue', label: 'Overdue', color: 'bg-red-100' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Invoices</h1>
          <p className="text-gray-600">Manage your invoices and track payments</p>
        </div>
        <Link to="/tools/accounting/invoices/new" className="btn-primary flex items-center gap-2">
          <span>➕</span>
          Create Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {statusOptions.map((option) => {
          const count = option.value === 'all'
            ? invoices.length
            : invoices.filter(inv => inv.status === option.value).length;

          return (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === option.value
                  ? 'bg-pink-600 text-white'
                  : `${option.color} text-gray-700 hover:bg-pink-100`
              }`}
            >
              {option.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No invoices found</p>
          <Link to="/tools/accounting/invoices/new" className="btn-primary">
            Create Your First Invoice
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  onMarkPaid={handleMarkPaid}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InvoiceRow({ invoice, onMarkPaid, onDelete }) {
  const getStatusBadge = (status) => {
    const badges = {
      unpaid: { color: 'bg-yellow-100 text-yellow-800', text: 'Unpaid' },
      paid: { color: 'bg-green-100 text-green-800', text: 'Paid' },
      overdue: { color: 'bg-red-100 text-red-800', text: 'Overdue' },
      cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' },
    };
    const badge = badges[status] || badges.unpaid;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const isOverdue = invoice.status === 'unpaid' && new Date(invoice.dueDate) < new Date();

  return (
    <tr className={isOverdue ? 'bg-red-50' : ''}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
          <div className="text-xs text-gray-500">
            Issued: {new Date(invoice.issueDate).toLocaleDateString()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{invoice.contact?.firstName} {invoice.contact?.lastName}</div>
        {invoice.contact?.company && (
          <div className="text-xs text-gray-500">{invoice.contact.company}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-bold text-gray-900">£{invoice.total.toLocaleString()}</div>
        {invoice.tax > 0 && (
          <div className="text-xs text-gray-500">+£{invoice.tax.toLocaleString()} tax</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
          {new Date(invoice.dueDate).toLocaleDateString()}
        </div>
        {isOverdue && <div className="text-xs text-red-600">Overdue!</div>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(isOverdue ? 'overdue' : invoice.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/tools/accounting/invoices/${invoice.id}`}
            className="text-blue-600 hover:text-blue-700"
            title="View"
          >
            👁️
          </Link>
          {invoice.status === 'unpaid' && (
            <button
              onClick={() => onMarkPaid(invoice.id)}
              className="text-green-600 hover:text-green-700"
              title="Mark as Paid"
            >
              ✅
            </button>
          )}
          <button
            onClick={() => onDelete(invoice.id)}
            className="text-red-600 hover:text-red-700"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}
