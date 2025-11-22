'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Page {
  id: string
  title: string
  slug: string
  content: any[]
}

export default function PreviewPage() {
  const params = useParams()
  const websiteId = params.id as string

  const [pages, setPages] = useState<Page[]>([])
  const [currentPage, setCurrentPage] = useState<Page | null>(null)

  useEffect(() => {
    fetchPages()
  }, [websiteId])

  const fetchPages = async () => {
    try {
      const response = await fetch(`/api/pages?websiteId=${websiteId}`)
      const data = await response.json()
      setPages(data)
      setCurrentPage(data.find((p: Page) => p.isHomepage) || data[0])
    } catch (error) {
      console.error('Error fetching pages:', error)
    }
  }

  if (!currentPage) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-bold text-xl">Preview</div>
          <div className="flex gap-4">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg ${
                  currentPage.id === page.id
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {currentPage.content && currentPage.content.length > 0 ? (
          currentPage.content.map((section, index) => (
            <RenderSection key={index} section={section} />
          ))
        ) : (
          <div className="container mx-auto px-4 py-20 text-center">
            <p className="text-gray-500">This page has no content yet</p>
          </div>
        )}
      </main>
    </div>
  )
}

function RenderSection({ section }: { section: any }) {
  const type = section.type || 'text'

  return (
    <section className="w-full">
      {type === 'hero' && (
        <div
          className="py-20 px-4 text-center"
          style={{
            backgroundColor: section.backgroundColor || '#f8f9fa',
            backgroundImage: section.backgroundImage ? `url(${section.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{section.headline}</h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">{section.subheadline}</p>
            {section.ctaText && (
              <a
                href={section.ctaLink || '#'}
                className="inline-block bg-gradient-pink-purple text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
              >
                {section.ctaText}
              </a>
            )}
          </div>
        </div>
      )}

      {type === 'features' && (
        <div className="py-16 px-4">
          <div className="container mx-auto">
            {section.title && (
              <h2 className="text-4xl font-bold text-center mb-4">{section.title}</h2>
            )}
            {section.description && (
              <p className="text-xl text-center text-gray-600 mb-12">{section.description}</p>
            )}
            <div className={`grid md:grid-cols-${section.variant === '4-column' ? '4' : '3'} gap-8`}>
              {(section.features || []).map((feature: any, i: number) => (
                <div key={i} className="text-center p-6">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {type === 'testimonials' && (
        <div className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            {section.title && (
              <h2 className="text-4xl font-bold text-center mb-12">{section.title}</h2>
            )}
            <div className="grid md:grid-cols-3 gap-8">
              {(section.testimonials || []).map((testimonial: any, i: number) => (
                <div key={i} className="bg-white p-8 rounded-xl shadow-lg">
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-pink-purple" />
                    <div>
                      <p className="font-bold">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {type === 'pricing' && (
        <div className="py-16 px-4">
          <div className="container mx-auto">
            {section.title && (
              <h2 className="text-4xl font-bold text-center mb-4">{section.title}</h2>
            )}
            {section.description && (
              <p className="text-xl text-center text-gray-600 mb-12">{section.description}</p>
            )}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {(section.plans || []).map((plan: any, i: number) => (
                <div
                  key={i}
                  className={`bg-white rounded-xl p-8 ${
                    plan.featured ? 'ring-2 ring-pink-500 shadow-xl' : 'border shadow-lg'
                  }`}
                >
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600"> {plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {(plan.features || []).map((feature: string, j: number) => (
                      <li key={j} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={plan.ctaLink || '#'}
                    className={`block text-center py-3 rounded-lg font-semibold ${
                      plan.featured
                        ? 'bg-gradient-pink-purple text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.ctaText}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {type === 'contact' && (
        <div className="py-16 px-4">
          <div className="container mx-auto max-w-2xl">
            {section.title && (
              <h2 className="text-4xl font-bold text-center mb-4">{section.title}</h2>
            )}
            {section.description && (
              <p className="text-xl text-center text-gray-600 mb-12">{section.description}</p>
            )}
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border border-gray-300 rounded-lg p-4"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full border border-gray-300 rounded-lg p-4"
              />
              {section.formFields?.includes('phone') && (
                <input
                  type="tel"
                  placeholder="Your Phone"
                  className="w-full border border-gray-300 rounded-lg p-4"
                />
              )}
              <textarea
                placeholder="Your Message"
                rows={6}
                className="w-full border border-gray-300 rounded-lg p-4"
              />
              <button
                type="submit"
                className="w-full bg-gradient-pink-purple text-white py-4 rounded-lg font-semibold hover:opacity-90"
              >
                {section.submitText || 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}

      {type === 'cta' && (
        <div
          className="py-20 px-4 text-center"
          style={{ backgroundColor: section.backgroundColor || '#ec4899' }}
        >
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{section.headline}</h2>
            <p className="text-xl text-white/90 mb-8">{section.description}</p>
            {section.ctaText && (
              <a
                href={section.ctaLink || '#'}
                className="inline-block bg-white text-pink-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {section.ctaText}
              </a>
            )}
          </div>
        </div>
      )}

      {type === 'footer' && (
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="font-bold text-xl mb-4">Company</div>
              </div>
              {(section.columns || []).map((col: any, i: number) => (
                <div key={i}>
                  <div className="font-semibold mb-4">{col.title}</div>
                  <ul className="space-y-2">
                    {(col.links || []).map((link: any, j: number) => (
                      <li key={j}>
                        <a href={link.url} className="text-gray-400 hover:text-white">
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              {section.copyright}
            </div>
          </div>
        </footer>
      )}
    </section>
  )
}
