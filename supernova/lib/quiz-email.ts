/**
 * Quiz Email Service
 * Sends quiz results to users via email
 *
 * NOTE: This uses a simple placeholder for now.
 * In production, integrate with SendGrid, Postmark, or similar.
 */

import { ScoringResult } from './quiz-scoring'

interface QuizResultEmail {
  to: string
  name: string | null
  quizTitle: string
  result: ScoringResult
  quizUrl?: string
}

/**
 * Send quiz results via email
 */
export async function sendQuizResults(data: QuizResultEmail): Promise<boolean> {
  const { to, name, quizTitle, result, quizUrl } = data

  // Build email HTML
  const emailHtml = buildResultsEmail(name, quizTitle, result, quizUrl)

  // TODO: Integrate with email provider
  // For now, log to console
  console.log('📧 QUIZ RESULTS EMAIL')
  console.log('To:', to)
  console.log('Subject:', `Your ${quizTitle} Results`)
  console.log('HTML:', emailHtml)

  // In production, use this:
  /*
  const apiKey = process.env.SENDGRID_API_KEY || process.env.POSTMARK_API_KEY

  if (!apiKey) {
    console.error('No email API key configured')
    return false
  }

  // SendGrid example:
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(apiKey)

  const msg = {
    to,
    from: 'supernova@daitaniverse.com',
    subject: `Your ${quizTitle} Results`,
    html: emailHtml,
  }

  try {
    await sgMail.send(msg)
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
  */

  // Simulate success for now
  return true
}

/**
 * Build HTML email for quiz results
 */
function buildResultsEmail(
  name: string | null,
  quizTitle: string,
  result: ScoringResult,
  quizUrl?: string
): string {
  const greeting = name ? `Hey ${name}` : 'Hey there'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Josefin Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: #0a0a0a;
      color: #ffffff;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-family: 'Supernova', cursive;
      font-size: 32px;
      background: linear-gradient(90deg, #FF008E, #00F0E9, #D4FF00);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .result-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 240, 233, 0.2);
      border-radius: 16px;
      padding: 32px;
      margin: 24px 0;
      backdrop-filter: blur(10px);
    }
    .result-title {
      font-family: 'Supernova', cursive;
      font-size: 28px;
      color: #FF008E;
      margin-bottom: 16px;
    }
    .result-description {
      font-size: 16px;
      line-height: 1.6;
      color: #e5e5e5;
      margin-bottom: 24px;
    }
    .score {
      font-size: 48px;
      font-weight: bold;
      color: #00F0E9;
      text-align: center;
      margin: 24px 0;
    }
    .programs {
      margin-top: 32px;
    }
    .program-item {
      background: rgba(255, 255, 255, 0.03);
      border-left: 3px solid #00F0E9;
      padding: 16px;
      margin: 12px 0;
      border-radius: 8px;
    }
    .program-title {
      font-weight: bold;
      color: #00F0E9;
      margin-bottom: 8px;
    }
    .program-pillar {
      display: inline-block;
      background: rgba(255, 0, 142, 0.2);
      color: #FF008E;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      margin-bottom: 8px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #FF008E, #00F0E9);
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 12px;
      font-weight: bold;
      margin: 24px auto;
      text-align: center;
    }
    .footer {
      text-align: center;
      margin-top: 48px;
      color: #888;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">dAItaniverse</div>
      <h1 style="color: #00F0E9; font-size: 24px; margin-top: 16px;">Your ${quizTitle} Results</h1>
    </div>

    <p style="font-size: 18px; line-height: 1.6;">
      ${greeting}! 👋
    </p>

    <p style="line-height: 1.6;">
      Thanks for taking the quiz. Here's what we discovered about you:
    </p>

    ${result.resultTier ? `
    <div class="result-card">
      ${result.resultTier.imageUrl ? `<img src="${result.resultTier.imageUrl}" alt="${result.resultTier.name}" style="width: 100%; border-radius: 8px; margin-bottom: 16px;" />` : ''}

      <div class="result-title">${result.resultTier.name}</div>
      <div class="result-description">${result.resultTier.description}</div>

      <div class="score">Score: ${result.totalScore}</div>

      ${result.resultTier.ctaText && result.resultTier.ctaUrl ? `
        <div style="text-align: center;">
          <a href="${result.resultTier.ctaUrl}" class="cta-button">${result.resultTier.ctaText}</a>
        </div>
      ` : ''}
    </div>
    ` : `
    <div class="result-card">
      <div class="score">Your Score: ${result.totalScore}</div>
    </div>
    `}

    ${result.recommendedPrograms.length > 0 ? `
    <div class="programs">
      <h2 style="color: #00F0E9; font-size: 20px;">Recommended Programs for You</h2>
      ${result.recommendedPrograms.map((program) => `
        <div class="program-item">
          <div class="program-pillar">${program.pillar}</div>
          <div class="program-title">${program.title}</div>
          <div style="color: #ccc; font-size: 14px;">${program.description}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div style="background: rgba(0, 240, 233, 0.1); border-left: 4px solid #00F0E9; padding: 20px; margin: 32px 0; border-radius: 8px;">
      <p style="margin: 0; line-height: 1.6;">
        <strong>Want personalized coaching?</strong><br>
        Join <strong style="color: #FF008E;">dAItaniverse</strong> for £26/month and get access to SUPERNova AI,
        your bold, anti-BS coach who remembers everything about you.
      </p>
      <div style="text-align: center; margin-top: 16px;">
        <a href="https://daitaniverse.com/join" class="cta-button">Join dAItaniverse</a>
      </div>
    </div>

    ${quizUrl ? `
    <p style="text-align: center; margin-top: 32px;">
      <a href="${quizUrl}" style="color: #00F0E9; text-decoration: underline;">Retake the quiz</a>
    </p>
    ` : ''}

    <div class="footer">
      <p>© ${new Date().getFullYear()} dAItaniverse. All rights reserved.</p>
      <p style="margin-top: 8px;">
        Life-First Entrepreneurship | No BS | Rock & Roll Energy
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Send welcome email to new quiz takers who join dAItaniverse
 */
export async function sendWelcomeEmail(email: string, name: string | null): Promise<boolean> {
  const greeting = name ? `Hey ${name}` : 'Hey there'

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Josefin Sans', Arial, sans-serif; background: #0a0a0a; color: #fff; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 32px; background: linear-gradient(90deg, #FF008E, #00F0E9, #D4FF00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">dAItaniverse</div>
    <h1 style="color: #00F0E9;">Welcome to the dAItaniverse! 🚀</h1>
    <p>${greeting}!</p>
    <p>You just took the first step into something REAL.</p>
    <p>No fluff. No BS. Just bold, life-first entrepreneurship with AI as your co-pilot.</p>
    <p><strong>What's next?</strong></p>
    <ul>
      <li>Meet SUPERNova AI - your personal coach who remembers EVERYTHING</li>
      <li>Dive into your recommended programs</li>
      <li>Join The Venue - our community of rebels who refuse to play small</li>
    </ul>
    <p style="margin-top: 32px;">Let's fucking go. 🎸</p>
    <p>- The dAItaniverse Team</p>
  </div>
</body>
</html>
  `

  console.log('📧 WELCOME EMAIL')
  console.log('To:', email)
  console.log('Subject:', 'Welcome to dAItaniverse!')

  // TODO: Send via email provider

  return true
}
