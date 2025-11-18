export default function LinksPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Links Page</h1>
        <p className="text-gray-600 mt-2">Your custom link-in-bio page (AllMyLinks alternative)</p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-2xl font-semibold mb-2">Create Your Link-in-Bio Page</h2>
          <p className="text-gray-600 mb-6">One page for all your important links</p>
          <button className="btn btn-primary">Set Up Your Page</button>
        </div>

        <div className="mt-8 pt-8 border-t">
          <h3 className="font-semibold mb-4">Features:</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Custom URL: daitaniverse.space/@username</li>
            <li>✅ Unlimited links with custom icons</li>
            <li>✅ 4 beautiful themes (Default, Minimal, Bold, Neon)</li>
            <li>✅ Custom colors and branding</li>
            <li>✅ Click analytics for each link</li>
            <li>✅ Drag-and-drop link reordering</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
