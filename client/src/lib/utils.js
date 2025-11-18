import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  }

  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Less than 1 week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // Format as date
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatCurrency(amount, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getPillarColor(pillar) {
  const colors = {
    body: 'text-green-600 bg-green-50 border-green-200',
    brain: 'text-purple-600 bg-purple-50 border-purple-200',
    business: 'text-blue-600 bg-blue-50 border-blue-200',
  };
  return colors[pillar] || 'text-gray-600 bg-gray-50 border-gray-200';
}

export function getPillarIcon(pillar) {
  const icons = {
    body: '💪',
    brain: '🧠',
    business: '💼',
  };
  return icons[pillar] || '✨';
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
