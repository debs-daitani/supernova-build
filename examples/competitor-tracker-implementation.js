/**
 * SUPERNova Competitor Tracker - Implementation Examples
 *
 * Complete code examples for implementing the Competitor Tracker
 * in your Wix site.
 */

// ============================================================================
// EXAMPLE 1: Add Competitor Page
// ============================================================================

// File: Add-Competitor.js (Wix Page Code)

import { discoverFromURL, discoverFromName } from 'backend/competitorDiscoveryService';
import { createCompetitor } from 'backend/competitorService';
import wixLocation from 'wix-location';

$w.onReady(function () {
  // Handle add by URL
  $w('#addByUrlButton').onClick(async () => {
    const url = $w('#urlInput').value;

    if (!url) {
      $w('#errorText').text = 'Please enter a URL';
      $w('#errorText').show();
      return;
    }

    try {
      $w('#loadingSpinner').show();
      $w('#errorText').hide();

      // Auto-discover from URL
      const result = await discoverFromURL(wixLocation.query.userId, url);

      // Show success and navigate
      $w('#successText').text = `Successfully added ${result.competitor.name}!`;
      $w('#successText').show();

      // Navigate to competitor page
      setTimeout(() => {
        wixLocation.to(`/competitors/${result.competitor._id}`);
      }, 1500);
    } catch (error) {
      $w('#errorText').text = `Error: ${error.message}`;
      $w('#errorText').show();
    } finally {
      $w('#loadingSpinner').hide();
    }
  });

  // Handle add by name
  $w('#addByNameButton').onClick(async () => {
    const companyName = $w('#nameInput').value;

    if (!companyName) {
      $w('#errorText').text = 'Please enter a company name';
      $w('#errorText').show();
      return;
    }

    try {
      $w('#loadingSpinner').show();
      $w('#errorText').hide();

      // Auto-discover from name
      const result = await discoverFromName(wixLocation.query.userId, companyName);

      $w('#successText').text = `Successfully added ${result.competitor.name}!`;
      $w('#successText').show();

      setTimeout(() => {
        wixLocation.to(`/competitors/${result.competitor._id}`);
      }, 1500);
    } catch (error) {
      $w('#errorText').text = `Error: ${error.message}`;
      $w('#errorText').show();
    } finally {
      $w('#loadingSpinner').hide();
    }
  });

  // Handle manual entry
  $w('#manualEntryButton').onClick(() => {
    $w('#manualForm').expand();
  });

  $w('#saveManualButton').onClick(async () => {
    const competitorData = {
      name: $w('#manualNameInput').value,
      website: $w('#manualWebsiteInput').value,
      description: $w('#manualDescriptionInput').value,
      industry: $w('#manualIndustryInput').value,
      relationship: $w('#relationshipDropdown').value
    };

    try {
      $w('#loadingSpinner').show();

      const competitor = await createCompetitor(
        wixLocation.query.userId,
        competitorData
      );

      wixLocation.to(`/competitors/${competitor._id}`);
    } catch (error) {
      $w('#errorText').text = `Error: ${error.message}`;
      $w('#errorText').show();
    } finally {
      $w('#loadingSpinner').hide();
    }
  });
});

// ============================================================================
// EXAMPLE 2: Competitor Dashboard
// ============================================================================

// File: Competitors-Dashboard.js (Wix Page Code)

import {
  listCompetitors,
  getCompetitorStats,
  deleteCompetitor
} from 'backend/competitorService';
import { getUnreadCount } from 'backend/competitorAlertService';
import wixLocation from 'wix-location';

let currentUserId;

$w.onReady(async function () {
  currentUserId = wixLocation.query.userId;

  // Load dashboard
  await loadDashboard();

  // Setup event handlers
  setupEventHandlers();
});

async function loadDashboard() {
  try {
    $w('#dashboardLoading').show();

    // Load stats
    const stats = await getCompetitorStats(currentUserId);
    const unreadAlerts = await getUnreadCount(currentUserId);

    // Display stats
    $w('#totalCompetitorsText').text = stats.total.toString();
    $w('#activeCompetitorsText').text = (stats.byStatus.active || 0).toString();
    $w('#monitoringEnabledText').text = stats.monitoring.enabled.toString();
    $w('#unreadAlertsText').text = unreadAlerts.toString();

    // Load competitors list
    const competitors = await listCompetitors(currentUserId, {
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });

    // Populate repeater
    $w('#competitorRepeater').data = competitors.map(comp => ({
      _id: comp._id,
      name: comp.name,
      website: comp.website,
      industry: comp.industry || 'Unknown',
      logo: comp.logo || '/default-logo.png',
      relationship: comp.relationship,
      status: comp.status,
      monitoring: comp.monitoringEnabled ? 'On' : 'Off',
      lastMonitored: comp.lastMonitored
        ? formatDate(comp.lastMonitored)
        : 'Never'
    }));
  } catch (error) {
    console.error('Error loading dashboard:', error);
    $w('#errorText').text = 'Error loading dashboard';
    $w('#errorText').show();
  } finally {
    $w('#dashboardLoading').hide();
  }
}

function setupEventHandlers() {
  // Filter buttons
  $w('#allFilterButton').onClick(async () => {
    await filterCompetitors(null);
  });

  $w('#directFilterButton').onClick(async () => {
    await filterCompetitors({ relationship: 'direct' });
  });

  $w('#indirectFilterButton').onClick(async () => {
    await filterCompetitors({ relationship: 'indirect' });
  });

  // Search
  $w('#searchInput').onInput(async () => {
    const searchTerm = $w('#searchInput').value;
    if (searchTerm.length >= 2) {
      await searchCompetitors(searchTerm);
    } else if (searchTerm.length === 0) {
      await loadDashboard();
    }
  });

  // Repeater item setup
  $w('#competitorRepeater').onItemReady(($item, itemData) => {
    $item('#nameText').text = itemData.name;
    $item('#industryText').text = itemData.industry;
    $item('#logoImage').src = itemData.logo;
    $item('#relationshipTag').label = itemData.relationship;
    $item('#monitoringTag').label = itemData.monitoring;

    // View button
    $item('#viewButton').onClick(() => {
      wixLocation.to(`/competitors/${itemData._id}`);
    });

    // Delete button
    $item('#deleteButton').onClick(async () => {
      if (confirm(`Delete ${itemData.name}?`)) {
        try {
          await deleteCompetitor(itemData._id);
          await loadDashboard();
        } catch (error) {
          console.error('Error deleting competitor:', error);
        }
      }
    });
  });
}

async function filterCompetitors(filters) {
  const competitors = await listCompetitors(currentUserId, filters || {});
  updateRepeater(competitors);
}

async function searchCompetitors(searchTerm) {
  const results = await searchCompetitors(currentUserId, searchTerm);
  updateRepeater(results);
}

function updateRepeater(competitors) {
  $w('#competitorRepeater').data = competitors.map(comp => ({
    _id: comp._id,
    name: comp.name,
    website: comp.website,
    industry: comp.industry || 'Unknown',
    logo: comp.logo || '/default-logo.png',
    relationship: comp.relationship,
    status: comp.status,
    monitoring: comp.monitoringEnabled ? 'On' : 'Off'
  }));
}

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB');
}

// ============================================================================
// EXAMPLE 3: Competitor Profile Page
// ============================================================================

// File: Competitor-Profile.js (Wix Page Code)

import { getCompetitor, updateCompetitor } from 'backend/competitorService';
import { getWebsiteData } from 'backend/competitorWebsiteService';
import { getCurrentPricing } from 'backend/competitorPricingService';
import { getSocialOverview } from 'backend/competitorSocialService';
import { getLatestSEOData } from 'backend/competitorSEOService';
import { getRecentContent } from 'backend/competitorContentService';
import { getAlerts } from 'backend/competitorAlertService';
import wixLocation from 'wix-location';

let competitorId;
let competitor;

$w.onReady(async function () {
  competitorId = wixLocation.query.id;

  if (!competitorId) {
    wixLocation.to('/competitors');
    return;
  }

  await loadCompetitorProfile();
  setupTabs();
});

async function loadCompetitorProfile() {
  try {
    $w('#profileLoading').show();

    // Load competitor data
    competitor = await getCompetitor(competitorId);

    // Display header info
    $w('#companyNameText').text = competitor.name;
    $w('#websiteLink').link = competitor.website;
    $w('#websiteLink').text = competitor.website;
    $w('#logoImage').src = competitor.logo || '/default-logo.png';
    $w('#descriptionText').text = competitor.description || 'No description';
    $w('#industryText').text = competitor.industry || 'Unknown';
    $w('#relationshipTag').label = competitor.relationship;
    $w('#statusTag').label = competitor.status;

    // Monitoring toggle
    $w('#monitoringSwitch').checked = competitor.monitoringEnabled;

    // Load overview tab by default
    await loadOverviewTab();
  } catch (error) {
    console.error('Error loading competitor profile:', error);
    $w('#errorText').text = 'Error loading competitor';
    $w('#errorText').show();
  } finally {
    $w('#profileLoading').hide();
  }
}

function setupTabs() {
  $w('#overviewTab').onClick(() => loadOverviewTab());
  $w('#websiteTab').onClick(() => loadWebsiteTab());
  $w('#pricingTab').onClick(() => loadPricingTab());
  $w('#socialTab').onClick(() => loadSocialTab());
  $w('#seoTab').onClick(() => loadSEOTab());
  $w('#contentTab').onClick(() => loadContentTab());
  $w('#alertsTab').onClick(() => loadAlertsTab());

  // Monitoring toggle
  $w('#monitoringSwitch').onChange(async () => {
    try {
      await updateCompetitor(competitorId, {
        monitoringEnabled: $w('#monitoringSwitch').checked
      });
    } catch (error) {
      console.error('Error updating monitoring:', error);
    }
  });
}

async function loadOverviewTab() {
  try {
    // Load summary data
    const [website, social, seo] = await Promise.all([
      getWebsiteData(competitorId),
      getSocialOverview(competitorId),
      getLatestSEOData(competitorId)
    ]);

    // Display summary
    if (website) {
      $w('#websiteTitleText').text = website.title || 'N/A';
      $w('#lastCheckedText').text = formatDate(website.lastChecked);
    }

    if (social) {
      $w('#totalFollowersText').text = social.totalFollowers.toLocaleString();
      $w('#engagementRateText').text = `${social.avgEngagementRate.toFixed(1)}%`;
    }

    if (seo) {
      $w('#domainAuthorityText').text = seo.domainAuthority.toString();
      $w('#organicTrafficText').text = seo.organicTraffic.toLocaleString();
    }

    // Recent activity timeline
    const alerts = await getAlerts(wixLocation.query.userId, {
      competitorId,
      limit: 10
    });

    $w('#activityRepeater').data = alerts.map(alert => ({
      _id: alert._id,
      icon: getAlertIcon(alert.alertType),
      title: alert.title,
      date: formatDate(alert.createdAt)
    }));
  } catch (error) {
    console.error('Error loading overview:', error);
  }
}

async function loadPricingTab() {
  try {
    const pricing = await getCurrentPricing(competitorId);

    $w('#pricingRepeater').data = pricing.map(plan => ({
      _id: plan._id,
      plan: plan.plan,
      price: `£${plan.price}/${plan.billingCycle}`,
      features: plan.features.join(', ')
    }));

    $w('#pricingRepeater').onItemReady(($item, itemData) => {
      $item('#planNameText').text = itemData.plan;
      $item('#priceText').text = itemData.price;
      $item('#featuresText').text = itemData.features;
    });
  } catch (error) {
    console.error('Error loading pricing:', error);
  }
}

async function loadSocialTab() {
  try {
    const social = await getSocialOverview(competitorId);

    const platforms = [];

    Object.entries(social.platforms).forEach(([platform, data]) => {
      platforms.push({
        _id: platform,
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        followers: data.followers.toLocaleString(),
        change: data.followersChangePercentage > 0
          ? `+${data.followersChangePercentage.toFixed(1)}%`
          : `${data.followersChangePercentage.toFixed(1)}%`,
        engagement: `${data.engagementRate.toFixed(1)}%`,
        posts: data.postFrequency.toFixed(1)
      });
    });

    $w('#socialRepeater').data = platforms;

    $w('#socialRepeater').onItemReady(($item, itemData) => {
      $item('#platformText').text = itemData.platform;
      $item('#followersText').text = itemData.followers;
      $item('#changeText').text = itemData.change;
      $item('#engagementText').text = itemData.engagement;
      $item('#postsText').text = itemData.posts;
    });
  } catch (error) {
    console.error('Error loading social:', error);
  }
}

async function loadAlertsTab() {
  try {
    const alerts = await getAlerts(wixLocation.query.userId, {
      competitorId,
      limit: 50
    });

    $w('#alertsRepeater').data = alerts.map(alert => ({
      _id: alert._id,
      icon: getAlertIcon(alert.alertType),
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      date: formatDate(alert.createdAt),
      isRead: alert.isRead
    }));

    $w('#alertsRepeater').onItemReady(($item, itemData) => {
      $item('#iconText').text = itemData.icon;
      $item('#titleText').text = itemData.title;
      $item('#descriptionText').text = itemData.description;
      $item('#dateText').text = itemData.date;

      // Style by severity
      if (itemData.severity === 'critical') {
        $item('#container').style.backgroundColor = '#FEE2E2';
      } else if (itemData.severity === 'important') {
        $item('#container').style.backgroundColor = '#FEF3C7';
      }

      // Style if unread
      if (!itemData.isRead) {
        $item('#titleText').style.fontWeight = 'bold';
      }
    });
  } catch (error) {
    console.error('Error loading alerts:', error);
  }
}

function getAlertIcon(alertType) {
  const icons = {
    website_change: '🌐',
    pricing_change: '💰',
    new_product: '🚀',
    new_content: '📝',
    social_spike: '📈',
    seo_change: '🔍',
    news: '📰',
    funding: '💵'
  };

  return icons[alertType] || '📢';
}

// ============================================================================
// EXAMPLE 4: Alerts Page
// ============================================================================

// File: Alerts.js (Wix Page Code)

import {
  getAlerts,
  markAsRead,
  dismissAlert,
  getAlertStats
} from 'backend/competitorAlertService';
import wixLocation from 'wix-location';

let currentFilter = 'all';

$w.onReady(async function () {
  await loadAlerts();
  await loadStats();
  setupFilters();
});

async function loadAlerts() {
  try {
    const userId = wixLocation.query.userId;

    const filters = {
      limit: 100
    };

    if (currentFilter === 'unread') {
      filters.unreadOnly = true;
    } else if (currentFilter === 'critical') {
      filters.severity = 'critical';
    } else if (currentFilter === 'important') {
      filters.severity = 'important';
    }

    const alerts = await getAlerts(userId, filters);

    $w('#alertsRepeater').data = alerts.map(alert => ({
      _id: alert._id,
      icon: getAlertIcon(alert.alertType),
      competitorName: alert.competitorName,
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      date: formatDate(alert.createdAt),
      isRead: alert.isRead
    }));

    $w('#alertsRepeater').onItemReady(($item, itemData) => {
      $item('#iconText').text = itemData.icon;
      $item('#competitorText').text = itemData.competitorName;
      $item('#titleText').text = itemData.title;
      $item('#descriptionText').text = itemData.description;
      $item('#dateText').text = itemData.date;

      // Severity badge
      $item('#severityBadge').label = itemData.severity;

      // Mark as read button
      if (!itemData.isRead) {
        $item('#markReadButton').show();
        $item('#markReadButton').onClick(async () => {
          await markAsRead(itemData._id);
          await loadAlerts();
        });
      } else {
        $item('#markReadButton').hide();
      }

      // Dismiss button
      $item('#dismissButton').onClick(async () => {
        await dismissAlert(itemData._id);
        await loadAlerts();
      });
    });
  } catch (error) {
    console.error('Error loading alerts:', error);
  }
}

async function loadStats() {
  try {
    const stats = await getAlertStats(wixLocation.query.userId, 30);

    $w('#totalAlertsText').text = stats.total.toString();
    $w('#unreadAlertsText').text = stats.unread.toString();
    $w('#criticalAlertsText').text = (stats.bySeverity.critical || 0).toString();
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function setupFilters() {
  $w('#allFilterButton').onClick(() => {
    currentFilter = 'all';
    loadAlerts();
  });

  $w('#unreadFilterButton').onClick(() => {
    currentFilter = 'unread';
    loadAlerts();
  });

  $w('#criticalFilterButton').onClick(() => {
    currentFilter = 'critical';
    loadAlerts();
  });

  $w('#importantFilterButton').onClick(() => {
    currentFilter = 'important';
    loadAlerts();
  });
}

// ============================================================================
// EXAMPLE 5: Create Comparison Report
// ============================================================================

// File: Create-Comparison.js (Wix Page Code)

import { listCompetitors } from 'backend/competitorService';
import { createComparison } from 'backend/competitorComparisonService';
import wixLocation from 'wix-location';

$w.onReady(async function () {
  await loadCompetitors();

  $w('#createButton').onClick(async () => {
    await createComparisonReport();
  });
});

async function loadCompetitors() {
  const competitors = await listCompetitors(wixLocation.query.userId);

  const options = competitors.map(comp => ({
    label: comp.name,
    value: comp._id
  }));

  $w('#competitorCheckboxGroup').options = options;
}

async function createComparisonReport() {
  try {
    const selectedCompetitors = $w('#competitorCheckboxGroup').value;
    const comparisonType = $w('#typeDropdown').value;
    const comparisonName = $w('#nameInput').value;

    if (selectedCompetitors.length < 2) {
      $w('#errorText').text = 'Please select at least 2 competitors';
      $w('#errorText').show();
      return;
    }

    $w('#loadingSpinner').show();

    const comparison = await createComparison(wixLocation.query.userId, {
      name: comparisonName,
      comparisonType,
      competitorIds: selectedCompetitors,
      metrics: {}
    });

    // Navigate to comparison view
    wixLocation.to(`/competitors/comparisons/${comparison._id}`);
  } catch (error) {
    console.error('Error creating comparison:', error);
    $w('#errorText').text = `Error: ${error.message}`;
    $w('#errorText').show();
  } finally {
    $w('#loadingSpinner').hide();
  }
}

// ============================================================================
// EXAMPLE 6: Weekly Digest
// ============================================================================

// File: Weekly-Digest.js (Wix Page Code)

import { generateWeeklyDigest } from 'backend/competitorReportService';
import wixLocation from 'wix-location';

$w.onReady(async function () {
  await loadWeeklyDigest();
});

async function loadWeeklyDigest() {
  try {
    $w('#loadingSpinner').show();

    const digest = await generateWeeklyDigest(wixLocation.query.userId);

    // Display overview
    $w('#weekEndingText').text = digest.weekEnding;
    $w('#overviewText').text = digest.summary.overview;

    // Display key insights
    $w('#insightsRepeater').data = digest.summary.keyInsights.map((insight, index) => ({
      _id: `insight-${index}`,
      insight
    }));

    $w('#insightsRepeater').onItemReady(($item, itemData) => {
      $item('#insightText').text = itemData.insight;
    });

    // Display critical alerts
    $w('#criticalCountText').text = digest.alerts.critical.length.toString();

    $w('#criticalRepeater').data = digest.alerts.critical.map(alert => ({
      _id: alert._id,
      competitor: alert.competitorName,
      title: alert.title,
      description: alert.description
    }));

    // Display recommendations
    $w('#recommendationsRepeater').data = digest.summary.recommendations.map((rec, index) => ({
      _id: `rec-${index}`,
      action: rec.action,
      priority: rec.priority,
      reasoning: rec.reasoning
    }));

    $w('#recommendationsRepeater').onItemReady(($item, itemData) => {
      $item('#actionText').text = itemData.action;
      $item('#priorityBadge').label = itemData.priority;
      $item('#reasoningText').text = itemData.reasoning;
    });
  } catch (error) {
    console.error('Error loading weekly digest:', error);
    $w('#errorText').text = 'Error loading digest';
    $w('#errorText').show();
  } finally {
    $w('#loadingSpinner').hide();
  }
}

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB');
}

// ============================================================================
// Helper Functions
// ============================================================================

function getAlertIcon(alertType) {
  const icons = {
    website_change: '🌐',
    pricing_change: '💰',
    new_product: '🚀',
    new_content: '📝',
    social_spike: '📈',
    seo_change: '🔍',
    news: '📰',
    funding: '💵'
  };

  return icons[alertType] || '📢';
}

function formatDate(date) {
  const d = new Date(date);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return d.toLocaleDateString('en-GB', options);
}
