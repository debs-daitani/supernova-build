import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { legalDocuments } from '../../services/api';

const DOCUMENT_CONFIGS = {
  terms: {
    title: 'Generate Terms & Conditions',
    icon: '📜',
    color: 'from-blue-500 to-cyan-500',
  },
  privacy: {
    title: 'Generate Privacy Policy',
    icon: '🔒',
    color: 'from-purple-500 to-pink-500',
  },
  contract: {
    title: 'Generate Service Contract',
    icon: '📝',
    color: 'from-green-500 to-emerald-500',
  },
  nda: {
    title: 'Generate NDA',
    icon: '🤐',
    color: 'from-orange-500 to-red-500',
  },
  disclaimer: {
    title: 'Generate Disclaimer',
    icon: '⚠️',
    color: 'from-yellow-500 to-orange-500',
  },
};

export default function LegalGenerator() {
  const { type } = useParams();
  const navigate = useNavigate();
  const config = DOCUMENT_CONFIGS[type] || DOCUMENT_CONFIGS.terms;

  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  // Business info (common to all)
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    tradingName: '',
    legalEntity: 'Limited Company',
    registrationNumber: '',
    address: '',
    email: '',
    website: '',
    country: 'UK',
  });

  // Document-specific fields
  const [documentSpecifics, setDocumentSpecifics] = useState({
    // Terms fields
    offerings: '',
    deliveryMethod: '',
    paymentTerms: '',
    refundPolicy: '',
    ageRestriction: '18+',
    accountRequired: false,
    userContentAllowed: false,
    governingLaw: 'England and Wales',
    disputeResolution: 'Courts',

    // Privacy fields
    dataCollected: [],
    dataPurpose: '',
    thirdPartySharing: false,
    thirdPartyServices: [],
    usesCookies: true,
    cookieTypes: [],
    storageLocation: 'UK/EU',
    retentionPeriod: '7 years',

    // Contract fields
    contractType: 'Service Agreement',
    clientName: '',
    clientAddress: '',
    servicesDescription: '',
    deliverables: '',
    timeline: '',
    totalFee: '',
    paymentSchedule: '',
    latePaymentTerms: '',
    ipOwnership: 'Client owns upon full payment',
    noticePeriod: '30 days',
    includeNDA: false,
    liabilityLimit: '',

    // NDA fields
    ndaType: 'one-way',
    otherPartyName: '',
    otherPartyAddress: '',
    confidentialInfo: '',
    duration: '2 years',

    // Disclaimer fields
    industry: '',
    professionalAdvice: false,
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await legalDocuments.generate({
        documentType: type,
        businessInfo,
        documentSpecifics,
      });

      setGenerated(result);
    } catch (error) {
      console.error('Failed to generate document:', error);
      alert('Failed to generate document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generated) return;

    try {
      await legalDocuments.update(generated.id, { isActive: true });
      alert('Document saved and activated!');
      navigate('/legal');
    } catch (error) {
      console.error('Failed to save document:', error);
      alert('Failed to save document');
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'terms':
        return (
          <div className="space-y-6">
            {/* Service Details */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Service Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 text-sm mb-1">What do you offer?</label>
                  <input
                    type="text"
                    placeholder="e.g., Digital products, consulting services"
                    value={documentSpecifics.offerings}
                    onChange={(e) => setDocumentSpecifics({...documentSpecifics, offerings: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-blue-200 text-sm mb-1">Delivery Method</label>
                  <select
                    value={documentSpecifics.deliveryMethod}
                    onChange={(e) => setDocumentSpecifics({...documentSpecifics, deliveryMethod: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-gray-900">Select...</option>
                    <option value="digital download" className="bg-gray-900">Digital Download</option>
                    <option value="physical shipping" className="bg-gray-900">Physical Shipping</option>
                    <option value="in-person service" className="bg-gray-900">In-Person Service</option>
                    <option value="online service" className="bg-gray-900">Online Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-blue-200 text-sm mb-1">Payment Terms</label>
                  <select
                    value={documentSpecifics.paymentTerms}
                    onChange={(e) => setDocumentSpecifics({...documentSpecifics, paymentTerms: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-gray-900">Select...</option>
                    <option value="upfront payment" className="bg-gray-900">Upfront Payment</option>
                    <option value="deposit required" className="bg-gray-900">Deposit Required</option>
                    <option value="payment plans" className="bg-gray-900">Payment Plans</option>
                    <option value="subscription" className="bg-gray-900">Subscription</option>
                  </select>
                </div>
                <div>
                  <label className="block text-blue-200 text-sm mb-1">Refund Policy</label>
                  <input
                    type="text"
                    placeholder="e.g., 30-day money-back guarantee"
                    value={documentSpecifics.refundPolicy}
                    onChange={(e) => setDocumentSpecifics({...documentSpecifics, refundPolicy: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* User Requirements */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">User Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-blue-200 text-sm mb-1">Age Restriction</label>
                  <select
                    value={documentSpecifics.ageRestriction}
                    onChange={(e) => setDocumentSpecifics({...documentSpecifics, ageRestriction: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none" className="bg-gray-900">No Restriction</option>
                    <option value="13+" className="bg-gray-900">13+</option>
                    <option value="18+" className="bg-gray-900">18+</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={documentSpecifics.accountRequired}
                      onChange={(e) => setDocumentSpecifics({...documentSpecifics, accountRequired: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-blue-200">Account Required?</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={documentSpecifics.userContentAllowed}
                      onChange={(e) => setDocumentSpecifics({...documentSpecifics, userContentAllowed: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-blue-200">User Content Allowed?</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            {/* Data Collection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Data Collection</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {['Name', 'Email', 'Phone', 'Address', 'Payment Info', 'IP Address', 'Cookies', 'Analytics'].map(item => (
                  <label key={item} className="flex items-center cursor-pointer bg-white/5 p-3 rounded-lg">
                    <input
                      type="checkbox"
                      checked={documentSpecifics.dataCollected.includes(item)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...documentSpecifics.dataCollected, item]
                          : documentSpecifics.dataCollected.filter(i => i !== item);
                        setDocumentSpecifics({...documentSpecifics, dataCollected: updated});
                      }}
                      className="mr-2"
                    />
                    <span className="text-blue-200 text-sm">{item}</span>
                  </label>
                ))}
              </div>
              <textarea
                placeholder="Why do you collect this data?"
                value={documentSpecifics.dataPurpose}
                onChange={(e) => setDocumentSpecifics({...documentSpecifics, dataPurpose: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Cookies */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Cookies</h3>
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={documentSpecifics.usesCookies}
                    onChange={(e) => setDocumentSpecifics({...documentSpecifics, usesCookies: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-blue-200">Use Cookies?</span>
                </label>
              </div>
              {documentSpecifics.usesCookies && (
                <div className="grid grid-cols-3 gap-3">
                  {['Essential', 'Analytics', 'Marketing'].map(type => (
                    <label key={type} className="flex items-center cursor-pointer bg-white/5 p-3 rounded-lg">
                      <input
                        type="checkbox"
                        checked={documentSpecifics.cookieTypes.includes(type)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...documentSpecifics.cookieTypes, type]
                            : documentSpecifics.cookieTypes.filter(t => t !== type);
                          setDocumentSpecifics({...documentSpecifics, cookieTypes: updated});
                        }}
                        className="mr-2"
                      />
                      <span className="text-blue-200 text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'contract':
        return (
          <div className="space-y-6">
            {/* Client Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Client Name"
                  value={documentSpecifics.clientName}
                  onChange={(e) => setDocumentSpecifics({...documentSpecifics, clientName: e.target.value})}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Client Address"
                  value={documentSpecifics.clientAddress}
                  onChange={(e) => setDocumentSpecifics({...documentSpecifics, clientAddress: e.target.value})}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Payment */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Payment Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 text-sm mb-1">Total Fee (£)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={documentSpecifics.totalFee}
                    onChange={(e) => setDocumentSpecifics({...documentSpecifics, totalFee: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-blue-200 text-sm mb-1">Payment Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g., 50% upfront, 50% on completion"
                    value={documentSpecifics.paymentSchedule}
                    onChange={(e) => setDocumentSpecifics({...documentSpecifics, paymentSchedule: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'nda':
        return (
          <div className="space-y-6">
            {/* NDA Type */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">NDA Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${documentSpecifics.ndaType === 'one-way' ? 'border-orange-400 bg-orange-500/20' : 'border-white/20 bg-white/5'}`}>
                  <input
                    type="radio"
                    name="ndaType"
                    value="one-way"
                    checked={documentSpecifics.ndaType === 'one-way'}
                    onChange={(e) => setDocumentSpecifics({...documentSpecifics, ndaType: e.target.value})}
                    className="mr-2"
                  />
                  <span className="text-white font-semibold">One-Way</span>
                  <p className="text-blue-200 text-sm mt-1">They protect your information</p>
                </label>
                <label className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${documentSpecifics.ndaType === 'mutual' ? 'border-orange-400 bg-orange-500/20' : 'border-white/20 bg-white/5'}`}>
                  <input
                    type="radio"
                    name="ndaType"
                    value="mutual"
                    checked={documentSpecifics.ndaType === 'mutual'}
                    onChange={(e) => setDocumentSpecifics({...documentSpecifics, ndaType: e.target.value})}
                    className="mr-2"
                  />
                  <span className="text-white font-semibold">Mutual</span>
                  <p className="text-blue-200 text-sm mt-1">Both parties protect each other</p>
                </label>
              </div>
            </div>

            {/* Other Party */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Other Party</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={documentSpecifics.otherPartyName}
                  onChange={(e) => setDocumentSpecifics({...documentSpecifics, otherPartyName: e.target.value})}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={documentSpecifics.otherPartyAddress}
                  onChange={(e) => setDocumentSpecifics({...documentSpecifics, otherPartyAddress: e.target.value})}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Duration</h3>
              <select
                value={documentSpecifics.duration}
                onChange={(e) => setDocumentSpecifics({...documentSpecifics, duration: e.target.value})}
                className="w-full md:w-1/2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="1 year" className="bg-gray-900">1 Year</option>
                <option value="2 years" className="bg-gray-900">2 Years</option>
                <option value="5 years" className="bg-gray-900">5 Years</option>
                <option value="perpetual" className="bg-gray-900">Perpetual</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (generated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setGenerated(null)}
              className="text-blue-300 hover:text-blue-200 mb-4"
            >
              ← Back to Form
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">{generated.title}</h1>
            <p className="text-blue-200">Review and save your generated document</p>
          </div>

          <div className="bg-white rounded-xl p-8 mb-6">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: generated.content.replace(/\n/g, '<br>') }}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              💾 Save & Activate
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(generated.content)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              📋 Copy
            </button>
            <button
              onClick={() => setGenerated(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              ✏️ Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center text-4xl mb-4`}>
            {config.icon}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{config.title}</h1>
          <p className="text-blue-200">Fill in the details below to generate your document</p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
          {/* Business Information (common to all) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Business Name"
                value={businessInfo.businessName}
                onChange={(e) => setBusinessInfo({...businessInfo, businessName: e.target.value})}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Email Address"
                value={businessInfo.email}
                onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Website URL"
                value={businessInfo.website}
                onChange={(e) => setBusinessInfo({...businessInfo, website: e.target.value})}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Business Address"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Document-specific form */}
          {renderForm()}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !businessInfo.businessName || !businessInfo.email}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '✨ Generating...' : `✨ Generate ${config.title.replace('Generate ', '')}`}
        </button>
      </div>
    </div>
  );
}
