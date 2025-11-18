import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { accountingStats, accountingInvoices, accountingExpenses } from '../../services/api';
import toast from 'react-hot-toast';

export default function AccountingDashboard() {
  const [stats, setStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, invoicesRes, expensesRes] = await Promise.all([
        accountingStats.get(),
        accountingInvoices.list({ limit: 5 }),
        accountingExpenses.list({ limit: 5 })
      ]);

      setStats(statsRes.data);
      setRecentInvoices(invoicesRes.data);
      setRecentExpenses(expensesRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Accounting Dashboard</h1>
        <p className="text-gray-600">Track your invoices, expenses, and financial health</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="💰"
          title="Total Revenue"
          value={`£${(stats?.totalRevenue || 0).toLocaleString()}`}
          subtitle="All time"
          link="/tools/accounting/invoices"
        />
        <StatCard
          icon="💸"
          title="Total Expenses"
          value={`£${(stats?.totalExpenses || 0).toLocaleString()}`}
          subtitle="All time"
          link="/tools/accounting/expenses"
        />
        <StatCard
          icon="📊"
          title="Net Profit"
          value={`£${((stats?.totalRevenue || 0) - (stats?.totalExpenses || 0)).toLocaleString()}`}
          subtitle="All time"
          link="/tools/accounting/reports"
        />
        <StatCard
          icon="📄"
          title="Outstanding"
          value={`£${(stats?.unpaidInvoices || 0).toLocaleString()}`}
          subtitle={`${stats?.unpaidInvoicesCount || 0} invoices`}
          link="/tools/accounting/invoices?status=unpaid"
        />
      </div>

      {/* Monthly Stats */}
      {stats?.monthlyStats && (
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-md p-6 text-white mb-8">
          <h2 className="text-xl font-bold mb-4">This Month</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-pink-100 text-sm mb-1">Revenue</p>
              <p className="text-3xl font-bold">£{(stats.monthlyStats.revenue || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-pink-100 text-sm mb-1">Expenses</p>
              <p className="text-3xl font-bold">£{(stats.monthlyStats.expenses || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-pink-100 text-sm mb-1">Profit</p>
              <p className="text-3xl font-bold">
                £{((stats.monthlyStats.revenue || 0) - (stats.monthlyStats.expenses || 0)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Invoices</h2>
            <Link to="/tools/accounting/invoices" className="text-pink-600 hover:text-pink-700 text-sm">
              View All →
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <InvoiceItem key={invoice.id} invoice={invoice} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Expenses</h2>
            <Link to="/tools/accounting/expenses" className="text-pink-600 hover:text-pink-700 text-sm">
              View All →
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <ExpenseItem key={expense.id} expense={expense} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction icon="📄" text="New Invoice" link="/tools/accounting/invoices/new" />
          <QuickAction icon="💸" text="Add Expense" link="/tools/accounting/expenses?action=new" />
          <QuickAction icon="📊" text="View Reports" link="/tools/accounting/reports" />
          <QuickAction icon="🧮" text="Calculators" link="/tools/accounting/calculators" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, link }) {
  const content = (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

function InvoiceItem({ invoice }) {
  const getStatusBadge = (status) => {
    const badges = {
      unpaid: { color: 'bg-yellow-100 text-yellow-800', text: 'Unpaid' },
      paid: { color: 'bg-green-100 text-green-800', text: 'Paid' },
      overdue: { color: 'bg-red-100 text-red-800', text: 'Overdue' },
      cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' },
    };
    const badge = badges[invoice.status] || badges.unpaid;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <Link
      to={`/tools/accounting/invoices/${invoice.id}`}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex-1">
        <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
        <p className="text-xs text-gray-500 mt-1">
          Due: {new Date(invoice.dueDate).toLocaleDateString()}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">£{invoice.total.toLocaleString()}</p>
        <div className="mt-1">{getStatusBadge(invoice.status)}</div>
      </div>
    </Link>
  );
}

function ExpenseItem({ expense }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium">{expense.description}</p>
        <p className="text-xs text-gray-500 mt-1">
          {expense.category} • {new Date(expense.date).toLocaleDateString()}
        </p>
      </div>
      <p className="text-sm font-bold text-red-600">-£{expense.amount.toLocaleString()}</p>
    </div>
  );
}

function QuickAction({ icon, text, link }) {
  return (
    <Link
      to={link}
      className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-pink-50 hover:border-pink-200 border border-transparent transition-colors"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-center">{text}</span>
    </Link>
  );
}
