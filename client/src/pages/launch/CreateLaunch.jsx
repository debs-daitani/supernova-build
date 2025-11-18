import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { launches } from '../../services/api';

export default function CreateLaunch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    launchDate: '',
    launchType: 'product',
    goals: {
      revenue: '',
      signups: '',
      emailGrowth: '',
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const launch = await launches.create({
        ...formData,
        goals: {
          revenue: Number(formData.goals.revenue) || 0,
          signups: Number(formData.goals.signups) || 0,
          emailGrowth: Number(formData.goals.emailGrowth) || 0,
        },
        generateChecklist: true,
      });

      navigate(`/launch/${launch.id}`);
    } catch (error) {
      console.error('Failed to create launch:', error);
      alert('Failed to create launch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/launch')}
            className="text-orange-300 hover:text-orange-200 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">🚀 Create Launch Plan</h1>
          <p className="text-orange-200">Plan your next successful launch</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Launch Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-orange-200 text-sm mb-1">What are you launching?</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., My New Course, Product Launch, Grand Opening"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-orange-200 text-sm mb-1">Description (optional)</label>
                <textarea
                  placeholder="Briefly describe your launch..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-orange-200 text-sm mb-1">Launch Type</label>
                  <select
                    value={formData.launchType}
                    onChange={(e) => setFormData({ ...formData, launchType: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="product" className="bg-gray-900">Product</option>
                    <option value="service" className="bg-gray-900">Service</option>
                    <option value="course" className="bg-gray-900">Course</option>
                    <option value="book" className="bg-gray-900">Book</option>
                    <option value="event" className="bg-gray-900">Event</option>
                    <option value="business" className="bg-gray-900">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-orange-200 text-sm mb-1">Launch Date</label>
                  <input
                    type="date"
                    required
                    value={formData.launchDate}
                    onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Launch Goals</h2>
            <p className="text-orange-200 text-sm mb-4">Set your targets (optional but recommended)</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-orange-200 text-sm mb-1">Revenue Goal (£)</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={formData.goals.revenue}
                  onChange={(e) => setFormData({
                    ...formData,
                    goals: { ...formData.goals, revenue: e.target.value },
                  })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-orange-200 text-sm mb-1">Signups/Sales Goal</label>
                <input
                  type="number"
                  placeholder="100"
                  value={formData.goals.signups}
                  onChange={(e) => setFormData({
                    ...formData,
                    goals: { ...formData.goals, signups: e.target.value },
                  })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-orange-200 text-sm mb-1">Email List Growth</label>
                <input
                  type="number"
                  placeholder="500"
                  value={formData.goals.emailGrowth}
                  onChange={(e) => setFormData({
                    ...formData,
                    goals: { ...formData.goals, emailGrowth: e.target.value },
                  })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-blue-400/20">
            <h3 className="text-white font-bold mb-2">✨ AI-Powered Checklist</h3>
            <p className="text-blue-200 text-sm">
              We'll automatically generate a custom launch checklist based on your launch type, timeline, and goals.
              You can edit tasks and add your own as needed.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🚀 Creating Launch Plan...' : '🚀 Create Launch Plan'}
          </button>
        </form>
      </div>
    </div>
  );
}
