export default function ShortLinks() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Short Links</h1>
        <p className="text-gray-600 mt-2">Create branded short links (Bitly alternative)</p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-2xl font-semibold mb-2">Shorten & Track Your Links</h2>
          <p className="text-gray-600 mb-6">Create short, trackable links: daitani.uk/abc123</p>
          <button className="btn btn-primary">Create Short Link</button>
        </div>

        <div className="mt-8 pt-8 border-t">
          <h3 className="font-semibold mb-4">Features:</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Custom short codes or auto-generate</li>
            <li>✅ Optional link expiration</li>
            <li>✅ Click tracking and analytics</li>
            <li>✅ Geographic data (if available)</li>
            <li>✅ Referrer tracking</li>
            <li>✅ Unlimited short links</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
