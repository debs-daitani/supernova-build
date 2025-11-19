export default function BrandHub() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Brand Hub</h1>
        <p className="text-gray-600 mt-2">Your professional portfolio/website builder</p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-2xl font-semibold mb-2">Build Your Personal Brand Hub</h2>
          <p className="text-gray-600 mb-6">A beautiful one-page site to showcase your work</p>
          <button className="btn btn-primary">Create Your Hub</button>
        </div>

        <div className="mt-8 pt-8 border-t">
          <h3 className="font-semibold mb-4">Features:</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Custom URL: daitaniverse.space/u/username</li>
            <li>✅ Hero section with headline & tagline</li>
            <li>✅ About section with rich text</li>
            <li>✅ Services showcase</li>
            <li>✅ Portfolio gallery with lightbox</li>
            <li>✅ Testimonials carousel</li>
            <li>✅ Contact form & Calendly integration</li>
            <li>✅ Multiple professional themes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
