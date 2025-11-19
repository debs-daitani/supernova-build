/**
 * Support Ticket Email Templates
 * Email notifications for support system
 */

/**
 * New Ticket Confirmation (to customer)
 */
function getTicketCreatedEmail(ticket) {
  return {
    subject: `Ticket Created: ${ticket.ticketNumber} - ${ticket.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .ticket-box { background: white; border: 2px solid #f97316; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Support Ticket Created ✅</h1>
            <p style="margin: 10px 0 0 0;">We've received your request</p>
          </div>

          <div class="content">
            <h2>Hi ${ticket.user?.name || 'there'},</h2>

            <p>Thank you for contacting support. We've created your ticket and our team will respond shortly.</p>

            <div class="ticket-box">
              <p style="margin: 0 0 10px 0;"><strong>Ticket Number:</strong></p>
              <div style="font-size: 24px; font-weight: bold; color: #f97316; font-family: monospace;">
                ${ticket.ticketNumber}
              </div>
            </div>

            <h3>Ticket Details:</h3>
            <ul>
              <li><strong>Subject:</strong> ${ticket.subject}</li>
              <li><strong>Category:</strong> ${ticket.category}</li>
              <li><strong>Priority:</strong> ${ticket.priority}</li>
              <li><strong>Status:</strong> ${ticket.status}</li>
            </ul>

            <h3>What Happens Next?</h3>
            <p>Based on your ticket priority, you can expect:</p>
            <ul>
              <li><strong>Urgent:</strong> Response within 1 hour</li>
              <li><strong>High:</strong> Response within 4 hours</li>
              <li><strong>Medium:</strong> Response within 24 hours</li>
              <li><strong>Low:</strong> Response within 48 hours</li>
            </ul>

            <p style="text-align: center;">
              <a href="https://thedaitaniverse.com/support/tickets/${ticket.id}" class="button">
                View Ticket
              </a>
            </p>

            <p>You'll receive email notifications when we respond to your ticket.</p>

            <p>Best,<br>The dAItaniverse Support Team</p>
          </div>

          <div class="footer">
            <p>The dAItaniverse | AI-Powered Business Platform</p>
            <p>Ticket #${ticket.ticketNumber}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Support Ticket Created

Hi ${ticket.user?.name || 'there'},

Thank you for contacting support. We've created your ticket and our team will respond shortly.

Ticket Number: ${ticket.ticketNumber}

Ticket Details:
- Subject: ${ticket.subject}
- Category: ${ticket.category}
- Priority: ${ticket.priority}
- Status: ${ticket.status}

What Happens Next?
Based on your ticket priority, you can expect:
- Urgent: Response within 1 hour
- High: Response within 4 hours
- Medium: Response within 24 hours
- Low: Response within 48 hours

View ticket: https://thedaitaniverse.com/support/tickets/${ticket.id}

You'll receive email notifications when we respond to your ticket.

Best,
The dAItaniverse Support Team

Ticket #${ticket.ticketNumber}
    `.trim()
  };
}

/**
 * Staff Reply Notification (to customer)
 */
function getStaffReplyEmail(ticket, message) {
  return {
    subject: `Re: ${ticket.ticketNumber} - ${ticket.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .message-box { background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">New Response from Support 📬</h1>
            <p style="margin: 10px 0 0 0;">Ticket #${ticket.ticketNumber}</p>
          </div>

          <div class="content">
            <h2>Hi ${ticket.user?.name || 'there'},</h2>

            <p>We've responded to your support ticket:</p>

            <div class="message-box">
              <p style="margin: 0 0 10px 0;"><strong>${message.user?.name || 'Support Team'}</strong> replied:</p>
              <p style="white-space: pre-wrap;">${message.message}</p>
            </div>

            <p style="text-align: center;">
              <a href="https://thedaitaniverse.com/support/tickets/${ticket.id}" class="button">
                View & Reply
              </a>
            </p>

            <p>If your issue is resolved, you can mark the ticket as resolved from the ticket page.</p>

            <p>Best,<br>The dAItaniverse Support Team</p>
          </div>

          <div class="footer">
            <p>The dAItaniverse | AI-Powered Business Platform</p>
            <p>Ticket #${ticket.ticketNumber}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Response from Support

Hi ${ticket.user?.name || 'there'},

We've responded to your support ticket #${ticket.ticketNumber}:

${message.user?.name || 'Support Team'} replied:
${message.message}

View & Reply: https://thedaitaniverse.com/support/tickets/${ticket.id}

If your issue is resolved, you can mark the ticket as resolved from the ticket page.

Best,
The dAItaniverse Support Team

Ticket #${ticket.ticketNumber}
    `.trim()
  };
}

/**
 * Ticket Resolved Notification
 */
function getTicketResolvedEmail(ticket) {
  return {
    subject: `Resolved: ${ticket.ticketNumber} - ${ticket.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .rating-box { background: white; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .star { font-size: 32px; cursor: pointer; margin: 0 5px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Ticket Resolved ✅</h1>
            <p style="margin: 10px 0 0 0;">Your issue has been resolved</p>
          </div>

          <div class="content">
            <h2>Hi ${ticket.user?.name || 'there'},</h2>

            <p>Great news! Your support ticket has been marked as resolved.</p>

            <p><strong>Ticket #${ticket.ticketNumber}</strong><br>
            Subject: ${ticket.subject}</p>

            <div class="rating-box">
              <h3>How was your experience?</h3>
              <p>Please rate our support:</p>
              <a href="https://thedaitaniverse.com/support/tickets/${ticket.id}/rate?rating=5" class="star">⭐</a>
              <a href="https://thedaitaniverse.com/support/tickets/${ticket.id}/rate?rating=4" class="star">⭐</a>
              <a href="https://thedaitaniverse.com/support/tickets/${ticket.id}/rate?rating=3" class="star">⭐</a>
              <a href="https://thedaitaniverse.com/support/tickets/${ticket.id}/rate?rating=2" class="star">⭐</a>
              <a href="https://thedaitaniverse.com/support/tickets/${ticket.id}/rate?rating=1" class="star">⭐</a>
            </div>

            <p>If you need further assistance, you can reopen this ticket or create a new one.</p>

            <p style="text-align: center;">
              <a href="https://thedaitaniverse.com/support/tickets/${ticket.id}" class="button">
                View Ticket
              </a>
            </p>

            <p>Thank you for using The dAItaniverse!</p>

            <p>Best,<br>The dAItaniverse Support Team</p>
          </div>

          <div class="footer">
            <p>The dAItaniverse | AI-Powered Business Platform</p>
            <p>Ticket #${ticket.ticketNumber}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Ticket Resolved

Hi ${ticket.user?.name || 'there'},

Great news! Your support ticket has been marked as resolved.

Ticket #${ticket.ticketNumber}
Subject: ${ticket.subject}

How was your experience?
Please rate our support: https://thedaitaniverse.com/support/tickets/${ticket.id}/rate

If you need further assistance, you can reopen this ticket or create a new one.

Thank you for using The dAItaniverse!

Best,
The dAItaniverse Support Team

Ticket #${ticket.ticketNumber}
    `.trim()
  };
}

/**
 * Ticket Assigned Notification (to staff)
 */
function getTicketAssignedEmail(ticket, assignedTo) {
  return {
    subject: `Ticket Assigned: ${ticket.ticketNumber} - ${ticket.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .ticket-info { background: white; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
          .priority-urgent { color: #dc2626; font-weight: bold; }
          .priority-high { color: #f97316; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Ticket Assigned to You 🎯</h1>
            <p style="margin: 10px 0 0 0;">New ticket requires your attention</p>
          </div>

          <div class="content">
            <h2>Hi ${assignedTo.name},</h2>

            <p>A support ticket has been assigned to you:</p>

            <div class="ticket-info">
              <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
              <p><strong>Subject:</strong> ${ticket.subject}</p>
              <p><strong>Priority:</strong> <span class="priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span></p>
              <p><strong>Category:</strong> ${ticket.category}</p>
              <p><strong>Customer:</strong> ${ticket.user.name} (${ticket.user.email})</p>
              <p><strong>Created:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
            </div>

            <p><strong>Description:</strong></p>
            <p style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 8px;">${ticket.description}</p>

            <p style="text-align: center;">
              <a href="https://thedaitaniverse.com/admin/support/tickets/${ticket.id}" class="button">
                View & Respond
              </a>
            </p>

            <p>Best,<br>The dAItaniverse Support Team</p>
          </div>

          <div class="footer">
            <p>The dAItaniverse | Support Dashboard</p>
            <p>Ticket #${ticket.ticketNumber}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Ticket Assigned to You

Hi ${assignedTo.name},

A support ticket has been assigned to you:

Ticket: ${ticket.ticketNumber}
Subject: ${ticket.subject}
Priority: ${ticket.priority}
Category: ${ticket.category}
Customer: ${ticket.user.name} (${ticket.user.email})
Created: ${new Date(ticket.createdAt).toLocaleString()}

Description:
${ticket.description}

View & Respond: https://thedaitaniverse.com/admin/support/tickets/${ticket.id}

Best,
The dAItaniverse Support Team

Ticket #${ticket.ticketNumber}
    `.trim()
  };
}

module.exports = {
  getTicketCreatedEmail,
  getStaffReplyEmail,
  getTicketResolvedEmail,
  getTicketAssignedEmail
};
