/**
 * SUPERNova Pitch Deck Generator - Implementation Examples
 *
 * Complete working examples for integrating the Pitch Deck Generator
 * into your Wix site pages and backend code.
 */

import wixUsers from 'wix-users';
import wixLocation from 'wix-location';

// Backend imports
import {
  createDeck,
  getDecks,
  getDeck,
  updateDeck,
  updateDesignTheme,
  generateShareLink,
  addCollaborator
} from 'backend/pitchDeckService';

import {
  createQuestionnaire,
  getCurrentQuestion,
  submitAnswer,
  skipQuestion,
  goToPreviousQuestion,
  getQuestionnaireSummary
} from 'backend/pitchQuestionnaireService';

import {
  generateDeck,
  regenerateSlide
} from 'backend/pitchGenerationService';

import {
  getSlides,
  updateSlide,
  reorderSlides,
  addChart
} from 'backend/pitchSlideService';

import {
  getDeckFeedback,
  getSlideSuggestions,
  getInvestorQuestions
} from 'backend/pitchFeedbackService';

import {
  exportToPowerPoint,
  exportToPDF,
  getDeckAnalytics
} from 'backend/pitchExportService';

// ============================================================================
// EXAMPLE 1: Create Deck and Start Questionnaire
// ============================================================================

export async function createNewInvestorDeck() {
  const userId = wixUsers.currentUser.id;

  // Create deck
  const deck = await createDeck(userId, {
    title: 'SuperWidget Inc.',
    deckType: 'investor',
    stage: 'seed',
    askAmount: 500000,
    targetAudience: 'Seed-stage VCs and angel investors',
    presentationDate: new Date('2024-12-15')
  });

  console.log('Deck created:', deck._id);

  // Create questionnaire
  const questionnaire = await createQuestionnaire(deck._id, 'investor');

  console.log('Questionnaire started');
  console.log('Total questions:', questionnaire.totalQuestions);

  return {
    deckId: deck._id,
    questionnaireId: questionnaire._id
  };
}

// ============================================================================
// EXAMPLE 2: Complete Questionnaire Flow
// ============================================================================

export async function completeInvestorQuestionnaire(deckId) {
  // Answer all questions
  const answers = {
    company_name: 'SuperWidget Inc.',
    one_liner: 'AI-powered inventory management for small businesses',
    problem: 'Small businesses waste 10+ hours/week on manual inventory tracking and lose sales from stockouts',
    problem_scope: '30 million small businesses in the US, 60% need better inventory tools',
    solution: 'We use AI to predict demand and auto-reorder inventory',
    how_it_works: 'Connect to your POS, we analyze sales patterns, predict demand, and auto-order from suppliers',
    secret_sauce: 'Proprietary demand forecasting algorithm trained on 10M transactions',
    why_now: 'Supply chain disruptions made inventory management critical. AI is finally accurate enough.',
    market_size: 'TAM: £15B, SAM: £3B, SOM: £150M',
    target_customer: 'Retail shops with £250K-£2M revenue, 1-10 employees, managing 500+ SKUs',
    business_model: 'SaaS subscription: £99/month per location',
    pricing: '£99/month base + £0.10 per transaction processed',
    unit_economics: 'CAC: £150, LTV: £2,400, Gross margin: 85%',
    traction: '450 paying customers, £40K MRR, 120% YoY growth',
    metrics: 'Revenue: £40K MRR, Customers: 450, Growth: 120% YoY, Churn: 3%',
    competition: 'Manual spreadsheets, basic inventory apps (TradeGecko, Cin7)',
    differentiation: 'AI prediction (10x more accurate), automated ordering, supply chain integration',
    go_to_market: 'Content marketing (SMB inventory guides), partnerships with POS systems, referral program',
    team: 'CEO: Sarah Chen (ex-Amazon supply chain), CTO: Mike Rodriguez (ML PhD), VP Sales: Lisa Park (10yrs SMB SaaS)',
    financials: 'Y1: £500K, Y2: £2M, Y3: £5M, Y4: £10M, Y5: £20M',
    raise_amount: '£500,000',
    use_of_funds: 'Product development (40%), Sales & Marketing (40%), Operations (20%)',
    milestones: '500 customers, £100K MRR, expand to 3 new verticals'
  };

  for (const [questionId, answer] of Object.entries(answers)) {
    await submitAnswer(deckId, questionId, answer);
    console.log(`✓ Answered: ${questionId}`);
  }

  const summary = await getQuestionnaireSummary(deckId);
  console.log('\nQuestionnaire complete!');
  console.log(`Answered: ${summary.answeredCount}/${summary.totalQuestions}`);

  return summary;
}

// ============================================================================
// EXAMPLE 3: Generate Deck with AI
// ============================================================================

export async function generateInvestorDeck(deckId) {
  console.log('Generating deck with AI...');

  // This will:
  // 1. Analyze questionnaire responses
  // 2. Generate 15+ slides with compelling copy
  // 3. Create speaker notes for each slide
  // 4. Structure narrative flow

  const result = await generateDeck(deckId);

  console.log(`✓ Generated ${result.slideCount} slides`);

  // Preview slides
  for (const slide of result.slides.slice(0, 5)) {
    console.log(`\nSlide ${slide.slideNumber}: ${slide.title}`);
    console.log(`Type: ${slide.slideType}`);
    console.log(`Layout: ${slide.designLayout}`);
  }

  return result;
}

// ============================================================================
// EXAMPLE 4: Review and Edit Slides
// ============================================================================

export async function reviewAndEditDeck(deckId) {
  const slides = await getSlides(deckId);

  console.log(`\nReviewing ${slides.length} slides...`);

  // Find problem slide and enhance it
  const problemSlide = slides.find(s => s.slideType === 'problem');

  if (problemSlide) {
    // Add customer story for more emotion
    await updateSlide(problemSlide._id, {
      content: {
        ...problemSlide.content,
        customerStory: {
          name: 'Sarah, Bakery Owner',
          quote: '"I lost £5,000 in spoiled inventory last month. I can\'t keep doing this."',
          impact: '15 hours/week wasted on manual counting'
        }
      }
    });

    console.log('✓ Enhanced problem slide with customer story');
  }

  // Find traction slide and add growth chart
  const tractionSlide = slides.find(s => s.slideType === 'traction');

  if (tractionSlide) {
    await addChart(tractionSlide._id, {
      type: 'line',
      title: 'Monthly Recurring Revenue',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [15, 20, 28, 35, 40, 48]
      },
      config: {
        showLegend: false,
        color: '#3B82F6'
      }
    });

    console.log('✓ Added growth chart to traction slide');
  }

  return slides;
}

// ============================================================================
// EXAMPLE 5: Get AI Feedback
// ============================================================================

export async function getAIFeedbackOnDeck(deckId) {
  console.log('Getting AI feedback...');

  const feedback = await getDeckFeedback(deckId);

  console.log('\n=== AI DECK REVIEW ===\n');
  console.log(`Overall Score: ${feedback.score}/100`);

  console.log('\n✅ STRENGTHS:');
  feedback.strengths.forEach(s => console.log(`  • ${s}`));

  console.log('\n⚠️  WEAKNESSES:');
  feedback.weaknesses.forEach(w => console.log(`  • ${w}`));

  if (feedback.criticalIssues && feedback.criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    feedback.criticalIssues.forEach(i => console.log(`  • ${i}`));
  }

  console.log('\n💡 RECOMMENDATIONS:');
  feedback.recommendations.forEach((rec, i) => {
    console.log(`\n${i + 1}. ${rec.slide} (${rec.priority} priority)`);
    console.log(`   Issue: ${rec.issue}`);
    console.log(`   Fix: ${rec.suggestion}`);
  });

  console.log('\n🎯 INVESTOR PERSPECTIVE:');
  console.log('\nLikely Questions:');
  feedback.investorPerspective.likelyQuestions.forEach(q => {
    console.log(`  • ${q}`);
  });

  return feedback;
}

// ============================================================================
// EXAMPLE 6: Practice Mode
// ============================================================================

export async function practicePitchWithAI(deckId) {
  console.log('🎤 PRACTICE MODE\n');
  console.log('AI will ask tough investor questions. Prepare your answers!\n');

  const questions = await getInvestorQuestions(deckId);

  questions.forEach((q, i) => {
    console.log(`Q${i + 1}: ${q}`);
    console.log('Your answer: ______________\n');
  });

  console.log('\nTips:');
  console.log('• Have data ready to back up claims');
  console.log('• Be honest about risks');
  console.log('• Show you\'ve thought through objections');
  console.log('• Practice answers out loud');

  return questions;
}

// ============================================================================
// EXAMPLE 7: Customize Design
// ============================================================================

export async function customizeDesign(deckId) {
  const userId = wixUsers.currentUser.id;

  // Try different themes
  console.log('Applying "tech" theme...');
  await updateDesignTheme(deckId, 'tech', userId);

  const deck = await getDeck(deckId);
  console.log('Color scheme:', deck.colorScheme);
  // { primary: '#06B6D4', secondary: '#6366F1', accent: '#10B981', ... }

  // Or use custom colors
  await updateDeck(deckId, {
    colorScheme: {
      primary: '#7C3AED', // Purple
      secondary: '#EC4899', // Pink
      accent: '#F59E0B', // Amber
      background: '#1F2937',
      text: '#F9FAFB'
    }
  }, userId);

  console.log('✓ Applied custom color scheme');

  return deck;
}

// ============================================================================
// EXAMPLE 8: Version Control
// ============================================================================

export async function createDeckVersions(deckId) {
  const userId = wixUsers.currentUser.id;

  // Create "Conservative" version
  await saveVersion(deckId, {
    versionName: 'Conservative',
    description: 'Safe projections for risk-averse investors',
    tags: ['conservative', 'safe']
  });

  // Modify deck for aggressive version
  await updateDeck(deckId, {
    askAmount: 1000000 // Double the ask
  }, userId);

  // Modify financials slide
  const slides = await getSlides(deckId);
  const financialsSlide = slides.find(s => s.slideType === 'financials');

  if (financialsSlide) {
    await updateSlide(financialsSlide._id, {
      content: {
        ...financialsSlide.content,
        projections: {
          y1: 1000000,
          y2: 4000000,
          y3: 10000000,
          y4: 20000000,
          y5: 40000000
        }
      }
    });
  }

  // Save "Aggressive" version
  await saveVersion(deckId, {
    versionName: 'Aggressive',
    description: 'Ambitious growth for risk-taking VCs',
    tags: ['aggressive', 'growth']
  });

  console.log('✓ Created two versions: Conservative & Aggressive');
  console.log('Now you can switch between them based on your audience!');
}

// ============================================================================
// EXAMPLE 9: Collaboration
// ============================================================================

export async function addCoFounderToCollab(deckId, cofounderEmail) {
  const userId = wixUsers.currentUser.id;

  // In production, would look up user by email
  const cofounderId = 'cofounder-user-id';

  await addCollaborator(deckId, cofounderId, userId);

  console.log(`✓ Added ${cofounderEmail} as collaborator`);
  console.log('They can now edit slides and leave comments');

  return deck;
}

// ============================================================================
// EXAMPLE 10: Export and Share
// ============================================================================

export async function exportAndShareDeck(deckId) {
  const userId = wixUsers.currentUser.id;

  // Export to PowerPoint
  console.log('Exporting to PowerPoint...');
  const pptx = await exportToPowerPoint(deckId);
  console.log(`✓ Download: ${pptx.fileName}`);
  console.log(`   ${pptx.downloadUrl}`);

  // Export to PDF
  console.log('\nExporting to PDF...');
  const pdf = await exportToPDF(deckId);
  console.log(`✓ Download: ${pdf.fileName}`);

  // Generate shareable link
  console.log('\nGenerating shareable link...');
  const share = await generateShareLink(deckId, {
    password: 'investor2024',
    trackingEnabled: true,
    userId
  });

  console.log(`✓ Share URL: ${share.shareLink}`);
  console.log('  Password protected: Yes');
  console.log('  Analytics tracking: Enabled');

  return {
    pptx,
    pdf,
    shareLink: share.shareLink
  };
}

// ============================================================================
// EXAMPLE 11: Analytics Dashboard
// ============================================================================

export async function viewDeckAnalytics(deckId) {
  const analytics = await getDeckAnalytics(deckId);

  console.log('\n📊 DECK ANALYTICS\n');
  console.log(`Total Views: ${analytics.totalViews}`);
  console.log(`Unique Viewers: ${analytics.uniqueViewers}`);
  console.log(`Avg Time: ${Math.round(analytics.avgDuration / 60)} minutes`);

  if (analytics.mostViewedSlides && analytics.mostViewedSlides.length > 0) {
    console.log('\nMost Viewed Slides:');
    analytics.mostViewedSlides.forEach((slide, i) => {
      console.log(`${i + 1}. ${slide.title} - ${slide.views} views`);
    });
  }

  console.log('\nDevice Breakdown:');
  Object.entries(analytics.deviceBreakdown).forEach(([device, count]) => {
    console.log(`  ${device}: ${count}`);
  });

  return analytics;
}

// ============================================================================
// FRONTEND: Questionnaire Page
// ============================================================================

/**
 * Page Code for /pitch/create
 */
export function questionnairePageCode() {
  let deckId;
  let currentQuestionId;

  $w.onReady(async function () {
    deckId = $w('#deckIdText').text;
    await loadCurrentQuestion();

    $w('#submitButton').onClick(handleSubmit);
    $w('#skipButton').onClick(handleSkip);
    $w('#backButton').onClick(handleBack);
  });

  async function loadCurrentQuestion() {
    const q = await getCurrentQuestion(deckId);

    if (q.isComplete) {
      // Questionnaire done - go to generation
      wixLocation.to('/pitch/generate/' + deckId);
      return;
    }

    currentQuestionId = q.questionId;

    // Update UI
    $w('#questionText').text = q.question;
    $w('#progressBar').value = q.progress;
    $w('#progressLabel').text = `Question ${q.questionNumber} of ${q.totalQuestions}`;
    $w('#answerInput').value = '';
    $w('#answerInput').focus();
  }

  async function handleSubmit() {
    const answer = $w('#answerInput').value.trim();

    if (!answer) {
      $w('#errorText').text = 'Please provide an answer';
      $w('#errorText').show();
      return;
    }

    $w('#errorText').hide();
    $w('#submitButton').disable();

    await submitAnswer(deckId, currentQuestionId, answer);

    $w('#submitButton').enable();
    await loadCurrentQuestion();
  }

  async function handleSkip() {
    await skipQuestion(deckId, currentQuestionId);
    await loadCurrentQuestion();
  }

  async function handleBack() {
    await goToPreviousQuestion(deckId);
    await loadCurrentQuestion();
  }
}

// ============================================================================
// FRONTEND: Deck Editor Page
// ============================================================================

/**
 * Page Code for /pitch/edit/:id
 */
export function deckEditorPageCode() {
  let deckId;
  let currentSlideId;
  let allSlides = [];

  $w.onReady(async function () {
    deckId = wixLocation.query.id;
    await loadDeck();
    await loadSlides();

    $w('#saveButton').onClick(saveSlide);
    $w('#exportButton').onClick(showExportOptions);
    $w('#shareButton').onClick(shareHandler);
    $w('#feedbackButton').onClick(getFeedback);
  });

  async function loadDeck() {
    const deck = await getDeck(deckId);
    $w('#deckTitle').text = deck.title;
    $w('#statusBadge').text = deck.status.toUpperCase();
  }

  async function loadSlides() {
    allSlides = await getSlides(deckId);

    $w('#slidesRepeater').data = allSlides.map(s => ({
      _id: s._id,
      number: s.slideNumber,
      title: s.title,
      type: s.slideType
    }));

    $w('#slidesRepeater').onItemReady(($item, itemData) => {
      $item('#slideCard').onClick(() => {
        loadSlideInEditor(itemData._id);
      });
    });

    // Load first slide
    if (allSlides.length > 0) {
      loadSlideInEditor(allSlides[0]._id);
    }
  }

  async function loadSlideInEditor(slideId) {
    currentSlideId = slideId;
    const slide = allSlides.find(s => s._id === slideId);

    $w('#slideTitle').value = slide.title;
    $w('#slideSubtitle').value = slide.subtitle || '';

    // Display content (simplified - would have rich editor in production)
    $w('#contentEditor').value = JSON.stringify(slide.content, null, 2);
    $w('#speakerNotes').value = slide.speakerNotes || '';

    // Highlight in sidebar
    $w('#slidesRepeater').forEachItem(($item, itemData) => {
      if (itemData._id === slideId) {
        $item('#slideCard').style.backgroundColor = '#E0F2FE';
      } else {
        $item('#slideCard').style.backgroundColor = '#FFFFFF';
      }
    });
  }

  async function saveSlide() {
    try {
      await updateSlide(currentSlideId, {
        title: $w('#slideTitle').value,
        subtitle: $w('#slideSubtitle').value,
        content: JSON.parse($w('#contentEditor').value),
        speakerNotes: $w('#speakerNotes').value
      });

      $w('#saveStatus').text = '✓ Saved';
      $w('#saveStatus').show();

      setTimeout(() => {
        $w('#saveStatus').hide();
      }, 2000);

    } catch (error) {
      $w('#errorMessage').text = 'Error saving: ' + error.message;
      $w('#errorMessage').show();
    }
  }

  async function getFeedback() {
    $w('#feedbackButton').disable();
    $w('#feedbackButton').label = 'Analyzing...';

    const feedback = await getDeckFeedback(deckId);

    // Display feedback in modal
    $w('#feedbackModal').show();
    $w('#feedbackScore').text = feedback.score;
    $w('#feedbackText').text = feedback.overallAssessment;

    $w('#feedbackButton').enable();
    $w('#feedbackButton').label = 'Get AI Feedback';
  }
}

// ============================================================================
// COMPLETE WORKFLOW EXAMPLE
// ============================================================================

export async function completeWorkflowExample() {
  console.log('🚀 COMPLETE PITCH DECK WORKFLOW\n');

  const userId = wixUsers.currentUser.id;

  // 1. Create deck
  console.log('1. Creating investor deck...');
  const { deckId } = await createNewInvestorDeck();

  // 2. Complete questionnaire
  console.log('\n2. Answering questionnaire...');
  await completeInvestorQuestionnaire(deckId);

  // 3. Generate deck
  console.log('\n3. Generating deck with AI...');
  await generateInvestorDeck(deckId);

  // 4. Review and edit
  console.log('\n4. Reviewing slides...');
  await reviewAndEditDeck(deckId);

  // 5. Get feedback
  console.log('\n5. Getting AI feedback...');
  const feedback = await getAIFeedbackOnDeck(deckId);

  // 6. Practice
  console.log('\n6. Practice mode...');
  await practicePitchWithAI(deckId);

  // 7. Customize design
  console.log('\n7. Customizing design...');
  await customizeDesign(deckId);

  // 8. Export and share
  console.log('\n8. Exporting and sharing...');
  await exportAndShareDeck(deckId);

  console.log('\n✅ DECK COMPLETE AND READY TO PITCH!\n');

  return {
    deckId,
    feedback,
    status: 'ready_to_pitch'
  };
}

// Export all functions
export {
  createNewInvestorDeck,
  completeInvestorQuestionnaire,
  generateInvestorDeck,
  reviewAndEditDeck,
  getAIFeedbackOnDeck,
  practicePitchWithAI,
  customizeDesign,
  createDeckVersions,
  addCoFounderToCollab,
  exportAndShareDeck,
  viewDeckAnalytics,
  questionnairePageCode,
  deckEditorPageCode
};
