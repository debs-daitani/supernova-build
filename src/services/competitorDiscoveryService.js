/**
 * SUPERNova Competitor Tracker - Discovery Service
 *
 * Auto-discover competitor information:
 * - Extract company info from website
 * - Find social media profiles
 * - Discover pricing and products
 * - Take initial screenshots
 * - Use AI to enrich data
 */

import { fetch } from 'wix-fetch';
import { createCompetitor } from './competitorService';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = 'YOUR_ANTHROPIC_API_KEY';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Discover competitor from URL
 * @param {string} userId - User ID
 * @param {string} url - Competitor website URL
 * @returns {Promise<Object>} Discovered competitor data
 */
export async function discoverFromURL(userId, url) {
  try {
    // Normalize URL
    const normalizedUrl = normalizeURL(url);

    // Fetch website content
    const htmlContent = await fetchWebsite(normalizedUrl);

    // Extract basic info from HTML
    const basicInfo = extractBasicInfo(htmlContent, normalizedUrl);

    // Use AI to enrich the data
    const enrichedData = await enrichWithAI(basicInfo, htmlContent);

    // Discover social media profiles
    const socialProfiles = discoverSocialProfiles(htmlContent);

    // Combine all data
    const competitorData = {
      name: enrichedData.name || basicInfo.title || 'Unknown Company',
      website: normalizedUrl,
      description: enrichedData.description || basicInfo.description || '',
      industry: enrichedData.industry || '',
      size: enrichedData.size || 'small',
      founded: enrichedData.founded || '',
      location: enrichedData.location || '',
      status: 'active',
      relationship: 'direct',
      logo: basicInfo.logo || '',
      socialProfiles,
      notes: '',
      monitoringEnabled: true
    };

    // Create the competitor
    const competitor = await createCompetitor(userId, competitorData);

    return {
      competitor,
      discoveredData: {
        basicInfo,
        enrichedData,
        socialProfiles
      }
    };
  } catch (error) {
    console.error('Error discovering competitor from URL:', error);
    throw new Error(`Failed to discover competitor: ${error.message}`);
  }
}

/**
 * Discover competitor from company name
 * @param {string} userId - User ID
 * @param {string} companyName - Company name
 * @returns {Promise<Object>} Discovered competitor data
 */
export async function discoverFromName(userId, companyName) {
  try {
    // Use AI to find the company's website
    const websiteUrl = await findWebsiteForCompany(companyName);

    if (!websiteUrl) {
      throw new Error(`Could not find website for ${companyName}`);
    }

    // Now use URL discovery
    return await discoverFromURL(userId, websiteUrl);
  } catch (error) {
    console.error('Error discovering competitor from name:', error);
    throw new Error(`Failed to discover competitor: ${error.message}`);
  }
}

/**
 * Normalize URL
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL
 */
function normalizeURL(url) {
  let normalized = url.trim();

  // Add https:// if no protocol
  if (!normalized.match(/^https?:\/\//)) {
    normalized = 'https://' + normalized;
  }

  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');

  return normalized;
}

/**
 * Fetch website content
 * @param {string} url - Website URL
 * @returns {Promise<string>} HTML content
 */
async function fetchWebsite(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CompetitorTracker/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error fetching website:', error);
    throw new Error(`Failed to fetch website: ${error.message}`);
  }
}

/**
 * Extract basic info from HTML
 * @param {string} html - HTML content
 * @param {string} url - Website URL
 * @returns {Object} Basic information
 */
function extractBasicInfo(html, url) {
  const info = {
    url,
    title: '',
    description: '',
    keywords: [],
    logo: ''
  };

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    info.title = titleMatch[1].trim();
  }

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) {
    info.description = descMatch[1].trim();
  }

  // Extract meta keywords
  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
  if (keywordsMatch) {
    info.keywords = keywordsMatch[1].split(',').map(k => k.trim());
  }

  // Extract Open Graph image (often the logo)
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogImageMatch) {
    info.logo = ogImageMatch[1];
  }

  return info;
}

/**
 * Enrich data with AI
 * @param {Object} basicInfo - Basic information
 * @param {string} htmlContent - Full HTML content
 * @returns {Promise<Object>} Enriched data
 */
async function enrichWithAI(basicInfo, htmlContent) {
  try {
    // Extract visible text from HTML (simplified)
    const textContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // Limit to first 5000 chars

    const prompt = `Analyze this company website and extract key information.

WEBSITE: ${basicInfo.url}
TITLE: ${basicInfo.title}
META DESCRIPTION: ${basicInfo.description}

CONTENT:
${textContent}

Extract and return JSON:
{
  "name": "official company name",
  "description": "1-2 sentence description of what they do",
  "industry": "industry/sector",
  "size": "startup|small|medium|large|enterprise (estimate)",
  "founded": "year if mentioned",
  "location": "headquarters location if mentioned"
}`;

    const response = await callClaudeAPI(prompt);

    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return {
        name: basicInfo.title,
        description: basicInfo.description,
        industry: '',
        size: 'small',
        founded: '',
        location: ''
      };
    }
  } catch (error) {
    console.error('Error enriching with AI:', error);
    return {
      name: basicInfo.title,
      description: basicInfo.description,
      industry: '',
      size: 'small',
      founded: '',
      location: ''
    };
  }
}

/**
 * Discover social media profiles from HTML
 * @param {string} html - HTML content
 * @returns {Object} Social media profiles
 */
function discoverSocialProfiles(html) {
  const profiles = {
    twitter: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    youtube: '',
    tiktok: ''
  };

  // Twitter/X
  const twitterMatch = html.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i);
  if (twitterMatch) {
    profiles.twitter = `https://twitter.com/${twitterMatch[1]}`;
  }

  // LinkedIn
  const linkedinMatch = html.match(/linkedin\.com\/company\/([a-zA-Z0-9-]+)/i);
  if (linkedinMatch) {
    profiles.linkedin = `https://linkedin.com/company/${linkedinMatch[1]}`;
  }

  // Instagram
  const instagramMatch = html.match(/instagram\.com\/([a-zA-Z0-9_.]+)/i);
  if (instagramMatch) {
    profiles.instagram = `https://instagram.com/${instagramMatch[1]}`;
  }

  // Facebook
  const facebookMatch = html.match(/facebook\.com\/([a-zA-Z0-9.]+)/i);
  if (facebookMatch) {
    profiles.facebook = `https://facebook.com/${facebookMatch[1]}`;
  }

  // YouTube
  const youtubeMatch = html.match(/youtube\.com\/(channel\/|c\/|user\/|@)?([a-zA-Z0-9_-]+)/i);
  if (youtubeMatch) {
    profiles.youtube = `https://youtube.com/${youtubeMatch[2]}`;
  }

  // TikTok
  const tiktokMatch = html.match(/tiktok\.com\/@([a-zA-Z0-9_.]+)/i);
  if (tiktokMatch) {
    profiles.tiktok = `https://tiktok.com/@${tiktokMatch[1]}`;
  }

  return profiles;
}

/**
 * Find website for a company name using AI
 * @param {string} companyName - Company name
 * @returns {Promise<string>} Website URL
 */
async function findWebsiteForCompany(companyName) {
  try {
    const prompt = `What is the official website URL for the company "${companyName}"?

Return ONLY the URL, nothing else. If you're not sure, return your best guess.

Example: https://example.com`;

    const response = await callClaudeAPI(prompt);

    // Extract URL from response
    const urlMatch = response.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      return normalizeURL(urlMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('Error finding website for company:', error);
    return null;
  }
}

/**
 * Call Claude API
 * @param {string} prompt - Prompt
 * @returns {Promise<string>} Response
 */
async function callClaudeAPI(prompt) {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling AI API:', error);
    throw error;
  }
}

/**
 * Import competitors from CSV
 * @param {string} userId - User ID
 * @param {string} csvData - CSV data
 * @returns {Promise<Array>} Import results
 */
export async function importFromCSV(userId, csvData) {
  try {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const results = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map(v => v.trim());
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      try {
        let competitor;

        if (row.website) {
          competitor = await discoverFromURL(userId, row.website);
        } else if (row.name) {
          competitor = await discoverFromName(userId, row.name);
        } else {
          continue;
        }

        results.push({
          success: true,
          competitor: competitor.competitor
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          row
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error importing from CSV:', error);
    throw error;
  }
}

export default {
  discoverFromURL,
  discoverFromName,
  importFromCSV
};
