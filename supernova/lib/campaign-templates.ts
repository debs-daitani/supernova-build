/**
 * Campaign Email Templates for dAItaniverse
 *
 * Pre-built branded email templates that users can select from when creating campaigns.
 */

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // Icon/emoji for display
  getHtml: (content: string, options?: TemplateOptions) => string;
}

export interface TemplateOptions {
  headline?: string;
  ctaText?: string;
  ctaUrl?: string;
  section2?: string;
  section3?: string;
}

// Brand colours
const BRAND = {
  pink: '#FF008E',
  cyan: '#00F0E9',
  dark: '#1a1a1a',
  darker: '#0a0a0a',
  white: '#ffffff',
  gray: '#888888',
  lightGray: '#cccccc',
};

// Common footer for all templates
const getFooter = () => `
<div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #3d3d3d;">
  <table width="100%" cellpadding="0" cellspacing="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <tr>
      <td align="center" style="padding-bottom: 20px;">
        <img src="https://daitaniverse.space/images/logo-full-400.png" alt="dAItaniverse" width="200" style="max-width: 200px;" />
      </td>
    </tr>
    <tr>
      <td align="center" style="color: ${BRAND.gray}; font-size: 14px; line-height: 1.6;">
        The AI-powered business ecosystem for neurodivergent entrepreneurs
      </td>
    </tr>
    <tr>
      <td align="center" style="padding-top: 20px; padding-bottom: 20px;">
        <a href="https://instagram.com/daitaniverse" style="display: inline-block; margin: 0 8px; color: ${BRAND.cyan}; text-decoration: none;">Instagram</a>
        <span style="color: ${BRAND.gray};">|</span>
        <a href="https://linkedin.com/company/daitaniverse" style="display: inline-block; margin: 0 8px; color: ${BRAND.cyan}; text-decoration: none;">LinkedIn</a>
        <span style="color: ${BRAND.gray};">|</span>
        <a href="https://facebook.com/daitaniverse" style="display: inline-block; margin: 0 8px; color: ${BRAND.cyan}; text-decoration: none;">Facebook</a>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding-top: 10px;">
        <a href="{{unsubscribeUrl}}" style="color: ${BRAND.gray}; font-size: 12px; text-decoration: underline;">Unsubscribe</a>
      </td>
    </tr>
  </table>
</div>
`;

export const campaignTemplates: CampaignTemplate[] = [
  {
    id: 'none',
    name: 'No Template',
    description: 'Plain HTML - just your content',
    thumbnail: '📝',
    getHtml: (content: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px; background-color: ${BRAND.darker}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: ${BRAND.white}; font-size: 16px; line-height: 1.7;">
  <div style="max-width: 600px; margin: 0 auto;">
    ${content}
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #3d3d3d; text-align: center;">
      <a href="{{unsubscribeUrl}}" style="color: ${BRAND.gray}; font-size: 12px; text-decoration: underline;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'simple-branded',
    name: 'Simple Branded',
    description: 'Clean layout with logo header and brand colours',
    thumbnail: '🎨',
    getHtml: (content: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.darker}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.darker};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: ${BRAND.dark}; border-radius: 16px; overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px 40px; background: linear-gradient(135deg, ${BRAND.pink}20, ${BRAND.cyan}20);">
              <img src="https://daitaniverse.space/images/logo-full-400.png" alt="dAItaniverse" width="200" style="max-width: 200px;" />
            </td>
          </tr>

          <!-- Content Area -->
          <tr>
            <td style="padding: 40px; color: ${BRAND.white}; font-size: 16px; line-height: 1.7;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              ${getFooter()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'personal',
    name: 'Personal',
    description: 'Minimal design that looks like a personal email',
    thumbnail: '💌',
    getHtml: (content: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.darker}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.darker};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: ${BRAND.dark}; border-radius: 16px; overflow: hidden;">
          <!-- Small Logo Header -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <img src="https://daitaniverse.space/images/logo-icon-40.png" alt="dAItaniverse" width="40" height="40" style="width: 40px; height: 40px;" />
            </td>
          </tr>

          <!-- Content Area - Simple Text Style -->
          <tr>
            <td style="padding: 0 40px 40px 40px; color: ${BRAND.white}; font-size: 16px; line-height: 1.8;">
              ${content}
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="padding: 0 40px 40px 40px; border-top: 1px solid #3d3d3d;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-top: 20px; color: ${BRAND.gray}; font-size: 13px;">
                    Sent from dAItaniverse
                    <br />
                    <a href="{{unsubscribeUrl}}" style="color: ${BRAND.gray}; text-decoration: underline;">Unsubscribe</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'Bold gradient header for big news',
    thumbnail: '📢',
    getHtml: (content: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.darker}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.darker};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: ${BRAND.dark}; border-radius: 16px; overflow: hidden;">
          <!-- Bold Gradient Header -->
          <tr>
            <td align="center" style="padding: 50px 40px; background: linear-gradient(135deg, ${BRAND.pink}, ${BRAND.cyan});">
              <img src="https://daitaniverse.space/images/logo-full-400.png" alt="dAItaniverse" width="180" style="max-width: 180px;" />
            </td>
          </tr>

          <!-- Content Area -->
          <tr>
            <td style="padding: 40px; color: ${BRAND.white}; font-size: 16px; line-height: 1.7;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              ${getFooter()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Multi-section layout for regular updates',
    thumbnail: '📰',
    getHtml: (content: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.darker}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.darker};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: ${BRAND.dark}; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px; background: linear-gradient(135deg, ${BRAND.pink}15, ${BRAND.cyan}15); border-bottom: 1px solid #3d3d3d;">
              <img src="https://daitaniverse.space/images/logo-full-400.png" alt="dAItaniverse" width="180" style="max-width: 180px;" />
              <p style="margin: 15px 0 0 0; color: ${BRAND.gray}; font-size: 14px;">Your weekly dose of neurodivergent entrepreneurship</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px; color: ${BRAND.white}; font-size: 16px; line-height: 1.7;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              ${getFooter()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }
];

/**
 * Get a template by ID
 */
export function getCampaignTemplate(id: string): CampaignTemplate | undefined {
  return campaignTemplates.find(t => t.id === id);
}

/**
 * Apply content to a template
 */
export function applyTemplate(templateId: string, content: string, options?: TemplateOptions): string {
  const template = getCampaignTemplate(templateId);
  if (!template) {
    // Default to simple branded if template not found
    const simpleBranded = getCampaignTemplate('simple-branded');
    return simpleBranded ? simpleBranded.getHtml(content, options) : content;
  }

  return template.getHtml(content, options);
}
