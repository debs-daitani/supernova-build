'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Subscription', href: '/billing' },
    { name: 'Plans', href: '/billing/plans' },
    { name: 'Invoices', href: '/billing/invoices' },
    { name: 'Payment Methods', href: '/billing/payment-methods' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: 'Supernova, sans-serif' }}
          >
            Billing
          </h1>
          <p className="text-gray-300" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
            Manage your subscription, billing, and payment methods
          </p>
        </div>

        {/* Navigation */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-2 mb-8">
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                  style={{ fontFamily: 'Josefin Sans, sans-serif' }}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
