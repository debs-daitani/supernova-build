import sgMail from '@sendgrid/mail';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const renderTemplate = async (templateName, variables) => {
  const templatePath = path.join(__dirname, '..', 'emails', 'templates', `${templateName}.html`);
  let html = await fs.readFile(templatePath, 'utf-8');

  // Replace variables in template
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, variables[key]);
  });

  return html;
};

export const sendEmail = async ({ to, subject, templateName, variables }) => {
  try {
    const html = await renderTemplate(templateName, variables);

    const msg = {
      to,
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME,
      },
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
};

// Specific email functions

export const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to The dAItaniverse! 🌟',
    templateName: 'welcome',
    variables: {
      name: user.name,
      dashboardUrl: `${process.env.CLIENT_URL}/dashboard`,
    },
  });
};

export const sendUpgradeConfirmation = async (user, downloadLinks) => {
  return sendEmail({
    to: user.email,
    subject: 'You\'re Upgraded! Your Resources Are Ready 🎉',
    templateName: 'upgrade-confirmation',
    variables: {
      name: user.name,
      promptsUrl: downloadLinks.prompts,
      guideUrl: downloadLinks.guide,
      bonusUrl: downloadLinks.bonus,
      chatUrl: `${process.env.CLIENT_URL}/chat`,
    },
  });
};

export const sendSubscriptionConfirmation = async (user, subscription) => {
  const nextBillingDate = new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB');
  const plan = subscription.plan === 'MONTHLY' ? 'Monthly' : 'Annual';

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Full Membership! 🚀',
    templateName: 'subscription-confirmation',
    variables: {
      name: user.name,
      plan,
      nextBillingDate,
      contentUrl: `${process.env.CLIENT_URL}/content`,
      communityUrl: `${process.env.CLIENT_URL}/community`,
    },
  });
};

export const sendPaymentReceipt = async (user, payment) => {
  const amount = (payment.amount / 100).toFixed(2);
  const date = new Date(payment.createdAt).toLocaleDateString('en-GB');

  return sendEmail({
    to: user.email,
    subject: 'Payment Receipt - The dAItaniverse',
    templateName: 'payment-receipt',
    variables: {
      name: user.name,
      amount,
      date,
      invoiceNumber: payment.id,
      description: payment.description,
    },
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  return sendEmail({
    to: user.email,
    subject: 'Reset Your Password - The dAItaniverse',
    templateName: 'password-reset',
    variables: {
      name: user.name,
      resetUrl,
    },
  });
};

export const sendMarketplaceSaleBuyer = async (buyer, listing, seller) => {
  return sendEmail({
    to: buyer.email,
    subject: 'Congrats on Your Purchase! 🎉',
    templateName: 'marketplace-sale-buyer',
    variables: {
      name: buyer.name,
      listingTitle: listing.title,
      sellerName: seller.name,
      sellerEmail: seller.email,
      listingUrl: `${process.env.CLIENT_URL}/marketplace/${listing.id}`,
    },
  });
};

export const sendMarketplaceSaleSeller = async (seller, listing, buyer, sellerAmount) => {
  const amount = (sellerAmount / 100).toFixed(2);

  return sendEmail({
    to: seller.email,
    subject: 'Your Idea Sold! 💰',
    templateName: 'marketplace-sale-seller',
    variables: {
      name: seller.name,
      listingTitle: listing.title,
      amount,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
    },
  });
};

export const sendMarketplaceMessage = async (recipient, sender, listing, messagePreview) => {
  return sendEmail({
    to: recipient.email,
    subject: 'New Message About Your Listing',
    templateName: 'marketplace-message',
    variables: {
      name: recipient.name,
      senderName: sender.name,
      listingTitle: listing.title,
      messagePreview,
      listingUrl: `${process.env.CLIENT_URL}/marketplace/${listing.id}`,
    },
  });
};

export const sendCommunityMention = async (user, mentioner, post) => {
  return sendEmail({
    to: user.email,
    subject: `${mentioner.name} mentioned you in a post`,
    templateName: 'community-mention',
    variables: {
      name: user.name,
      mentionerName: mentioner.name,
      postTitle: post.title,
      postPreview: post.content.substring(0, 150) + '...',
      postUrl: `${process.env.CLIENT_URL}/community/posts/${post.id}`,
    },
  });
};

export const sendNewDM = async (recipient, sender, messagePreview) => {
  return sendEmail({
    to: recipient.email,
    subject: `New message from ${sender.name}`,
    templateName: 'new-dm',
    variables: {
      name: recipient.name,
      senderName: sender.name,
      messagePreview,
      messagesUrl: `${process.env.CLIENT_URL}/messages`,
    },
  });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendUpgradeConfirmation,
  sendSubscriptionConfirmation,
  sendPaymentReceipt,
  sendPasswordResetEmail,
  sendMarketplaceSaleBuyer,
  sendMarketplaceSaleSeller,
  sendMarketplaceMessage,
  sendCommunityMention,
  sendNewDM,
};
