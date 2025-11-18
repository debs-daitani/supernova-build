import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { aiContentGenerator } from '../../services/api';

const GENERATOR_TYPES = {
  caption: {
    title: '📱 Social Media Caption Generator',
    description: 'Generate engaging social media captions',
    fields: ['topic', 'platform', 'tone', 'includeEmojis', 'includeHashtags', 'callToAction'],
    apiMethod: 'generateCaption',
    multipleResults: true,
  },
  email: {
    title: '📧 Email Subject Line Generator',
    description: 'Create compelling email subject lines',
    fields: ['purpose', 'keyMessage', 'tone', 'includePersonalization', 'includeUrgency'],
    apiMethod: 'generateEmailSubject',
    multipleResults: true,
  },
  product: {
    title: '🛍️ Product Description Generator',
    description: 'Write persuasive product descriptions',
    fields: ['productName', 'productType', 'features', 'benefits', 'targetCustomer', 'tone'],
    apiMethod: 'generateProductDesc',
    multipleResults: true,
  },
  meta: {
    title: '🔍 SEO Meta Description Generator',
    description: 'Create optimized meta descriptions',
    fields: ['pageTitle', 'primaryKeyword', 'pageType'],
    apiMethod: 'generateMetaDesc',
    multipleResults: true,
  },
  ad: {
    title: '📢 Ad Copy Generator',
    description: 'Generate high-converting ad copy',
    fields: ['platform', 'objective', 'product', 'targetAudience', 'uniqueSellingPoint', 'callToAction'],
    apiMethod: 'generateAdCopy',
    multipleResults: true,
  },
  landing: {
    title: '🎯 Landing Page Copy Generator',
    description: 'Create complete landing page copy',
    fields: ['offer', 'targetAudience', 'painPoints', 'benefits', 'callToAction', 'includeTestimonials', 'includeFAQ'],
    apiMethod: 'generateLandingPage',
    multipleResults: false,
  },
};

export default function QuickGenerator() {
  const { type } = useParams();
  const config = GENERATOR_TYPES[type] || GENERATOR_TYPES.caption;

  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const response = await aiContentGenerator[config.apiMethod](formData);
      setResult(response);
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{config.title}</h1>
          <p className="text-indigo-200">{config.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Input Details</h2>

            <div className="space-y-4">
              {config.fields.includes('topic') && (
                <FormField
                  label="Topic"
                  name="topic"
                  value={formData.topic || ''}
                  onChange={handleInputChange}
                  placeholder="What's this post about?"
                  required
                />
              )}

              {config.fields.includes('purpose') && (
                <FormSelect
                  label="Email Purpose"
                  name="purpose"
                  value={formData.purpose || 'newsletter'}
                  onChange={handleInputChange}
                  options={['newsletter', 'promotion', 'announcement', 'welcome', 'follow-up']}
                />
              )}

              {config.fields.includes('keyMessage') && (
                <FormField
                  label="Key Message"
                  name="keyMessage"
                  value={formData.keyMessage || ''}
                  onChange={handleInputChange}
                  placeholder="Main message or offer"
                  required
                />
              )}

              {config.fields.includes('productName') && (
                <FormField
                  label="Product Name"
                  name="productName"
                  value={formData.productName || ''}
                  onChange={handleInputChange}
                  placeholder="Your product name"
                  required
                />
              )}

              {config.fields.includes('productType') && (
                <FormField
                  label="Product Type"
                  name="productType"
                  value={formData.productType || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Digital course, Physical product"
                />
              )}

              {config.fields.includes('features') && (
                <FormTextarea
                  label="Key Features (one per line)"
                  name="features"
                  value={formData.features || ''}
                  onChange={handleInputChange}
                  placeholder="List product features..."
                />
              )}

              {config.fields.includes('benefits') && (
                <FormTextarea
                  label="Benefits/Problems it Solves"
                  name="benefits"
                  value={formData.benefits || ''}
                  onChange={handleInputChange}
                  placeholder="How does it help your customers?"
                />
              )}

              {config.fields.includes('pageTitle') && (
                <FormField
                  label="Page Title"
                  name="pageTitle"
                  value={formData.pageTitle || ''}
                  onChange={handleInputChange}
                  placeholder="Your page title"
                  required
                />
              )}

              {config.fields.includes('primaryKeyword') && (
                <FormField
                  label="Primary Keyword"
                  name="primaryKeyword"
                  value={formData.primaryKeyword || ''}
                  onChange={handleInputChange}
                  placeholder="Main SEO keyword"
                  required
                />
              )}

              {config.fields.includes('pageType') && (
                <FormSelect
                  label="Page Type"
                  name="pageType"
                  value={formData.pageType || 'blog'}
                  onChange={handleInputChange}
                  options={['blog', 'homepage', 'product', 'service']}
                />
              )}

              {config.fields.includes('platform') && (
                <FormSelect
                  label="Platform"
                  name="platform"
                  value={formData.platform || 'instagram'}
                  onChange={handleInputChange}
                  options={['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok']}
                />
              )}

              {config.fields.includes('objective') && (
                <FormSelect
                  label="Ad Objective"
                  name="objective"
                  value={formData.objective || 'conversions'}
                  onChange={handleInputChange}
                  options={['awareness', 'traffic', 'conversions', 'leads']}
                />
              )}

              {config.fields.includes('product') && (
                <FormField
                  label="Product/Offer"
                  name="product"
                  value={formData.product || ''}
                  onChange={handleInputChange}
                  placeholder="What are you promoting?"
                  required
                />
              )}

              {config.fields.includes('offer') && (
                <FormField
                  label="Offer"
                  name="offer"
                  value={formData.offer || ''}
                  onChange={handleInputChange}
                  placeholder="Your product or service"
                  required
                />
              )}

              {config.fields.includes('painPoints') && (
                <FormTextarea
                  label="Pain Points (one per line)"
                  name="painPoints"
                  value={formData.painPoints || ''}
                  onChange={handleInputChange}
                  placeholder="Problems your audience faces..."
                />
              )}

              {config.fields.includes('targetAudience') && (
                <FormField
                  label="Target Audience"
                  name="targetAudience"
                  value={formData.targetAudience || ''}
                  onChange={handleInputChange}
                  placeholder="Who is this for?"
                />
              )}

              {config.fields.includes('targetCustomer') && (
                <FormField
                  label="Target Customer"
                  name="targetCustomer"
                  value={formData.targetCustomer || ''}
                  onChange={handleInputChange}
                  placeholder="Who will buy this?"
                />
              )}

              {config.fields.includes('uniqueSellingPoint') && (
                <FormField
                  label="Unique Selling Point"
                  name="uniqueSellingPoint"
                  value={formData.uniqueSellingPoint || ''}
                  onChange={handleInputChange}
                  placeholder="What makes you different?"
                />
              )}

              {config.fields.includes('callToAction') && (
                <FormField
                  label="Call to Action"
                  name="callToAction"
                  value={formData.callToAction || ''}
                  onChange={handleInputChange}
                  placeholder="What should they do?"
                />
              )}

              {config.fields.includes('tone') && (
                <FormSelect
                  label="Tone"
                  name="tone"
                  value={formData.tone || 'professional'}
                  onChange={handleInputChange}
                  options={['professional', 'casual', 'friendly', 'authoritative', 'enthusiastic']}
                />
              )}

              {config.fields.includes('includeEmojis') && (
                <FormCheckbox
                  label="Include Emojis"
                  name="includeEmojis"
                  checked={formData.includeEmojis || false}
                  onChange={handleInputChange}
                />
              )}

              {config.fields.includes('includeHashtags') && (
                <FormCheckbox
                  label="Include Hashtags"
                  name="includeHashtags"
                  checked={formData.includeHashtags || false}
                  onChange={handleInputChange}
                />
              )}

              {config.fields.includes('includePersonalization') && (
                <FormCheckbox
                  label="Include Personalization"
                  name="includePersonalization"
                  checked={formData.includePersonalization || false}
                  onChange={handleInputChange}
                />
              )}

              {config.fields.includes('includeUrgency') && (
                <FormCheckbox
                  label="Create Urgency"
                  name="includeUrgency"
                  checked={formData.includeUrgency || false}
                  onChange={handleInputChange}
                />
              )}

              {config.fields.includes('includeTestimonials') && (
                <FormCheckbox
                  label="Include Testimonial Section"
                  name="includeTestimonials"
                  checked={formData.includeTestimonials || false}
                  onChange={handleInputChange}
                />
              )}

              {config.fields.includes('includeFAQ') && (
                <FormCheckbox
                  label="Include FAQ Section"
                  name="includeFAQ"
                  checked={formData.includeFAQ || false}
                  onChange={handleInputChange}
                />
              )}

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50"
              >
                {generating ? '⚙️ Generating...' : '✨ Generate with AI'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Generated Content</h2>

            {!result ? (
              <div className="text-center py-12">
                <p className="text-6xl mb-4">🤖</p>
                <p className="text-indigo-300">Fill in the form and generate your content</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto">
                {/* Captions */}
                {result.captions && result.captions.map((caption, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-indigo-300 text-sm font-medium">Caption {idx + 1}</span>
                      <button
                        onClick={() => copyToClipboard(caption)}
                        className="text-xs text-indigo-300 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-white">{caption}</p>
                  </div>
                ))}

                {/* Hashtags */}
                {result.hashtags && result.hashtags.length > 0 && (
                  <div className="bg-white/5 p-4 rounded border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-indigo-300 text-sm font-medium">Hashtags</span>
                      <button
                        onClick={() => copyToClipboard(result.hashtags.join(' '))}
                        className="text-xs text-indigo-300 hover:text-white"
                      >
                        Copy All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-indigo-200 text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Subjects */}
                {result.subjectLines && result.subjectLines.map((line, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-200 rounded text-xs">
                          {line.openRate}
                        </span>
                        <span className="text-indigo-400 text-xs">{line.charCount} chars</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(line.subject)}
                        className="text-xs text-indigo-300 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-white font-medium mb-1">{line.subject}</p>
                    <p className="text-indigo-300 text-xs">{line.reason}</p>
                  </div>
                ))}

                {/* Product Descriptions */}
                {result.short && (
                  <>
                    <div>
                      <div className="flex justify-between mb-2">
                        <h3 className="text-indigo-200 font-semibold">Short Version</h3>
                        <button onClick={() => copyToClipboard(result.short)} className="text-xs text-indigo-300 hover:text-white">Copy</button>
                      </div>
                      <div className="bg-white/5 p-4 rounded border border-white/10">
                        <pre className="text-white whitespace-pre-wrap text-sm">{result.short}</pre>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <h3 className="text-indigo-200 font-semibold">Long Version</h3>
                        <button onClick={() => copyToClipboard(result.long)} className="text-xs text-indigo-300 hover:text-white">Copy</button>
                      </div>
                      <div className="bg-white/5 p-4 rounded border border-white/10">
                        <pre className="text-white whitespace-pre-wrap text-sm">{result.long}</pre>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <h3 className="text-indigo-200 font-semibold">Ad Copy Version</h3>
                        <button onClick={() => copyToClipboard(result.ad)} className="text-xs text-indigo-300 hover:text-white">Copy</button>
                      </div>
                      <div className="bg-white/5 p-4 rounded border border-white/10">
                        <pre className="text-white whitespace-pre-wrap text-sm">{result.ad}</pre>
                      </div>
                    </div>
                  </>
                )}

                {/* Meta Descriptions */}
                {result.metaDescriptions && result.metaDescriptions.map((meta, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${meta.isOptimal ? 'bg-green-500/20 text-green-200' : 'bg-yellow-500/20 text-yellow-200'}`}>
                          {meta.charCount} chars {meta.isOptimal ? '✓' : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(meta.description)}
                        className="text-xs text-indigo-300 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-white mb-1">{meta.description}</p>
                    <p className="text-indigo-300 text-xs">{meta.reason}</p>
                  </div>
                ))}

                {/* Ad Variations */}
                {result.variations && result.variations.map((variation, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded border border-white/10">
                    <div className="flex justify-between mb-3">
                      <span className="text-indigo-300 font-medium">Variation {idx + 1}</span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(variation, null, 2))}
                        className="text-xs text-indigo-300 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-indigo-400 text-xs">Primary Text:</span>
                        <p className="text-white text-sm">{variation.primaryText}</p>
                      </div>
                      <div>
                        <span className="text-indigo-400 text-xs">Headline:</span>
                        <p className="text-white text-sm font-semibold">{variation.headline}</p>
                      </div>
                      <div>
                        <span className="text-indigo-400 text-xs">Description:</span>
                        <p className="text-white text-sm">{variation.description}</p>
                      </div>
                      <div>
                        <span className="text-indigo-400 text-xs">CTA:</span>
                        <p className="text-white text-sm">{variation.cta}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Landing Page */}
                {result.content && !result.captions && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <h3 className="text-indigo-200 font-semibold">Full Content</h3>
                      <button onClick={() => copyToClipboard(result.content)} className="text-xs px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded">Copy All</button>
                    </div>
                    <div className="bg-white/5 p-4 rounded border border-white/10 max-h-[600px] overflow-y-auto">
                      <pre className="text-white whitespace-pre-wrap text-sm leading-relaxed">{result.content}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function FormField({ label, name, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-indigo-200 text-sm font-medium mb-2">
        {label} {required && '*'}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function FormTextarea({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-indigo-200 text-sm font-medium mb-2">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows="4"
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-indigo-200 text-sm font-medium mb-2">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {options.map(opt => (
          <option key={opt} value={opt} className="bg-gray-800">
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormCheckbox({ label, name, checked, onChange }) {
  return (
    <label className="flex items-center text-indigo-200">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mr-2 rounded"
      />
      {label}
    </label>
  );
}
