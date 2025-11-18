import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../config/database.js';
import { authenticateToken as authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.use(authMiddleware);

// ============================================
// BLOG POST GENERATOR
// ============================================

router.post('/blog', async (req, res) => {
  try {
    const {
      topic,
      keywords = [],
      targetAudience,
      tone = 'professional',
      length = 'medium', // short (500), medium (1000), long (1500-2000)
      outline = [],
      includeIntro = true,
      includeStats = false,
      includeExamples = true,
      includeTips = true,
      includeFAQ = false,
      includeConclusion = true,
    } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const wordCount = length === 'short' ? 500 : length === 'medium' ? 1000 : 1500;
    const keywordsList = Array.isArray(keywords) ? keywords.join(', ') : keywords;

    const prompt = `Generate a comprehensive, SEO-optimized blog post about: "${topic}"

Target Audience: ${targetAudience || 'general audience'}
Tone: ${tone}
Target Length: ${wordCount} words
Keywords to include naturally: ${keywordsList || 'derive from topic'}

${outline.length > 0 ? `Key points to cover:\n${outline.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : ''}

STRUCTURE:

1. SEO Title (H1)
   - Compelling, includes primary keyword
   - 50-60 characters

2. Meta Description
   - 150-160 characters
   - Includes primary keyword and CTA

3. ${includeIntro ? 'Introduction (2-3 paragraphs)\n   - Hook that grabs attention\n   - Preview what readers will learn\n   - Establish credibility' : ''}

4. Main Content
   - Use H2 and H3 headings
   - ${includeStats ? 'Include relevant statistics and data' : ''}
   - ${includeExamples ? 'Provide concrete examples' : ''}
   - ${includeTips ? 'Include actionable tips and takeaways' : ''}
   - Break up text with short paragraphs
   - Use bullet points where appropriate

5. ${includeFAQ ? 'FAQ Section\n   - Answer 3-5 common questions' : ''}

6. ${includeConclusion ? 'Conclusion\n   - Summarize key points\n   - Include strong call-to-action' : ''}

Format the response as structured markdown with clear headings. Make it engaging, informative, and optimized for SEO while maintaining a ${tone} tone.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const blogContent = message.content[0].text;

    // Extract title and meta description from the content
    const titleMatch = blogContent.match(/^#\s+(.+)$/m);
    const metaMatch = blogContent.match(/\*\*Meta Description:\*\*\s*(.+)$/m);

    const title = titleMatch ? titleMatch[1] : topic;
    const metaDescription = metaMatch ? metaMatch[1] : blogContent.substring(0, 160);

    // Save to database
    const generated = await prisma.generatedContent.create({
      data: {
        userId: req.user.id,
        contentType: 'blog',
        prompt: topic,
        context: {
          keywords,
          targetAudience,
          tone,
          length,
          outline,
        },
        content: blogContent,
        variations: [blogContent],
      },
    });

    res.json({
      id: generated.id,
      title,
      metaDescription,
      content: blogContent,
      wordCount: blogContent.split(/\s+/).length,
    });
  } catch (error) {
    console.error('Blog generation error:', error);
    res.status(500).json({ error: 'Failed to generate blog post' });
  }
});

// ============================================
// SOCIAL MEDIA CAPTION GENERATOR
// ============================================

router.post('/caption', async (req, res) => {
  try {
    const {
      topic,
      platform = 'instagram',
      tone = 'casual',
      includeEmojis = true,
      includeHashtags = true,
      callToAction = 'engage',
      length = 'medium',
    } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const platformGuidelines = {
      instagram: 'Instagram (2200 char limit, visual focus, emojis encouraged)',
      facebook: 'Facebook (can be longer, conversational)',
      linkedin: 'LinkedIn (professional, thought leadership)',
      twitter: 'Twitter/X (280 chars, concise, punchy)',
      tiktok: 'TikTok (brief, trendy, engaging hooks)',
    };

    const ctaTypes = {
      engage: 'Ask a question or encourage comments',
      share: 'Ask people to share or tag friends',
      like: 'Encourage likes and saves',
      link: 'Direct to link in bio or swipe up',
      buy: 'Encourage purchase or learn more',
    };

    const prompt = `Generate 5 different social media caption variations for ${platformGuidelines[platform]}.

Topic: ${topic}
Tone: ${tone}
Length: ${length === 'short' ? '50-100 chars' : length === 'medium' ? '100-200 chars' : '200+ chars'}
${includeEmojis ? 'Include relevant emojis' : 'No emojis'}
Call-to-Action: ${ctaTypes[callToAction]}

For each variation, create a different hook and approach:
1. Question-based hook
2. Story/personal angle
3. Tip/educational
4. Bold statement
5. Emotional/inspirational

${includeHashtags ? 'After all 5 captions, suggest 15-20 relevant hashtags (mix of popular and niche).' : ''}

Format each caption clearly numbered 1-5.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const response = message.content[0].text;

    // Parse captions
    const captionMatches = response.match(/\d+\.\s*(.+?)(?=\n\d+\.|$)/gs);
    const captions = captionMatches ? captionMatches.map(c => c.replace(/^\d+\.\s*/, '').trim()) : [response];

    // Extract hashtags if requested
    let hashtags = [];
    if (includeHashtags) {
      const hashtagSection = response.match(/hashtags?:?\s*\n?(#[\w\s#]+)/i);
      if (hashtagSection) {
        hashtags = hashtagSection[1].match(/#\w+/g) || [];
      }
    }

    // Save to database
    const generated = await prisma.generatedContent.create({
      data: {
        userId: req.user.id,
        contentType: 'caption',
        prompt: topic,
        context: {
          platform,
          tone,
          includeEmojis,
          callToAction,
        },
        content: captions[0],
        variations: captions,
      },
    });

    res.json({
      id: generated.id,
      captions,
      hashtags,
      platform,
    });
  } catch (error) {
    console.error('Caption generation error:', error);
    res.status(500).json({ error: 'Failed to generate captions' });
  }
});

// ============================================
// EMAIL SUBJECT LINE GENERATOR
// ============================================

router.post('/email-subject', async (req, res) => {
  try {
    const {
      purpose,
      keyMessage,
      tone = 'professional',
      includePersonalization = false,
      includeUrgency = false,
      includeNumbers = false,
    } = req.body;

    if (!purpose || !keyMessage) {
      return res.status(400).json({ error: 'Purpose and key message are required' });
    }

    const prompt = `Generate 10 compelling email subject line variations.

Purpose: ${purpose}
Key Message: ${keyMessage}
Tone: ${tone}
${includePersonalization ? 'Include personalization placeholder {FirstName}' : ''}
${includeUrgency ? 'Create urgency (limited time, exclusive, ending soon)' : ''}
${includeNumbers ? 'Use numbers where appropriate' : ''}

Create a mix of approaches:
1-2: Curiosity-driven (make them wonder)
3-4: Benefit-driven (clear value proposition)
5-6: Urgency-driven (FOMO, scarcity)
7-8: Question-based (engage directly)
9-10: Direct/straightforward

For EACH subject line, provide:
- The subject line (under 60 characters)
- Estimated open rate potential (High/Medium/Low)
- Why it works

Keep them concise, compelling, and avoid spam triggers.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const response = message.content[0].text;

    // Parse subject lines
    const subjectLines = [];
    const lines = response.split('\n').filter(l => l.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^(\d+[\.\)])\s*"?(.+?)"?\s*$/);
      if (match) {
        const subject = match[2].replace(/"/g, '');
        let openRate = 'Medium';
        let reason = '';

        // Look for open rate and reason in next lines
        if (i + 1 < lines.length && lines[i + 1].includes('Open rate')) {
          openRate = lines[i + 1].match(/(High|Medium|Low)/i)?.[1] || 'Medium';
        }
        if (i + 2 < lines.length && !lines[i + 2].match(/^\d+[\.\)]/)) {
          reason = lines[i + 2].replace(/^-\s*/, '').trim();
        }

        subjectLines.push({
          subject,
          openRate,
          reason: reason || 'Compelling subject line',
          charCount: subject.length,
        });
      }
    }

    // Save to database
    const generated = await prisma.generatedContent.create({
      data: {
        userId: req.user.id,
        contentType: 'email',
        prompt: `${purpose}: ${keyMessage}`,
        context: {
          purpose,
          tone,
          includePersonalization,
          includeUrgency,
        },
        content: subjectLines[0]?.subject || '',
        variations: subjectLines.map(s => s.subject),
      },
    });

    res.json({
      id: generated.id,
      subjectLines,
    });
  } catch (error) {
    console.error('Email subject generation error:', error);
    res.status(500).json({ error: 'Failed to generate email subjects' });
  }
});

// ============================================
// PRODUCT DESCRIPTION GENERATOR
// ============================================

router.post('/product-desc', async (req, res) => {
  try {
    const {
      productName,
      productType,
      features = [],
      benefits = [],
      targetCustomer,
      tone = 'professional',
      length = 'medium',
    } = req.body;

    if (!productName || !productType) {
      return res.status(400).json({ error: 'Product name and type are required' });
    }

    const featuresList = Array.isArray(features) ? features.join('\n') : features;
    const benefitsList = Array.isArray(benefits) ? benefits.join('\n') : benefits;

    const prompt = `Generate compelling product descriptions for: ${productName}

Product Type: ${productType}
Target Customer: ${targetCustomer || 'general'}
Tone: ${tone}

Key Features:
${featuresList}

Benefits/Problems it solves:
${benefitsList}

Create 3 versions:

1. SHORT VERSION (100-150 words) - For marketplace listings (Amazon, eBay, Etsy)
   - Punchy headline
   - Key benefits in bullets
   - Brief CTA

2. LONG VERSION (300-400 words) - For product pages
   - Attention-grabbing headline
   - Problem-focused intro
   - Feature highlights with benefits
   - Social proof language
   - Strong CTA

3. AD COPY VERSION (50-75 words) - For Facebook/Instagram ads
   - Hook
   - Key benefit
   - Urgency/CTA

Use benefit-driven language. Focus on outcomes, not just features. Make it ${tone} and appealing to ${targetCustomer || 'your target customer'}.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const response = message.content[0].text;

    // Parse the three versions
    const shortMatch = response.match(/SHORT VERSION[:\s]+([\s\S]+?)(?=LONG VERSION|$)/i);
    const longMatch = response.match(/LONG VERSION[:\s]+([\s\S]+?)(?=AD COPY VERSION|$)/i);
    const adMatch = response.match(/AD COPY VERSION[:\s]+([\s\S]+?)$/i);

    const short = shortMatch ? shortMatch[1].trim() : '';
    const long = longMatch ? longMatch[1].trim() : '';
    const ad = adMatch ? adMatch[1].trim() : '';

    // Save to database
    const generated = await prisma.generatedContent.create({
      data: {
        userId: req.user.id,
        contentType: 'product_desc',
        prompt: productName,
        context: {
          productType,
          features,
          benefits,
          targetCustomer,
          tone,
        },
        content: long || response,
        variations: [short, long, ad].filter(Boolean),
      },
    });

    res.json({
      id: generated.id,
      short,
      long,
      ad,
    });
  } catch (error) {
    console.error('Product description generation error:', error);
    res.status(500).json({ error: 'Failed to generate product description' });
  }
});

// ============================================
// SEO META DESCRIPTION GENERATOR
// ============================================

router.post('/meta-desc', async (req, res) => {
  try {
    const {
      pageTitle,
      primaryKeyword,
      pageType = 'blog',
    } = req.body;

    if (!pageTitle || !primaryKeyword) {
      return res.status(400).json({ error: 'Page title and primary keyword are required' });
    }

    const prompt = `Generate 5 SEO-optimized meta descriptions for a ${pageType}.

Page Title: ${pageTitle}
Primary Keyword: ${primaryKeyword}

Requirements:
- Exactly 150-160 characters (CRITICAL for Google display)
- Include primary keyword naturally
- Compelling call-to-action
- Accurate preview of page content
- Action-oriented language

Create 5 different variations with different approaches:
1. Benefit-focused
2. Question-based
3. Action-oriented
4. Value proposition
5. Problem/solution

For each, provide:
- The meta description
- Character count
- Why it's effective`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const response = message.content[0].text;

    // Parse meta descriptions
    const metaDescriptions = [];
    const sections = response.split(/\d+\.\s+/).filter(s => s.trim());

    sections.forEach(section => {
      const lines = section.split('\n').filter(l => l.trim());
      if (lines.length > 0) {
        const desc = lines[0].replace(/^["']|["']$/g, '').trim();
        const charCount = desc.length;
        const reason = lines.find(l => l.toLowerCase().includes('effective') || l.toLowerCase().includes('why'))?.trim() || '';

        metaDescriptions.push({
          description: desc,
          charCount,
          reason: reason.replace(/^-\s*/, ''),
          isOptimal: charCount >= 150 && charCount <= 160,
        });
      }
    });

    // Save to database
    const generated = await prisma.generatedContent.create({
      data: {
        userId: req.user.id,
        contentType: 'meta',
        prompt: pageTitle,
        context: {
          primaryKeyword,
          pageType,
        },
        content: metaDescriptions[0]?.description || '',
        variations: metaDescriptions.map(m => m.description),
      },
    });

    res.json({
      id: generated.id,
      metaDescriptions,
    });
  } catch (error) {
    console.error('Meta description generation error:', error);
    res.status(500).json({ error: 'Failed to generate meta descriptions' });
  }
});

// ============================================
// LANDING PAGE COPY GENERATOR
// ============================================

router.post('/landing-page', async (req, res) => {
  try {
    const {
      offer,
      targetAudience,
      painPoints = [],
      benefits = [],
      callToAction,
      includeTestimonials = false,
      includeFAQ = false,
    } = req.body;

    if (!offer || !targetAudience || !callToAction) {
      return res.status(400).json({ error: 'Offer, target audience, and CTA are required' });
    }

    const painPointsList = Array.isArray(painPoints) ? painPoints.join('\n') : painPoints;
    const benefitsList = Array.isArray(benefits) ? benefits.join('\n') : benefits;

    const prompt = `Generate complete landing page copy for:

Offer: ${offer}
Target Audience: ${targetAudience}
Call-to-Action: ${callToAction}

Pain Points to address:
${painPointsList}

Benefits to highlight:
${benefitsList}

Create structured landing page copy with these sections:

1. HERO SECTION
   - Powerful headline (8-12 words, outcome-focused)
   - Compelling subheadline (expand on promise)
   - Brief intro paragraph

2. PROBLEM SECTION (Agitate pain points)
   - Empathize with their struggles
   - Paint the picture of their current situation

3. SOLUTION SECTION (Your offer)
   - Introduce your solution
   - How it solves their problems
   - Why it's different/better

4. FEATURES/BENEFITS SECTION
   - 4-6 key features with benefit-focused copy
   - Use "You'll be able to..." language

5. ${includeTestimonials ? 'SOCIAL PROOF SECTION\n   - 3 placeholder testimonial structures\n   - What results they achieved' : ''}

6. ${includeFAQ ? 'FAQ SECTION\n   - 5 common questions and answers' : ''}

7. FINAL CTA SECTION
   - Urgency/scarcity element
   - Clear action step
   - Risk reversal/guarantee

Use persuasive, benefit-driven language. Focus on transformation and outcomes.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0].text;

    // Save to database
    const generated = await prisma.generatedContent.create({
      data: {
        userId: req.user.id,
        contentType: 'landing_page',
        prompt: offer,
        context: {
          targetAudience,
          painPoints,
          benefits,
          callToAction,
        },
        content,
        variations: [content],
      },
    });

    res.json({
      id: generated.id,
      content,
    });
  } catch (error) {
    console.error('Landing page generation error:', error);
    res.status(500).json({ error: 'Failed to generate landing page copy' });
  }
});

// ============================================
// AD COPY GENERATOR
// ============================================

router.post('/ad-copy', async (req, res) => {
  try {
    const {
      platform = 'facebook',
      objective = 'conversions',
      product,
      targetAudience,
      uniqueSellingPoint,
      callToAction,
    } = req.body;

    if (!product || !targetAudience || !callToAction) {
      return res.status(400).json({ error: 'Product, target audience, and CTA are required' });
    }

    const platformSpecs = {
      facebook: 'Facebook/Instagram Feed: Primary text (125 chars for preview), Headline (40 chars), Description (30 chars)',
      google: 'Google Search: 3 headlines (30 chars each), 2 descriptions (90 chars each)',
      linkedin: 'LinkedIn: Intro text (150 chars), Headline (70 chars), Description (100 chars)',
      tiktok: 'TikTok: Primary text (100 chars), max 12-100 total)',
    };

    const prompt = `Generate 5 complete ad copy variations for ${platform}.

Platform: ${platformSpecs[platform]}
Objective: ${objective}
Product/Offer: ${product}
Target Audience: ${targetAudience}
USP: ${uniqueSellingPoint || 'Derive from product'}
CTA: ${callToAction}

Create 5 different approaches:
1. Problem/Solution angle
2. Benefit-focused
3. Feature-focused
4. Testimonial/social proof based
5. Question-based/curiosity

For EACH variation, provide:
- Primary Text (hook in first 3 words)
- Headline (compelling, benefit-driven)
- Description (expand on value)
- CTA button text

Follow character limits. Use emojis if appropriate. Focus on stopping scroll and driving action.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const response = message.content[0].text;

    // Parse ad variations (simplified parsing)
    const variations = [];
    const adBlocks = response.split(/\d+\.\s+/).filter(b => b.trim());

    adBlocks.forEach(block => {
      const primaryMatch = block.match(/Primary Text[:\s]+(.+?)(?=\n|Headline)/is);
      const headlineMatch = block.match(/Headline[:\s]+(.+?)(?=\n|Description)/is);
      const descMatch = block.match(/Description[:\s]+(.+?)(?=\n|CTA)/is);
      const ctaMatch = block.match(/CTA[:\s]+(.+?)(?=\n|$)/is);

      if (primaryMatch || headlineMatch) {
        variations.push({
          primaryText: primaryMatch?.[1].trim().replace(/^["']|["']$/g, '') || '',
          headline: headlineMatch?.[1].trim().replace(/^["']|["']$/g, '') || '',
          description: descMatch?.[1].trim().replace(/^["']|["']$/g, '') || '',
          cta: ctaMatch?.[1].trim().replace(/^["']|["']$/g, '') || callToAction,
        });
      }
    });

    // Save to database
    const generated = await prisma.generatedContent.create({
      data: {
        userId: req.user.id,
        contentType: 'ad',
        prompt: product,
        context: {
          platform,
          objective,
          targetAudience,
          uniqueSellingPoint,
        },
        content: variations[0]?.primaryText || response,
        variations: variations.map(v => JSON.stringify(v)),
      },
    });

    res.json({
      id: generated.id,
      variations,
      platform,
    });
  } catch (error) {
    console.error('Ad copy generation error:', error);
    res.status(500).json({ error: 'Failed to generate ad copy' });
  }
});

// ============================================
// CONTENT REPURPOSING TOOL
// ============================================

router.post('/repurpose', async (req, res) => {
  try {
    const {
      content,
      repurposeInto = [], // ['social', 'email', 'twitter', 'quotes', 'linkedin']
    } = req.body;

    if (!content || repurposeInto.length === 0) {
      return res.status(400).json({ error: 'Content and repurpose targets are required' });
    }

    const targetFormats = {
      social: '5 Instagram/Facebook posts (different angles, include hooks and CTAs)',
      twitter: '3 Twitter threads (10-15 tweets each, numbered)',
      email: '1 Email newsletter (subject line + body with summary and link)',
      quotes: '10 shareable quote graphics (key insights, 10-15 words each)',
      linkedin: '1 LinkedIn article intro (professional, thought leadership)',
      youtube: '1 YouTube video description (SEO-optimized with timestamps)',
    };

    const selectedFormats = repurposeInto
      .filter(f => targetFormats[f])
      .map(f => `- ${targetFormats[f]}`)
      .join('\n');

    const prompt = `Repurpose the following long-form content into multiple formats:

ORIGINAL CONTENT:
${content}

Create the following formats:
${selectedFormats}

For each format:
1. Extract the most relevant points
2. Adapt the tone and structure for that platform
3. Make each piece standalone (doesn't require reading the original)
4. Include appropriate CTAs

Label each section clearly.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const repurposed = message.content[0].text;

    // Save to database
    const generated = await prisma.generatedContent.create({
      data: {
        userId: req.user.id,
        contentType: 'repurposed',
        prompt: content.substring(0, 500),
        context: {
          repurposeInto,
          originalLength: content.length,
        },
        content: repurposed,
        variations: [repurposed],
      },
    });

    res.json({
      id: generated.id,
      repurposed,
      formats: repurposeInto,
    });
  } catch (error) {
    console.error('Content repurposing error:', error);
    res.status(500).json({ error: 'Failed to repurpose content' });
  }
});

// ============================================
// AI WRITING ASSISTANT
// ============================================

router.post('/improve', async (req, res) => {
  try {
    const {
      content,
      action, // 'improve', 'shorten', 'expand', 'change_tone', 'fix_grammar', 'simplify', 'add_emotion', 'seo_optimize'
      targetTone,
      keywords = [],
    } = req.body;

    if (!content || !action) {
      return res.status(400).json({ error: 'Content and action are required' });
    }

    const actionPrompts = {
      improve: 'Improve this content. Make it clearer, more engaging, and better structured. Maintain the core message but enhance flow, clarity, and impact.',
      shorten: 'Condense this content to 50% of its current length while keeping all key points and main ideas. Remove fluff and redundancy.',
      expand: 'Expand this content with more detail, examples, and explanations. Add depth without losing focus. Target 2x the current length.',
      change_tone: `Change the tone of this content to ${targetTone}. Maintain the same information but adjust the language, style, and voice.`,
      fix_grammar: 'Fix all grammar, spelling, and punctuation errors. Improve sentence structure. Make no other changes to the content or meaning.',
      simplify: 'Simplify this content to an 8th-grade reading level. Use shorter sentences, simpler words, and clearer explanations. Maintain all key information.',
      add_emotion: 'Rewrite this content to be more engaging and emotional. Add storytelling elements, vivid language, and emotional connection while keeping the facts.',
      seo_optimize: `Optimize this content for SEO. Include these keywords naturally: ${keywords.join(', ')}. Improve headings, add relevant terms, and enhance readability for search engines.`,
    };

    const prompt = `${actionPrompts[action] || actionPrompts.improve}

ORIGINAL CONTENT:
${content}

Provide the improved version.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const improved = message.content[0].text;

    // Save to database
    const generated = await prisma.generatedContent.create({
      data: {
        userId: req.user.id,
        contentType: 'improved',
        prompt: content.substring(0, 500),
        context: {
          action,
          targetTone,
          keywords,
        },
        content: improved,
        variations: [improved],
        edited: true,
      },
    });

    res.json({
      id: generated.id,
      original: content,
      improved,
      action,
    });
  } catch (error) {
    console.error('Content improvement error:', error);
    res.status(500).json({ error: 'Failed to improve content' });
  }
});

// ============================================
// GENERATED CONTENT HISTORY
// ============================================

router.get('/generated', async (req, res) => {
  try {
    const { contentType, limit = 50 } = req.query;

    const where = { userId: req.user.id };
    if (contentType) {
      where.contentType = contentType;
    }

    const generated = await prisma.generatedContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    res.json(generated);
  } catch (error) {
    console.error('Failed to fetch generated content:', error);
    res.status(500).json({ error: 'Failed to fetch content history' });
  }
});

router.get('/generated/:id', async (req, res) => {
  try {
    const generated = await prisma.generatedContent.findUnique({
      where: { id: req.params.id },
    });

    if (!generated || generated.userId !== req.user.id) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(generated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

router.patch('/generated/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;

    const generated = await prisma.generatedContent.findUnique({
      where: { id: req.params.id },
    });

    if (!generated || generated.userId !== req.user.id) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const updated = await prisma.generatedContent.update({
      where: { id: req.params.id },
      data: { rating: parseInt(rating) },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to rate content' });
  }
});

router.delete('/generated/:id', async (req, res) => {
  try {
    const generated = await prisma.generatedContent.findUnique({
      where: { id: req.params.id },
    });

    if (!generated || generated.userId !== req.user.id) {
      return res.status(404).json({ error: 'Content not found' });
    }

    await prisma.generatedContent.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// ============================================
// CONTENT BRIEFS
// ============================================

router.post('/briefs', async (req, res) => {
  try {
    const {
      title,
      topic,
      targetAudience,
      keywords = [],
      tone,
      outline,
      competitorUrls = [],
    } = req.body;

    if (!title || !topic) {
      return res.status(400).json({ error: 'Title and topic are required' });
    }

    const brief = await prisma.contentBrief.create({
      data: {
        userId: req.user.id,
        title,
        topic,
        targetAudience,
        keywords,
        tone,
        outline,
        competitorUrls,
      },
    });

    res.json(brief);
  } catch (error) {
    console.error('Failed to create brief:', error);
    res.status(500).json({ error: 'Failed to create content brief' });
  }
});

router.get('/briefs', async (req, res) => {
  try {
    const { status } = req.query;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const briefs = await prisma.contentBrief.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(briefs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch briefs' });
  }
});

router.get('/briefs/:id', async (req, res) => {
  try {
    const brief = await prisma.contentBrief.findUnique({
      where: { id: req.params.id },
    });

    if (!brief || brief.userId !== req.user.id) {
      return res.status(404).json({ error: 'Brief not found' });
    }

    res.json(brief);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brief' });
  }
});

router.patch('/briefs/:id', async (req, res) => {
  try {
    const brief = await prisma.contentBrief.findUnique({
      where: { id: req.params.id },
    });

    if (!brief || brief.userId !== req.user.id) {
      return res.status(404).json({ error: 'Brief not found' });
    }

    const updated = await prisma.contentBrief.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update brief' });
  }
});

router.delete('/briefs/:id', async (req, res) => {
  try {
    const brief = await prisma.contentBrief.findUnique({
      where: { id: req.params.id },
    });

    if (!brief || brief.userId !== req.user.id) {
      return res.status(404).json({ error: 'Brief not found' });
    }

    await prisma.contentBrief.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Brief deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brief' });
  }
});

// ============================================
// STATS
// ============================================

router.get('/stats', async (req, res) => {
  try {
    const totalGenerated = await prisma.generatedContent.count({
      where: { userId: req.user.id },
    });

    const thisMonth = await prisma.generatedContent.count({
      where: {
        userId: req.user.id,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const byType = await prisma.generatedContent.groupBy({
      by: ['contentType'],
      where: { userId: req.user.id },
      _count: true,
    });

    const mostUsed = byType.sort((a, b) => b._count - a._count)[0];

    res.json({
      totalGenerated,
      thisMonth,
      byType,
      mostUsed: mostUsed?.contentType || 'none',
      timeSaved: totalGenerated * 30, // Estimate 30 min per piece
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
