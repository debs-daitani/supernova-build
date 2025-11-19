/**
 * SUPERNova Pinterest Integration - Complete Implementation Example
 *
 * This file demonstrates how to integrate Pinterest management
 * into your Wix site with complete examples for all major features.
 */

import wixWindow from 'wix-window';
import { fetch } from 'wix-fetch';
import wixData from 'wix-data';

// ============================================================================
// PINTEREST DASHBOARD PAGE
// ============================================================================

/**
 * Pinterest Dashboard - Main page
 * Page: /social/pinterest
 */
export async function pinterestDashboard_onReady() {
  // Check if Pinterest is connected
  const isConnected = await checkPinterestConnection();

  if (!isConnected) {
    $w('#connectSection').show();
    $w('#mainDashboard').hide();
    return;
  }

  // Load dashboard data
  await Promise.all([
    loadAccountStats(),
    loadRecentPins(),
    loadQuickStats()
  ]);

  // Setup event handlers
  setupDashboardHandlers();
}

async function checkPinterestConnection() {
  try {
    const response = await fetch('/_functions/pinterestAccount');
    const account = await response.json();

    if (account && account.isConnected) {
      $w('#accountUsername').text = `@${account.username}`;
      $w('#accountFollowers').text = account.followerCount.toLocaleString();
      $w('#accountBoards').text = account.boardCount.toString();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking Pinterest connection:', error);
    return false;
  }
}

async function loadAccountStats() {
  try {
    const accountResponse = await fetch('/_functions/pinterestAccount');
    const account = await accountResponse.json();

    // Get analytics for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const analyticsResponse = await fetch(
      `/_functions/analytics?accountId=${account._id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
    const analytics = await analyticsResponse.json();

    // Display stats in cards
    $w('#monthlyViewersCard').text = account.monthlyViews.toLocaleString();
    $w('#impressions30dCard').text = analytics.totalImpressions.toLocaleString();
    $w('#saves30dCard').text = analytics.totalSaves.toLocaleString();
    $w('#clicks30dCard').text = analytics.totalClicks.toLocaleString();

    // Calculate and display engagement rate
    const engagementRate = analytics.avgEngagementRate.toFixed(2);
    $w('#engagementRateCard').text = `${engagementRate}%`;
  } catch (error) {
    console.error('Error loading account stats:', error);
  }
}

async function loadRecentPins() {
  try {
    const accountResponse = await fetch('/_functions/pinterestAccount');
    const account = await accountResponse.json();

    const pinsResponse = await fetch(`/_functions/pins?accountId=${account._id}&limit=12`);
    const pins = await pinsResponse.json();

    $w('#recentPinsRepeater').data = pins;

    $w('#recentPinsRepeater').onItemReady(($item, itemData) => {
      // Pin image
      $item('#pinImage').src = itemData.imageUrl;

      // Pin title
      $item('#pinTitle').text = itemData.title;

      // Status badge
      $item('#pinStatus').text = itemData.status.toUpperCase();

      const statusColors = {
        'draft': '#9CA3AF',
        'scheduled': '#3B82F6',
        'published': '#10B981',
        'failed': '#EF4444'
      };
      $item('#statusBadge').style.backgroundColor = statusColors[itemData.status];

      // Stats (if published)
      if (itemData.status === 'published') {
        $item('#pinImpressions').text = itemData.impressions.toLocaleString();
        $item('#pinSaves').text = itemData.saves.toLocaleString();
        $item('#pinClicks').text = itemData.clicks.toLocaleString();
        $item('#statsSection').show();
      } else {
        $item('#statsSection').hide();
      }

      // Scheduled info
      if (itemData.status === 'scheduled' && itemData.scheduledFor) {
        const scheduledDate = new Date(itemData.scheduledFor);
        $item('#scheduledInfo').text = `Scheduled for ${scheduledDate.toLocaleString()}`;
        $item('#scheduledInfo').show();
      } else {
        $item('#scheduledInfo').hide();
      }

      // Click handlers
      $item('#pinCard').onClick(() => {
        wixWindow.openLightbox('pinEditor', { pinId: itemData._id });
      });

      $item('#editBtn').onClick(() => {
        wixWindow.openLightbox('pinEditor', { pinId: itemData._id });
      });

      $item('#deleteBtn').onClick(async () => {
        if (confirm('Delete this pin?')) {
          await deletePin(itemData._id);
        }
      });
    });
  } catch (error) {
    console.error('Error loading recent pins:', error);
  }
}

async function loadQuickStats() {
  try {
    const accountResponse = await fetch('/_functions/pinterestAccount');
    const account = await accountResponse.json();

    // Get pin counts by status
    const allPinsResponse = await fetch(`/_functions/pins?accountId=${account._id}&limit=1000`);
    const allPins = await allPinsResponse.json();

    const counts = {
      draft: 0,
      scheduled: 0,
      published: 0,
      failed: 0
    };

    allPins.forEach(pin => {
      counts[pin.status]++;
    });

    $w('#draftCount').text = counts.draft.toString();
    $w('#scheduledCount').text = counts.scheduled.toString();
    $w('#publishedCount').text = counts.published.toString();
    $w('#failedCount').text = counts.failed.toString();
  } catch (error) {
    console.error('Error loading quick stats:', error);
  }
}

function setupDashboardHandlers() {
  // Create pin button
  $w('#createPinBtn').onClick(() => {
    wixWindow.openLightbox('pinCreator');
  });

  // Bulk create button
  $w('#bulkCreateBtn').onClick(() => {
    wixWindow.openLightbox('bulkPinCreator');
  });

  // Schedule button
  $w('#scheduleBtn').onClick(() => {
    wixWindow.navigateTo('/social/pinterest/scheduler');
  });

  // Analytics button
  $w('#analyticsBtn').onClick(() => {
    wixWindow.navigateTo('/social/pinterest/analytics');
  });

  // Boards button
  $w('#boardsBtn').onClick(() => {
    wixWindow.navigateTo('/social/pinterest/boards');
  });

  // Sync button
  $w('#syncBtn').onClick(async () => {
    await syncPinterestAccount();
  });

  // Connect Pinterest button
  $w('#connectPinterestBtn').onClick(() => {
    connectPinterest();
  });
}

async function syncPinterestAccount() {
  $w('#syncBtn').disable();
  $w('#syncBtn').label = 'Syncing...';

  try {
    await fetch('/_functions/pinterestSync', { method: 'POST' });

    // Reload dashboard
    await Promise.all([
      loadAccountStats(),
      loadRecentPins(),
      loadQuickStats()
    ]);

    $w('#syncBtn').label = 'Synced!';
    setTimeout(() => {
      $w('#syncBtn').label = 'Sync Account';
      $w('#syncBtn').enable();
    }, 2000);
  } catch (error) {
    console.error('Error syncing:', error);
    $w('#syncBtn').label = 'Sync Failed';
    $w('#syncBtn').enable();
  }
}

async function connectPinterest() {
  try {
    const response = await fetch('/_functions/pinterestAuth');
    const { authUrl } = await response.json();

    // Open Pinterest OAuth in new window
    window.open(authUrl, '_blank', 'width=600,height=700');

    // Poll for connection
    const checkInterval = setInterval(async () => {
      const isConnected = await checkPinterestConnection();
      if (isConnected) {
        clearInterval(checkInterval);
        // Refresh page to show connected state
        location.reload();
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(checkInterval), 300000);
  } catch (error) {
    console.error('Error connecting Pinterest:', error);
  }
}

async function deletePin(pinId) {
  try {
    await fetch(`/_functions/pins/${pinId}`, { method: 'DELETE' });

    // Reload pins
    await loadRecentPins();
  } catch (error) {
    console.error('Error deleting pin:', error);
  }
}

// ============================================================================
// PIN SCHEDULER PAGE
// ============================================================================

/**
 * Pin Scheduler - Calendar view
 * Page: /social/pinterest/scheduler
 */
export async function pinScheduler_onReady() {
  await loadSchedulerCalendar();
  await loadQueueOverview();

  setupSchedulerHandlers();
}

async function loadSchedulerCalendar() {
  try {
    const accountResponse = await fetch('/_functions/pinterestAccount');
    const account = await accountResponse.json();

    // Get scheduled pins
    const pinsResponse = await fetch(`/_functions/pins?accountId=${account._id}&status=scheduled`);
    const scheduledPins = await pinsResponse.json();

    // Group by date
    const pinsByDate = {};

    scheduledPins.forEach(pin => {
      const dateKey = new Date(pin.scheduledFor).toDateString();
      if (!pinsByDate[dateKey]) {
        pinsByDate[dateKey] = [];
      }
      pinsByDate[dateKey].push(pin);
    });

    // Render calendar
    renderCalendar(pinsByDate);
  } catch (error) {
    console.error('Error loading scheduler calendar:', error);
  }
}

function renderCalendar(pinsByDate) {
  // Get current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Generate calendar days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const calendarDays = [];

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateKey = date.toDateString();

    calendarDays.push({
      _id: dateKey,
      date: date,
      dayNumber: day,
      pins: pinsByDate[dateKey] || [],
      pinCount: (pinsByDate[dateKey] || []).length
    });
  }

  $w('#calendarRepeater').data = calendarDays;

  $w('#calendarRepeater').onItemReady(($item, itemData) => {
    $item('#dayNumber').text = itemData.dayNumber.toString();
    $item('#pinCount').text = `${itemData.pinCount} pins`;

    // Show pin thumbnails
    if (itemData.pins.length > 0) {
      const thumbnails = itemData.pins.slice(0, 3);
      $item('#pinThumbnails').src = thumbnails.map(p => p.imageUrl);
    }

    // Click to see day's schedule
    $item('#dayCard').onClick(() => {
      wixWindow.openLightbox('daySchedule', {
        date: itemData.date,
        pins: itemData.pins
      });
    });
  });
}

async function loadQueueOverview() {
  try {
    const accountResponse = await fetch('/_functions/pinterestAccount');
    const account = await accountResponse.json();

    // Get queue overview (this would be a custom endpoint)
    // For now, just show scheduled count
    const pinsResponse = await fetch(`/_functions/pins?accountId=${account._id}&status=scheduled`);
    const scheduledPins = await pinsResponse.json();

    $w('#queueCount').text = `${scheduledPins.length} pins in queue`;

    // Find next pin to post
    if (scheduledPins.length > 0) {
      const sorted = scheduledPins.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
      const nextPin = sorted[0];
      const nextDate = new Date(nextPin.scheduledFor);

      $w('#nextPinTime').text = `Next pin: ${nextDate.toLocaleString()}`;
    } else {
      $w('#nextPinTime').text = 'No pins scheduled';
    }
  } catch (error) {
    console.error('Error loading queue overview:', error);
  }
}

function setupSchedulerHandlers() {
  $w('#addToQueueBtn').onClick(() => {
    wixWindow.openLightbox('selectPinsForQueue');
  });

  $w('#configureScheduleBtn').onClick(() => {
    wixWindow.openLightbox('scheduleSettings');
  });

  $w('#rebalanceBtn').onClick(async () => {
    await rebalanceQueue();
  });
}

async function rebalanceQueue() {
  try {
    $w('#rebalanceBtn').disable();
    $w('#rebalanceBtn').label = 'Rebalancing...';

    const accountResponse = await fetch('/_functions/pinterestAccount');
    const account = await accountResponse.json();

    // Call rebalance endpoint
    await fetch('/_functions/rebalanceQueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinterestAccountId: account._id })
    });

    // Reload calendar
    await loadSchedulerCalendar();
    await loadQueueOverview();

    $w('#rebalanceBtn').label = 'Rebalanced!';
    setTimeout(() => {
      $w('#rebalanceBtn').label = 'Rebalance Queue';
      $w('#rebalanceBtn').enable();
    }, 2000);
  } catch (error) {
    console.error('Error rebalancing queue:', error);
    $w('#rebalanceBtn').enable();
  }
}

// ============================================================================
// ANALYTICS PAGE
// ============================================================================

/**
 * Pinterest Analytics - Performance tracking
 * Page: /social/pinterest/analytics
 */
export async function pinterestAnalytics_onReady() {
  // Default to last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  await loadAnalytics(startDate, endDate);

  setupAnalyticsHandlers();
}

async function loadAnalytics(startDate, endDate) {
  try {
    const accountResponse = await fetch('/_functions/pinterestAccount');
    const account = await accountResponse.json();

    const analyticsResponse = await fetch(
      `/_functions/analytics?accountId=${account._id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
    const analytics = await analyticsResponse.json();

    // Display summary stats
    $w('#totalImpressions').text = analytics.totalImpressions.toLocaleString();
    $w('#totalSaves').text = analytics.totalSaves.toLocaleString();
    $w('#totalClicks').text = analytics.totalClicks.toLocaleString();
    $w('#totalCloseups').text = analytics.totalCloseups.toLocaleString();
    $w('#avgEngagementRate').text = `${analytics.avgEngagementRate.toFixed(2)}%`;

    // Render charts
    renderImpressionsChart(analytics.dailyData);
    renderEngagementChart(analytics.dailyData);

    // Load top pins
    await loadTopPins(account._id);

    // Load top boards
    await loadTopBoards(account._id);
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}

function renderImpressionsChart(dailyData) {
  const chartData = dailyData.map(day => ({
    x: new Date(day.date),
    y: day.impressions
  }));

  // Use Wix Charts or external charting library
  // This is a simplified example
  $w('#impressionsChart').data = chartData;
}

function renderEngagementChart(dailyData) {
  const chartData = dailyData.map(day => ({
    x: new Date(day.date),
    saves: day.saves,
    clicks: day.clicks,
    closeups: day.closeups
  }));

  $w('#engagementChart').data = chartData;
}

async function loadTopPins(accountId) {
  try {
    // This would call a custom endpoint for top pins
    const response = await fetch(`/_functions/topPins?accountId=${accountId}&limit=10&metric=impressions`);
    const topPins = await response.json();

    $w('#topPinsRepeater').data = topPins;

    $w('#topPinsRepeater').onItemReady(($item, itemData, index) => {
      $item('#pinRank').text = `#${index + 1}`;
      $item('#pinImage').src = itemData.imageUrl;
      $item('#pinTitle').text = itemData.title;
      $item('#pinImpressions').text = itemData.impressions.toLocaleString();
      $item('#pinSaves').text = itemData.saves.toLocaleString();
      $item('#pinClicks').text = itemData.clicks.toLocaleString();

      // Calculate CTR
      const ctr = itemData.impressions > 0
        ? ((itemData.clicks / itemData.impressions) * 100).toFixed(2)
        : '0.00';
      $item('#pinCTR').text = `${ctr}%`;
    });
  } catch (error) {
    console.error('Error loading top pins:', error);
  }
}

async function loadTopBoards(accountId) {
  try {
    const response = await fetch(`/_functions/topBoards?accountId=${accountId}&limit=5`);
    const topBoards = await response.json();

    $w('#topBoardsRepeater').data = topBoards;

    $w('#topBoardsRepeater').onItemReady(($item, itemData, index) => {
      $item('#boardRank').text = `#${index + 1}`;
      $item('#boardName').text = itemData.name;
      $item('#boardPins').text = `${itemData.pinCount} pins`;
      $item('#boardImpressions').text = itemData.stats.impressions.toLocaleString();
      $item('#boardSaves').text = itemData.stats.saves.toLocaleString();
    });
  } catch (error) {
    console.error('Error loading top boards:', error);
  }
}

function setupAnalyticsHandlers() {
  $w('#dateRangeDropdown').onChange(() => {
    const range = $w('#dateRangeDropdown').value;
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    loadAnalytics(startDate, endDate);
  });

  $w('#exportBtn').onClick(() => {
    exportAnalytics();
  });
}

async function exportAnalytics() {
  // Export analytics to CSV
  console.log('Exporting analytics...');
}

// ============================================================================
// AUTOMATION SETUP
// ============================================================================

/**
 * Setup RSS Auto-Pinning
 */
export async function setupRSSAutoPinning() {
  const rssFeedUrl = $w('#rssFeedInput').value;
  const boardId = $w('#rssBoardDropdown').value;
  const frequency = $w('#rssFrequencyDropdown').value;

  try {
    await fetch('/_functions/setupRSSAutomation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rssFeedUrl,
        boardId,
        frequency
      })
    });

    $w('#successMessage').text = 'RSS auto-pinning configured!';
    $w('#successMessage').show();
  } catch (error) {
    console.error('Error setting up RSS:', error);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export {
  pinterestDashboard_onReady,
  pinScheduler_onReady,
  pinterestAnalytics_onReady,
  setupRSSAutoPinning
};
