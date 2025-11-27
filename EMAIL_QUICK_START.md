# Email Marketing Quick Start Guide

## Getting Started in 5 Minutes

### 1. Database Setup
```bash
cd supernova
npx prisma db push
```

### 2. Access Email Marketing
Navigate to: http://localhost:3001/email/subscribers

### 3. Create Your First Subscriber
1. Click "Add Subscriber"
2. Enter email, name
3. Save

### 4. Create Your First List
1. Go to "Lists" tab
2. Click "Create List"
3. Name it (e.g., "Newsletter")
4. Add description
5. Save

### 5. Import Subscribers (CSV)
1. Go to "Subscribers" > "Import"
2. Upload CSV file (format: email, firstName, lastName)
3. Map fields
4. Import

### 6. Create Your First Campaign
1. Go to "Campaigns" tab
2. Click "Create Campaign"
3. Fill in:
   - Name: Internal reference
   - Subject: Email subject line
   - From Name: Your name or brand
   - From Email: Your email address
   - Content: Email body (HTML or plain text)
4. Select lists to send to
5. Click "Save as Draft"

### 7. View Analytics
1. Go to "Analytics" tab
2. See subscriber growth, campaign performance, engagement metrics

## Common Tasks

### Import Contacts from Quiz
Automatic! When someone completes a quiz, they're automatically:
- Added to email subscribers
- Added to "Quiz Leads" list
- Tagged with their quiz result

### Create an Email Sequence
1. Go to "Sequences" tab
2. Click "Create Sequence"
3. Set trigger (Manual, List Subscribe, Tag Added)
4. Add email steps with delays
5. Activate sequence

### Send a Campaign
1. Go to "Campaigns"
2. Select campaign
3. Click "Send Now"

**Note**: Until you integrate an email service (Resend, SendGrid, etc.), campaigns will be queued but not actually sent. See main README for email service integration.

## Quick Tips

### Subscriber Sources
- **QUIZ**: From quiz completions (automatic)
- **MANUAL**: Added via UI
- **IMPORT**: CSV import
- **SIGNUP_FORM**: From website forms
- **CRM**: Synced from CRM contacts

### Campaign Status
- **DRAFT**: Being edited, not sent
- **SCHEDULED**: Set to send at specific time
- **SENDING**: Currently being sent
- **SENT**: Completed
- **PAUSED**: Stopped mid-send

### Subscriber Status
- **SUBSCRIBED**: Active, will receive emails
- **UNSUBSCRIBED**: Opted out, won't receive emails
- **BOUNCED**: Email bounced, temporarily blocked
- **COMPLAINED**: Marked as spam, permanently blocked

### Best Practices

#### Subject Lines
- Keep under 50 characters
- Avoid ALL CAPS
- Use personalization: "Hey {{firstName}}"
- Create urgency or curiosity
- Test different approaches

#### Email Content
- Mobile-first design
- Clear call-to-action
- Unsubscribe link in footer
- Balance images and text
- Keep under 100KB total size

#### Sending Times
- Tuesday-Thursday: Best days
- 10am or 2pm: Best times
- Avoid Monday mornings
- Avoid Friday afternoons
- Test your audience's preferences

#### List Hygiene
- Remove inactive subscribers (6+ months no open)
- Monitor bounce rates
- Re-engagement campaigns for dormant subscribers
- Regular list cleaning

## API Quick Reference

### Create Subscriber
```bash
curl -X POST http://localhost:3001/api/email/subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "listIds": ["list-id-here"],
    "tags": ["customer", "premium"]
  }'
```

### Get Subscriber
```bash
curl http://localhost:3001/api/email/subscribers/SUBSCRIBER_ID
```

### Create Campaign
```bash
curl -X POST http://localhost:3001/api/email/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Campaign",
    "subject": "Welcome to dAItaniverse!",
    "htmlContent": "<h1>Welcome!</h1><p>Thanks for joining.</p>",
    "fromName": "Debs Daitani",
    "fromEmail": "hello@daitaniverse.com",
    "listIds": ["list-id-here"]
  }'
```

### Send Campaign
```bash
curl -X POST http://localhost:3001/api/email/campaigns/CAMPAIGN_ID/send
```

### Get Analytics
```bash
curl http://localhost:3001/api/email/analytics
```

## Troubleshooting

### Subscribers not showing up
- Check database connection
- Verify Prisma schema is synced: `npx prisma db push`
- Check browser console for errors

### Import failing
- Check CSV format (must have headers)
- Verify email field is mapped
- Check for special characters in CSV

### Campaign not sending
- Verify email service is configured (see main README)
- Check campaign status is not DRAFT
- Verify list has active subscribers

### Analytics not loading
- Check API route: `/api/email/analytics`
- Verify database has data
- Check browser console

### Sequence not triggering
- Verify sequence status is ACTIVE
- Check trigger type and value match
- Ensure subscriber has required tags/is in correct list

## Next Steps

1. **Integrate Email Service**: Follow main README to connect Resend, SendGrid, or SES
2. **Create Templates**: Build reusable email templates
3. **Set Up Sequences**: Create welcome series, nurture campaigns
4. **Monitor Analytics**: Track performance and optimize
5. **Scale Up**: Add automation, A/B testing, advanced segmentation

## Getting Help

- **Main Documentation**: EMAIL_MARKETING_README.md
- **API Reference**: Check /api/email/* routes in codebase
- **Database Schema**: prisma/schema.prisma
- **Frontend Code**: supernova/app/email/*

## Email Marketing Checklist

- [ ] Database synced (prisma db push)
- [ ] First subscriber added
- [ ] "Quiz Leads" list created (automatic on first quiz)
- [ ] First campaign created
- [ ] Email service integrated (for production)
- [ ] Unsubscribe page tested
- [ ] Analytics reviewed
- [ ] Email sequence created
- [ ] Template library started

## Production Readiness

### Before Launch
- [ ] Email service API keys added to .env
- [ ] Unsubscribe link in all templates
- [ ] Privacy policy updated
- [ ] GDPR compliance reviewed
- [ ] Rate limiting configured
- [ ] Backup strategy implemented
- [ ] Monitoring alerts set up
- [ ] Test emails sent and verified
- [ ] Bounce handling tested
- [ ] Spam score checked (mail-tester.com)

### Launch Day
1. Test send to small list
2. Monitor delivery rates
3. Check spam folder placement
4. Verify tracking pixels working
5. Test all links
6. Monitor unsubscribe rate
7. Check analytics accuracy

## Support

Need help? Check the main README or review the implementation files in:
- API: `supernova/app/api/email/`
- Frontend: `supernova/app/email/`
- Schema: `prisma/schema.prisma`
