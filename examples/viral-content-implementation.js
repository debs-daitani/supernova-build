/**
 * SUPERNova Viral Content Analyzer - Implementation Examples
 *
 * Complete code examples for implementing the Viral Content Analyzer.
 */

// ============================================================================
// EXAMPLE 1: Trending Viral Content Feed
// ============================================================================

import { getTrendingContent, addViralContent } from 'backend/viralContentService';
import wixLocation from 'wix-location';

$w.onReady(async function () {
  await loadTrendingContent();
  
  // Setup filters
  setupFilters();
});

async function loadTrendingContent() {
  try {
    $w('#loadingSpinner').show();
    
    const filters = {
      platform: $w('#platformDropdown').value || null,
      minViralScore: parseInt($w('#minScoreSlider').value) || 60,
      limit: 20
    };
    
    const trending = await getTrendingContent(filters);
    
    $w('#trendingRepeater').data = trending.map(content => ({
      _id: content._id,
      thumbnail: content.thumbnailUrl || '/default-thumb.png',
      title: content.title,
      author: content.author,
      platform: content.platform.toUpperCase(),
      viralScore: content.viralScore,
      views: formatNumber(content.views),
      likes: formatNumber(content.likes),
      engagementRate: content.engagementRate.toFixed(1) + '%'
    }));
    
    $w('#trendingRepeater').onItemReady(($item, itemData) => {
      $item('#thumbnailImage').src = itemData.thumbnail;
      $item('#titleText').text = itemData.title;
      $item('#authorText').text = `@${itemData.author}`;
      $item('#platformBadge').label = itemData.platform;
      $item('#scoreText').text = itemData.viralScore;
      $item('#viewsText').text = itemData.views + ' views';
      $item('#likesText').text = itemData.likes + ' likes';
      
      // Color-code viral score
      const score = itemData.viralScore;
      if (score >= 80) {
        $item('#scoreText').style.backgroundColor = '#10B981'; // Green
      } else if (score >= 60) {
        $item('#scoreText').style.backgroundColor = '#F59E0B'; // Orange
      }
      
      // Analyze button
      $item('#analyzeButton').onClick(() => {
        wixLocation.to(`/viral/analyze?id=${itemData._id}`);
      });
    });
  } catch (error) {
    console.error('Error loading trending:', error);
  } finally {
    $w('#loadingSpinner').hide();
  }
}

function setupFilters() {
  $w('#platformDropdown').onChange(() => loadTrendingContent());
  $w('#minScoreSlider').onChange(() => loadTrendingContent());
  $w('#refreshButton').onClick(() => loadTrendingContent());
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// ============================================================================
// EXAMPLE 2: Analyze Viral Content Page
// ============================================================================

import { analyzeViralContent, getAnalysis } from 'backend/viralAnalysisService';
import { getViralContent } from 'backend/viralContentService';

$w.onReady(async function () {
  const contentId = wixLocation.query.id;
  
  if (contentId) {
    await loadAnalysis(contentId);
  }
  
  // Setup URL analysis
  $w('#analyzeUrlButton').onClick(async () => {
    await analyzeFromURL();
  });
});

async function loadAnalysis(contentId) {
  try {
    $w('#loadingSpinner').show();
    
    // Get content and analysis
    const content = await getViralContent(contentId);
    let analysis = await getAnalysis(contentId);
    
    // If not analyzed yet, analyze now
    if (!analysis) {
      $w('#analyzingText').show();
      analysis = await analyzeViralContent(contentId);
    }
    
    // Display content info
    $w('#contentTitle').text = content.title;
    $w('#contentAuthor').text = `@${content.author}`;
    $w('#platformText').text = content.platform.toUpperCase();
    $w('#viralScoreText').text = content.viralScore;
    $w('#viewsText').text = formatNumber(content.views);
    $w('#likesText').text = formatNumber(content.likes);
    $w('#engagementRateText').text = content.engagementRate.toFixed(1) + '%';
    
    if (content.thumbnailUrl) {
      $w('#contentImage').src = content.thumbnailUrl;
    }
    
    // Display analysis
    displayAnalysisResults(analysis);
    
  } catch (error) {
    console.error('Error loading analysis:', error);
    $w('#errorText').text = 'Error loading analysis';
    $w('#errorText').show();
  } finally {
    $w('#loadingSpinner').hide();
    $w('#analyzingText').hide();
  }
}

function displayAnalysisResults(analysis) {
  // Hook analysis
  $w('#hookTypeText').text = formatHookType(analysis.hookType);
  $w('#hookText').text = `"${analysis.hookText}"`;
  $w('#hookScoreText').text = analysis.hookScore;
  
  // Emotional triggers
  $w('#emotionsText').text = analysis.emotionalTriggers.join(', ');
  
  // Psychology principles
  $w('#psychologyRepeater').data = analysis.psychologicalPrinciples.map((p, i) => ({
    _id: `psych-${i}`,
    principle: formatPrinciple(p)
  }));
  
  // Engagement drivers
  $w('#driversRepeater').data = analysis.engagementDrivers.map((d, i) => ({
    _id: `driver-${i}`,
    driver: d
  }));
  
  // Key takeaways
  $w('#takeawaysRepeater').data = analysis.keyTakeaways.map((t, i) => ({
    _id: `takeaway-${i}`,
    takeaway: t
  }));
  
  // Recommendations
  $w('#recommendationsRepeater').data = analysis.recommendations.map((r, i) => ({
    _id: `rec-${i}`,
    recommendation: r.recommendation,
    how: r.how,
    priority: r.priority
  }));
  
  $w('#recommendationsRepeater').onItemReady(($item, itemData) => {
    $item('#recommendationText').text = itemData.recommendation;
    $item('#howText').text = itemData.how;
    $item('#priorityBadge').label = itemData.priority.toUpperCase();
    
    // Color-code priority
    if (itemData.priority === 'high') {
      $item('#priorityBadge').style.backgroundColor = '#EF4444';
    } else if (itemData.priority === 'medium') {
      $item('#priorityBadge').style.backgroundColor = '#F59E0B';
    } else {
      $item('#priorityBadge').style.backgroundColor = '#6B7280';
    }
  });
}

async function analyzeFromURL() {
  const url = $w('#urlInput').value;
  
  if (!url) {
    $w('#errorText').text = 'Please enter a URL';
    $w('#errorText').show();
    return;
  }
  
  try {
    $w('#loadingSpinner').show();
    $w('#analyzingText').show();
    
    // Detect platform
    const platform = detectPlatform(url);
    
    // Add content (in production, would fetch metrics from API)
    const content = await addViralContent({
      url,
      platform,
      title: 'Analyzing...',
      author: 'unknown',
      authorFollowers: 0,
      contentType: 'post',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0
    }, currentUser.id);
    
    // Analyze
    const analysis = await analyzeViralContent(content._id);
    
    // Display results
    wixLocation.to(`/viral/analyze?id=${content._id}`);
    
  } catch (error) {
    console.error('Error analyzing URL:', error);
    $w('#errorText').text = 'Error analyzing content';
    $w('#errorText').show();
  } finally {
    $w('#loadingSpinner').hide();
    $w('#analyzingText').hide();
  }
}

function detectPlatform(url) {
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('youtube.com')) return 'youtube';
  if (url.includes('linkedin.com')) return 'linkedin';
  if (url.includes('facebook.com')) return 'facebook';
  return 'unknown';
}

function formatHookType(hookType) {
  const types = {
    question: 'Question Hook',
    bold_claim: 'Bold Claim',
    story: 'Story Opening',
    statistic: 'Statistic',
    controversy: 'Controversial Statement',
    curiosity_gap: 'Curiosity Gap',
    pattern_interrupt: 'Pattern Interrupt'
  };
  return types[hookType] || hookType;
}

function formatPrinciple(principle) {
  const principles = {
    social_proof: 'Social Proof',
    authority: 'Authority',
    scarcity: 'Scarcity',
    reciprocity: 'Reciprocity',
    storytelling: 'Storytelling',
    contrast: 'Contrast',
    pattern_interrupt: 'Pattern Interrupt'
  };
  return principles[principle] || principle;
}

// ============================================================================
// EXAMPLE 3: Content Ideas Generator
// ============================================================================

import { generateContentIdeas, getUserIdeas } from 'backend/viralToolsService';

$w.onReady(async function () {
  await loadUserIdeas();
  
  $w('#generateButton').onClick(async () => {
    await generateIdeas();
  });
});

async function generateIdeas() {
  try {
    $w('#loadingSpinner').show();
    $w('#generatingText').show();
    
    const preferences = {
      platform: $w('#platformDropdown').value,
      industry: $w('#industryInput').value,
      topics: $w('#topicsInput').value.split(',').map(t => t.trim())
    };
    
    const ideas = await generateContentIdeas(currentUser.id, preferences);
    
    // Display ideas
    $w('#ideasRepeater').data = ideas.map(idea => ({
      _id: idea._id,
      idea: idea.idea,
      hook: idea.hook,
      score: idea.estimatedViralScore,
      platform: idea.platform,
      status: idea.status
    }));
    
    $w('#ideasRepeater').onItemReady(($item, itemData) => {
      $item('#ideaText').text = itemData.idea;
      $item('#hookText').text = `Hook: "${itemData.hook}"`;
      $item('#scoreText').text = itemData.score;
      $item('#platformBadge').label = itemData.platform.toUpperCase();
      
      // Draft button
      $item('#draftButton').onClick(() => {
        wixLocation.to(`/viral/builder?ideaId=${itemData._id}`);
      });
      
      // Save button
      $item('#saveButton').onClick(async () => {
        // Already saved, mark as saved
        $item('#saveButton').label = 'Saved!';
        $item('#saveButton').disable();
      });
    });
    
  } catch (error) {
    console.error('Error generating ideas:', error);
  } finally {
    $w('#loadingSpinner').hide();
    $w('#generatingText').hide();
  }
}

async function loadUserIdeas() {
  const ideas = await getUserIdeas(currentUser.id);
  
  $w('#savedIdeasCount').text = ideas.length.toString();
}

// ============================================================================
// EXAMPLE 4: Virality Predictor
// ============================================================================

import { predictVirality } from 'backend/viralToolsService';

$w.onReady(function () {
  let predictionTimeout;
  
  $w('#draftInput').onInput(() => {
    // Debounce prediction
    clearTimeout(predictionTimeout);
    predictionTimeout = setTimeout(async () => {
      await runPrediction();
    }, 1000);
  });
  
  $w('#predictButton').onClick(async () => {
    await runPrediction();
  });
});

async function runPrediction() {
  const draft = $w('#draftInput').value;
  
  if (draft.length < 50) {
    $w('#scoreText').text = '--';
    $w('#feedbackText').text = 'Write at least 50 characters for prediction';
    return;
  }
  
  try {
    $w('#predictingSpinner').show();
    
    const platform = $w('#platformDropdown').value;
    const prediction = await predictVirality(platform, draft);
    
    // Display score
    $w('#scoreText').text = prediction.viralScore;
    $w('#confidenceText').text = `Confidence: ${prediction.confidence}`;
    $w('#estimatedEngagement').text = prediction.estimatedEngagement.toUpperCase();
    
    // Color-code score
    const score = prediction.viralScore;
    if (score >= 70) {
      $w('#scoreCircle').style.backgroundColor = '#10B981';
    } else if (score >= 50) {
      $w('#scoreCircle').style.backgroundColor = '#F59E0B';
    } else {
      $w('#scoreCircle').style.backgroundColor = '#EF4444';
    }
    
    // Display strengths
    $w('#strengthsRepeater').data = prediction.strengths.map((s, i) => ({
      _id: `strength-${i}`,
      text: s
    }));
    
    // Display weaknesses
    $w('#weaknessesRepeater').data = prediction.weaknesses.map((w, i) => ({
      _id: `weakness-${i}`,
      text: w
    }));
    
    // Display suggestions
    $w('#suggestionsRepeater').data = prediction.suggestions.map((s, i) => ({
      _id: `suggestion-${i}`,
      issue: s.issue,
      suggestion: s.suggestion,
      impact: s.impact
    }));
    
    // Show optimized version
    if (prediction.optimizedVersion) {
      $w('#optimizedText').text = prediction.optimizedVersion;
      $w('#optimizedSection').expand();
    }
    
  } catch (error) {
    console.error('Error predicting virality:', error);
  } finally {
    $w('#predictingSpinner').hide();
  }
}

// ============================================================================
// EXAMPLE 5: Trend Tracker
// ============================================================================

import { getCurrentTrends } from 'backend/viralToolsService';

$w.onReady(async function () {
  await loadTrends();
});

async function loadTrends() {
  try {
    $w('#loadingSpinner').show();
    
    const filters = {
      platform: $w('#platformDropdown').value || null,
      category: $w('#categoryDropdown').value || null
    };
    
    const trends = await getCurrentTrends(filters);
    
    $w('#trendsRepeater').data = trends.map(trend => ({
      _id: trend._id,
      trend: trend.trend,
      platform: trend.platform,
      status: trend.status,
      description: trend.description,
      opportunity: trend.opportunityWindow,
      howTo: trend.howToCapitalize
    }));
    
    $w('#trendsRepeater').onItemReady(($item, itemData) => {
      $item('#trendText').text = itemData.trend;
      $item('#platformBadge').label = itemData.platform.toUpperCase();
      $item('#statusBadge').label = itemData.status.toUpperCase();
      $item('#descriptionText').text = itemData.description;
      $item('#opportunityText').text = itemData.opportunity;
      $item('#howToText').text = itemData.howTo;
      
      // Color-code status
      if (itemData.status === 'peak') {
        $item('#statusBadge').style.backgroundColor = '#10B981';
      } else if (itemData.status === 'rising') {
        $item('#statusBadge').style.backgroundColor = '#3B82F6';
      } else if (itemData.status === 'emerging') {
        $item('#statusBadge').style.backgroundColor = '#8B5CF6';
      }
      
      // Use trend button
      $item('#useTrendButton').onClick(() => {
        wixLocation.to(`/viral/builder?trendId=${itemData._id}`);
      });
    });
    
  } catch (error) {
    console.error('Error loading trends:', error);
  } finally {
    $w('#loadingSpinner').hide();
  }
}

// ============================================================================
// EXAMPLE 6: Compare Your Content
// ============================================================================

import { analyzeUserContent } from 'backend/viralAnalysisService';
import wixData from 'wix-data';

$w.onReady(function () {
  $w('#compareButton').onClick(async () => {
    await compareContent();
  });
});

async function compareContent() {
  try {
    $w('#loadingSpinner').show();
    
    const yourUrl = $w('#yourUrlInput').value;
    const viralUrl = $w('#viralUrlInput').value;
    
    // Submit your content
    const yourContent = await wixData.insert('UserContentSubmissions', {
      userId: currentUser.id,
      url: yourUrl,
      platform: detectPlatform(yourUrl),
      // ... would fetch actual metrics
      yourPerformance: {
        views: parseInt($w('#yourViewsInput').value),
        likes: parseInt($w('#yourLikesInput').value)
      }
    });
    
    // Find similar viral content
    const viralContent = await getContentByURL(viralUrl);
    
    // Compare
    const comparison = await analyzeUserContent(
      yourContent._id,
      viralContent._id
    );
    
    // Display comparison
    displayComparison(comparison);
    
  } catch (error) {
    console.error('Error comparing content:', error);
  } finally {
    $w('#loadingSpinner').hide();
  }
}

function displayComparison(comparison) {
  // Key differences
  $w('#differencesRepeater').data = comparison.keyDifferences.map((d, i) => ({
    _id: `diff-${i}`,
    aspect: d.aspect,
    yourApproach: d.userApproach,
    viralApproach: d.viralApproach,
    lesson: d.lesson
  }));
  
  $w('#differencesRepeater').onItemReady(($item, itemData) => {
    $item('#aspectText').text = itemData.aspect;
    $item('#yourText').text = `You: ${itemData.yourApproach}`;
    $item('#viralText').text = `Viral: ${itemData.viralApproach}`;
    $item('#lessonText').text = `Lesson: ${itemData.lesson}`;
  });
  
  // Recommendations
  $w('#comparisonRecsRepeater').data = comparison.recommendations.map((r, i) => ({
    _id: `rec-${i}`,
    improve: r.improve,
    how: r.how,
    priority: r.priority
  }));
}
