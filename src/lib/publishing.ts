// Publishing engine - Convert JSON page content to HTML

export function renderPageToHTML(page: any, website: any): string {
  const { title, content, seoTitle, seoDescription, seoImage } = page
  const { theme, customCSS, customJS, analyticsCode } = website

  const sections = Array.isArray(content) ? content : []

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHTML(seoDescription || '')}">
  <meta name="keywords" content="${escapeHTML(website.seoKeywords || '')}">

  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHTML(seoTitle || title)}">
  <meta property="og:description" content="${escapeHTML(seoDescription || '')}">
  ${seoImage ? `<meta property="og:image" content="${escapeHTML(seoImage)}">` : ''}

  <title>${escapeHTML(seoTitle || title)}</title>

  ${website.favicon ? `<link rel="icon" href="${escapeHTML(website.favicon)}">` : ''}

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .hero {
      padding: 80px 20px;
      text-align: center;
    }

    .hero h1 {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }

    .hero p {
      font-size: 1.25rem;
      color: #666;
      margin-bottom: 2rem;
    }

    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, ${theme?.primaryColor || '#ec4899'}, ${theme?.secondaryColor || '#8b5cf6'});
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: opacity 0.2s;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .features {
      padding: 64px 20px;
    }

    .features h2 {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 1rem;
    }

    .features-description {
      text-align: center;
      color: #666;
      margin-bottom: 3rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .feature {
      text-align: center;
      padding: 2rem;
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .feature p {
      color: #666;
    }

    .contact {
      padding: 64px 20px;
    }

    .contact h2 {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 1rem;
    }

    .contact-description {
      text-align: center;
      color: #666;
      margin-bottom: 3rem;
    }

    .contact-form {
      max-width: 600px;
      margin: 0 auto;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 150px;
    }

    .pricing {
      padding: 64px 20px;
    }

    .pricing h2 {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 1rem;
    }

    .pricing-description {
      text-align: center;
      color: #666;
      margin-bottom: 3rem;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .pricing-plan {
      border: 1px solid #ddd;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
    }

    .pricing-plan.featured {
      border: 2px solid ${theme?.primaryColor || '#ec4899'};
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .pricing-plan h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .pricing-plan .price {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .pricing-plan .period {
      color: #666;
      margin-bottom: 2rem;
    }

    .pricing-plan ul {
      list-style: none;
      margin-bottom: 2rem;
      text-align: left;
    }

    .pricing-plan li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .cta {
      padding: 80px 20px;
      text-align: center;
      color: white;
    }

    .cta h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .cta p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta .btn {
      background: white;
      color: ${theme?.primaryColor || '#ec4899'};
    }

    ${customCSS || ''}
  </style>

  ${analyticsCode || ''}
</head>
<body>
  ${sections.map(section => renderSection(section, theme)).join('\n')}

  ${customJS ? `<script>${customJS}</script>` : ''}
</body>
</html>
`.trim()
}

function renderSection(section: any, theme: any): string {
  const type = section.type || 'text'

  if (type === 'hero') {
    return `
<section class="hero" style="background-color: ${section.backgroundColor || '#f8f9fa'};">
  <div class="container">
    <h1>${escapeHTML(section.headline || '')}</h1>
    <p>${escapeHTML(section.subheadline || '')}</p>
    ${section.ctaText ? `<a href="${escapeHTML(section.ctaLink || '#')}" class="btn">${escapeHTML(section.ctaText)}</a>` : ''}
  </div>
</section>
    `
  }

  if (type === 'features') {
    const features = section.features || []
    return `
<section class="features">
  <div class="container">
    ${section.title ? `<h2>${escapeHTML(section.title)}</h2>` : ''}
    ${section.description ? `<p class="features-description">${escapeHTML(section.description)}</p>` : ''}
    <div class="features-grid">
      ${features.map((f: any) => `
        <div class="feature">
          <div class="feature-icon">${f.icon || '⭐'}</div>
          <h3>${escapeHTML(f.title || '')}</h3>
          <p>${escapeHTML(f.description || '')}</p>
        </div>
      `).join('')}
    </div>
  </div>
</section>
    `
  }

  if (type === 'contact') {
    return `
<section class="contact">
  <div class="container">
    ${section.title ? `<h2>${escapeHTML(section.title)}</h2>` : ''}
    ${section.description ? `<p class="contact-description">${escapeHTML(section.description)}</p>` : ''}
    <form class="contact-form" action="/api/form-submissions" method="POST">
      <div class="form-group">
        <input type="text" name="name" placeholder="Your Name" required>
      </div>
      <div class="form-group">
        <input type="email" name="email" placeholder="Your Email" required>
      </div>
      ${section.formFields?.includes('phone') ? `
      <div class="form-group">
        <input type="tel" name="phone" placeholder="Your Phone">
      </div>
      ` : ''}
      <div class="form-group">
        <textarea name="message" placeholder="Your Message" required></textarea>
      </div>
      <button type="submit" class="btn">${escapeHTML(section.submitText || 'Send Message')}</button>
    </form>
  </div>
</section>
    `
  }

  if (type === 'pricing') {
    const plans = section.plans || []
    return `
<section class="pricing">
  <div class="container">
    ${section.title ? `<h2>${escapeHTML(section.title)}</h2>` : ''}
    ${section.description ? `<p class="pricing-description">${escapeHTML(section.description)}</p>` : ''}
    <div class="pricing-grid">
      ${plans.map((plan: any) => `
        <div class="pricing-plan ${plan.featured ? 'featured' : ''}">
          <h3>${escapeHTML(plan.name || '')}</h3>
          <div class="price">${escapeHTML(plan.price || '')}</div>
          <div class="period">${escapeHTML(plan.period || '')}</div>
          <ul>
            ${(plan.features || []).map((f: string) => `<li>✓ ${escapeHTML(f)}</li>`).join('')}
          </ul>
          <a href="${escapeHTML(plan.ctaLink || '#')}" class="btn">${escapeHTML(plan.ctaText || 'Get Started')}</a>
        </div>
      `).join('')}
    </div>
  </div>
</section>
    `
  }

  if (type === 'cta') {
    return `
<section class="cta" style="background-color: ${section.backgroundColor || '#ec4899'};">
  <div class="container">
    <h2>${escapeHTML(section.headline || '')}</h2>
    <p>${escapeHTML(section.description || '')}</p>
    ${section.ctaText ? `<a href="${escapeHTML(section.ctaLink || '#')}" class="btn">${escapeHTML(section.ctaText)}</a>` : ''}
  </div>
</section>
    `
  }

  return ''
}

function escapeHTML(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function generateSitemap(pages: any[]): string {
  const urls = pages.map(page => {
    return `
  <url>
    <loc>https://${page.website.subdomain}/${page.slug}</loc>
    <lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.isHomepage ? '1.0' : '0.8'}</priority>
  </url>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}
