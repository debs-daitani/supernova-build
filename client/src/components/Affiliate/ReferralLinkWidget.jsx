/**
 * Referral Link Widget
 * Compact widget showing referral link with copy button
 */

import { useState } from 'react';

export default function ReferralLinkWidget({ referralLink, compact = false }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
        />
        <button
          onClick={copyToClipboard}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-all"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span>🔗</span> Your Referral Link
      </h3>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="flex-1 px-4 py-3 border rounded-lg bg-gray-50 font-mono text-sm"
        />
        <button
          onClick={copyToClipboard}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-all"
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <ShareButton
          label="Twitter"
          url={`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=Check out The dAItaniverse!`}
          bgColor="bg-blue-500"
        />
        <ShareButton
          label="Facebook"
          url={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
          bgColor="bg-blue-700"
        />
        <ShareButton
          label="LinkedIn"
          url={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
          bgColor="bg-blue-600"
        />
        <ShareButton
          label="Email"
          url={`mailto:?subject=Check out The dAItaniverse&body=I thought you might be interested in this: ${referralLink}`}
          bgColor="bg-gray-600"
        />
      </div>
    </div>
  );
}

function ShareButton({ label, url, bgColor }) {
  return (
    <button
      onClick={() => window.open(url, '_blank', 'width=600,height=400')}
      className={`${bgColor} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all text-sm font-medium`}
    >
      Share on {label}
    </button>
  );
}
