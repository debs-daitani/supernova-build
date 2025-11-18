import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Serve user websites (public access)
 * Handles both subdomain.daitaniverse.space and custom domains
 */

// Homepage or specific page
router.get('/:subdomain/:slug?', async (req, res) => {
  try {
    const { subdomain, slug } = req.params;
    const hostname = req.hostname;

    // Find website by subdomain or custom domain
    let website;

    if (hostname.includes('daitaniverse.space')) {
      // Subdomain access
      website = await prisma.website.findUnique({
        where: { subdomain },
        include: {
          pages: {
            where: { published: true },
            orderBy: { order: 'asc' }
          }
        }
      });
    } else {
      // Custom domain access
      website = await prisma.website.findUnique({
        where: { customDomain: hostname },
        include: {
          pages: {
            where: { published: true },
            orderBy: { order: 'asc' }
          }
        }
      });
    }

    if (!website || !website.published) {
      return res.status(404).send('<h1>Website not found</h1>');
    }

    // Get requested page (or homepage if no slug)
    const requestedSlug = slug || 'home';
    const page = website.pages.find(p => p.slug === requestedSlug);

    if (!page) {
      return res.status(404).send('<h1>Page not found</h1>');
    }

    // Render page
    const html = renderPage(website, page);

    res.send(html);
  } catch (error) {
    console.error('Error rendering website:', error);
    res.status(500).send('<h1>Error loading website</h1>');
  }
});

/**
 * Render page content to HTML
 */
function renderPage(website, page) {
  const theme = website.theme || {};
  const content = page.content || { blocks: [] };

  // Generate CSS from theme
  const css = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: ${theme.fonts?.body || 'Inter, sans-serif'};
        color: ${theme.colors?.text || '#1F2937'};
        background-color: ${theme.colors?.background || '#FFFFFF'};
        line-height: 1.6;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: ${theme.fonts?.heading || 'Inter, sans-serif'};
      }
      .section { width: 100%; }
      .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
      .btn {
        display: inline-block;
        padding: 12px 24px;
        background-color: ${theme.colors?.primary || '#FF1493'};
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        transition: opacity 0.2s;
      }
      .btn:hover { opacity: 0.9; }
      img { max-width: 100%; height: auto; }
    </style>
  `;

  // Render blocks recursively
  const bodyHTML = renderBlocks(content.blocks || []);

  // Complete HTML page
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${page.seoTitle || page.title || website.title || website.name}</title>
      <meta name="description" content="${page.seoDescription || website.seoDescription || ''}">
      ${website.favicon ? `<link rel="icon" href="${website.favicon}">` : ''}
      ${css}
      ${website.googleAnalyticsId ? `
        <script async src="https://www.googletagmanager.com/gtag/js?id=${website.googleAnalyticsId}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${website.googleAnalyticsId}');
        </script>
      ` : ''}
    </head>
    <body>
      ${bodyHTML}
    </body>
    </html>
  `;
}

/**
 * Render blocks to HTML
 */
function renderBlocks(blocks) {
  if (!blocks || blocks.length === 0) return '';

  return blocks.map(block => {
    const props = block.props || {};
    const children = block.children || [];

    switch (block.type) {
      case 'section':
        const sectionStyles = {
          backgroundColor: props.backgroundColor,
          padding: props.padding,
          textAlign: props.textAlign
        };
        const sectionStyleStr = Object.entries(sectionStyles)
          .filter(([_, v]) => v)
          .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
          .join('; ');

        return `
          <section class="section" style="${sectionStyleStr}">
            <div class="container">
              ${renderBlocks(children)}
            </div>
          </section>
        `;

      case 'heading':
        const level = props.level || 'h2';
        const headingStyles = {
          color: props.color,
          fontSize: props.fontSize,
          fontWeight: props.fontWeight,
          textAlign: props.textAlign,
          margin: props.margin,
          padding: props.padding
        };
        const headingStyleStr = Object.entries(headingStyles)
          .filter(([_, v]) => v)
          .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
          .join('; ');

        return `<${level} style="${headingStyleStr}">${props.text || ''}</${level}>`;

      case 'paragraph':
        const pStyles = {
          color: props.color,
          fontSize: props.fontSize,
          textAlign: props.textAlign,
          margin: props.margin,
          padding: props.padding
        };
        const pStyleStr = Object.entries(pStyles)
          .filter(([_, v]) => v)
          .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
          .join('; ');

        return `<p style="${pStyleStr}">${props.text || ''}</p>`;

      case 'button':
        const btnText = props.text || 'Click Me';
        const btnLink = props.link || '#';
        return `<a href="${btnLink}" class="btn">${btnText}</a>`;

      case 'image':
        const imgSrc = props.src || '';
        const imgAlt = props.alt || '';
        const imgStyles = {
          width: props.width,
          height: props.height,
          borderRadius: props.borderRadius,
          margin: props.margin
        };
        const imgStyleStr = Object.entries(imgStyles)
          .filter(([_, v]) => v)
          .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
          .join('; ');

        return `<img src="${imgSrc}" alt="${imgAlt}" style="${imgStyleStr}">`;

      case 'video':
        const videoUrl = props.url || '';
        // Support YouTube embeds
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
          if (videoId) {
            return `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
          }
        }
        return `<p>Video: ${videoUrl}</p>`;

      case 'divider':
        return `<hr style="margin: ${props.margin || '20px 0'}; border: none; border-top: 1px solid #E5E7EB;">`;

      default:
        return renderBlocks(children);
    }
  }).join('\n');
}

export default router;
