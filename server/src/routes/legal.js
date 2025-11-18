import express from 'express';
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// LEGAL DOCUMENT GENERATION
// ============================================================================

// Generate legal document
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const {
      documentType,
      businessInfo,
      documentSpecifics,
    } = req.body;

    // Build prompt based on document type
    let prompt = '';

    if (documentType === 'terms') {
      prompt = `Generate comprehensive Terms and Conditions for a ${businessInfo.country || 'UK'}-based business.

Business Information:
- Business Name: ${businessInfo.businessName}
- Legal Entity: ${businessInfo.legalEntity || 'Limited Company'}
- Trading Name: ${businessInfo.tradingName || businessInfo.businessName}
- Registration Number: ${businessInfo.registrationNumber || 'N/A'}
- Address: ${businessInfo.address}
- Email: ${businessInfo.email}
- Website: ${businessInfo.website}

Service Details:
- Products/Services: ${documentSpecifics.offerings || 'digital products and services'}
- Delivery Method: ${documentSpecifics.deliveryMethod || 'digital download'}
- Payment Terms: ${documentSpecifics.paymentTerms || 'upfront payment'}
- Refund Policy: ${documentSpecifics.refundPolicy || 'no refunds'}

User Requirements:
- Age Restriction: ${documentSpecifics.ageRestriction || '18+'}
- Account Required: ${documentSpecifics.accountRequired ? 'Yes' : 'No'}
- User Content Allowed: ${documentSpecifics.userContentAllowed ? 'Yes' : 'No'}

Legal:
- Governing Law: ${documentSpecifics.governingLaw || 'England and Wales'}
- Dispute Resolution: ${documentSpecifics.disputeResolution || 'Courts'}

Generate a professionally formatted, legally sound Terms and Conditions document with the following sections:
1. Introduction
2. Acceptance of Terms
3. Changes to Terms
4. User Accounts (if applicable)
5. Products and Services
6. Payment Terms
7. Refunds and Cancellations
8. Intellectual Property Rights
9. User Conduct and Prohibited Activities
10. Limitation of Liability
11. Indemnification
12. Termination
13. Governing Law and Jurisdiction
14. Dispute Resolution
15. Contact Information

Use clear, professional legal language. Include all necessary disclaimers and protections for the business.`;

    } else if (documentType === 'privacy') {
      prompt = `Generate a comprehensive Privacy Policy for a ${businessInfo.country || 'UK'}-based business, compliant with UK GDPR.

Business Information:
- Business Name: ${businessInfo.businessName}
- Address: ${businessInfo.address}
- Email: ${businessInfo.email}
- Website: ${businessInfo.website}

Data Collection:
- Data Collected: ${documentSpecifics.dataCollected?.join(', ') || 'Name, Email, IP Address'}
- Purpose: ${documentSpecifics.dataPurpose || 'Processing orders, marketing, analytics'}
- Third Party Sharing: ${documentSpecifics.thirdPartySharing ? 'Yes' : 'No'}
- Third Party Services: ${documentSpecifics.thirdPartyServices?.join(', ') || 'Stripe, Google Analytics'}

Cookies:
- Uses Cookies: ${documentSpecifics.usesCookies ? 'Yes' : 'No'}
- Cookie Types: ${documentSpecifics.cookieTypes?.join(', ') || 'Essential, Analytics, Marketing'}

Data Storage:
- Storage Location: ${documentSpecifics.storageLocation || 'UK/EU'}
- Retention Period: ${documentSpecifics.retentionPeriod || '7 years'}

Generate a professionally formatted, GDPR-compliant Privacy Policy with these sections:
1. Introduction
2. Who We Are
3. What Data We Collect
4. How We Collect Data
5. Why We Collect Data
6. How We Use Data
7. Legal Basis for Processing (GDPR)
8. Data Sharing and Third Parties
9. International Data Transfers
10. Data Security
11. Data Retention
12. Your Rights (Access, Deletion, Portability, Object, Restrict Processing)
13. Cookies Policy
14. Children's Privacy
15. Changes to This Policy
16. Contact Information

Ensure full UK GDPR compliance.`;

    } else if (documentType === 'contract') {
      prompt = `Generate a ${documentSpecifics.contractType || 'Service Agreement'} contract.

Your Business:
- Business Name: ${businessInfo.businessName}
- Address: ${businessInfo.address}
- Email: ${businessInfo.email}

Client:
- Client Name: ${documentSpecifics.clientName || '[Client Name]'}
- Client Address: ${documentSpecifics.clientAddress || '[Client Address]'}

Services:
- Description: ${documentSpecifics.servicesDescription || 'Professional services as agreed'}
- Deliverables: ${documentSpecifics.deliverables || 'As specified in project scope'}
- Timeline: ${documentSpecifics.timeline || '30 days from agreement'}

Payment:
- Total Fee: £${documentSpecifics.totalFee || '0'}
- Payment Schedule: ${documentSpecifics.paymentSchedule || 'Upon completion'}
- Late Payment Terms: ${documentSpecifics.latePaymentTerms || '5% monthly interest'}

Terms:
- IP Ownership: ${documentSpecifics.ipOwnership || 'Client owns upon full payment'}
- Notice Period: ${documentSpecifics.noticePeriod || '30 days'}
- Confidentiality: ${documentSpecifics.includeNDA ? 'Yes - Include NDA clause' : 'Standard confidentiality'}
- Liability Limit: £${documentSpecifics.liabilityLimit || documentSpecifics.totalFee || '0'}

Generate a professionally formatted ${documentSpecifics.contractType || 'Service Agreement'} with:
1. Parties
2. Services and Deliverables
3. Payment Terms
4. Timeline and Milestones
5. Intellectual Property Rights
6. Confidentiality
7. Warranties and Representations
8. Limitation of Liability
9. Indemnification
10. Termination
11. Dispute Resolution
12. General Provisions
13. Signatures

Include signature blocks for both parties.`;

    } else if (documentType === 'nda') {
      prompt = `Generate a ${documentSpecifics.ndaType === 'mutual' ? 'Mutual' : 'One-Way'} Non-Disclosure Agreement (NDA).

Your Business:
- Business Name: ${businessInfo.businessName}
- Address: ${businessInfo.address}

Other Party:
- Name: ${documentSpecifics.otherPartyName || '[Other Party Name]'}
- Address: ${documentSpecifics.otherPartyAddress || '[Other Party Address]'}

Confidential Information:
- Description: ${documentSpecifics.confidentialInfo || 'Business plans, financial information, client lists, trade secrets, proprietary information'}

Terms:
- Duration: ${documentSpecifics.duration || '2 years'}
- Type: ${documentSpecifics.ndaType === 'mutual' ? 'Mutual (both parties protect each other\'s information)' : 'One-way (they protect your information)'}

Generate a professionally formatted ${documentSpecifics.ndaType === 'mutual' ? 'Mutual' : 'One-Way'} NDA with:
1. Parties
2. Definition of Confidential Information
3. Exclusions from Confidential Information
4. Obligations of Receiving Party
5. Term and Duration
6. Return or Destruction of Information
7. No License
8. Remedies
9. Miscellaneous Provisions
10. Signatures

Use clear legal language appropriate for UK law.`;

    } else if (documentType === 'disclaimer') {
      prompt = `Generate a comprehensive Disclaimer for a ${businessInfo.country || 'UK'}-based business.

Business Information:
- Business Name: ${businessInfo.businessName}
- Website: ${businessInfo.website}
- Industry: ${documentSpecifics.industry || 'General'}

Disclaimer Coverage:
- Professional Advice: ${documentSpecifics.professionalAdvice ? 'Provided' : 'Not provided'}
- Accuracy: Information may not be 100% accurate
- Results: No guarantee of specific results
- External Links: Not responsible for third-party content
- Liability Limit: ${documentSpecifics.liabilityLimit || 'Maximum extent permitted by law'}

Generate a professionally formatted Disclaimer with:
1. General Disclaimer
2. No Professional Advice (if applicable)
3. No Warranties
4. Accuracy of Information
5. No Guarantee of Results
6. External Links Disclaimer
7. Limitation of Liability
8. Indemnification
9. Changes to Disclaimer

Use protective legal language while being clear and understandable.`;

    } else {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    // Generate document with AI
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = message.content[0].text;

    // Extract title (first line or heading)
    const titleMatch = content.match(/^#{1,3}\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() :
                 documentType === 'terms' ? 'Terms and Conditions' :
                 documentType === 'privacy' ? 'Privacy Policy' :
                 documentType === 'contract' ? `${documentSpecifics.contractType || 'Service Agreement'}` :
                 documentType === 'nda' ? 'Non-Disclosure Agreement' :
                 'Legal Disclaimer';

    // Save to database
    const document = await prisma.legalDocument.create({
      data: {
        userId: req.user.id,
        documentType,
        title,
        content,
        businessInfo,
        version: 1,
        isActive: false,
      },
    });

    res.json(document);
  } catch (error) {
    console.error('Generate legal document error:', error);
    res.status(500).json({ error: 'Failed to generate document' });
  }
});

// Get all documents for user
router.get('/documents', authMiddleware, async (req, res) => {
  try {
    const { documentType } = req.query;

    const where = {
      userId: req.user.id,
      ...(documentType && { documentType }),
    };

    const documents = await prisma.legalDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        documentType: true,
        title: true,
        version: true,
        isActive: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get single document
router.get('/documents/:id', authMiddleware, async (req, res) => {
  try {
    const document = await prisma.legalDocument.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Update document
router.patch('/documents/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, isActive } = req.body;

    const existing = await prisma.legalDocument.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const document = await prisma.legalDocument.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(content && { content, version: existing.version + 1 }),
        ...(typeof isActive === 'boolean' && {
          isActive,
          ...(isActive && !existing.publishedAt && { publishedAt: new Date() }),
        }),
      },
    });

    res.json(document);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
router.delete('/documents/:id', authMiddleware, async (req, res) => {
  try {
    const document = await prisma.legalDocument.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.legalDocument.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// GDPR Compliance Checker
router.post('/gdpr-check', authMiddleware, async (req, res) => {
  try {
    const { websiteUrl } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({ error: 'Website URL is required' });
    }

    // In a real implementation, this would:
    // 1. Crawl the website
    // 2. Check for privacy policy
    // 3. Check for cookie consent
    // 4. Check for contact forms with consent checkboxes
    // 5. Check for HTTPS
    // 6. Check for data processing records

    // For now, return a mock response with recommendations
    const checks = [
      {
        id: 'privacy-policy',
        name: 'Privacy Policy',
        description: 'Privacy policy exists and is linked in footer',
        status: 'pass', // pass, fail, warning
        priority: 'critical',
        recommendation: null,
      },
      {
        id: 'cookie-consent',
        name: 'Cookie Consent Banner',
        description: 'Cookie consent banner is present on page load',
        status: 'pass',
        priority: 'critical',
        recommendation: null,
      },
      {
        id: 'https',
        name: 'HTTPS Security',
        description: 'Website uses HTTPS protocol',
        status: 'pass',
        priority: 'critical',
        recommendation: null,
      },
      {
        id: 'contact-consent',
        name: 'Form Consent Checkboxes',
        description: 'Contact forms include consent checkboxes',
        status: 'warning',
        priority: 'important',
        recommendation: 'Add explicit consent checkboxes to all data collection forms',
      },
      {
        id: 'unsubscribe',
        name: 'Email Unsubscribe',
        description: 'Marketing emails include unsubscribe links',
        status: 'pass',
        priority: 'important',
        recommendation: null,
      },
      {
        id: 'data-breach',
        name: 'Data Breach Procedures',
        description: 'Documented procedures for handling data breaches',
        status: 'fail',
        priority: 'important',
        recommendation: 'Create and document data breach response procedures',
      },
      {
        id: 'processing-records',
        name: 'Processing Records',
        description: 'Maintain records of processing activities',
        status: 'warning',
        priority: 'important',
        recommendation: 'Document all data processing activities and purposes',
      },
    ];

    const summary = {
      passedChecks: checks.filter(c => c.status === 'pass').length,
      failedChecks: checks.filter(c => c.status === 'fail').length,
      warningChecks: checks.filter(c => c.status === 'warning').length,
      totalChecks: checks.length,
      complianceScore: Math.round((checks.filter(c => c.status === 'pass').length / checks.length) * 100),
    };

    res.json({
      websiteUrl,
      checkedAt: new Date(),
      summary,
      checks,
    });
  } catch (error) {
    console.error('GDPR check error:', error);
    res.status(500).json({ error: 'Failed to perform GDPR check' });
  }
});

export default router;
