# Pinterest Integration - Implementation Guide

## Overview

The Pinterest Integration is a comprehensive Pinterest management system for The dAItaniverse platform. It replaces tools like Tailwind, Later, and Pinterest Business with an integrated solution for scheduling, analytics, and content management.

**Goal:** Provide complete Pinterest management including pin creation, scheduling, analytics, automation, and content optimization.

## Architecture

### Database Collections

5 Wix Data Collections have been created to support Pinterest Integration:

#### Core Collections:
1. **PinterestAccounts** - Pinterest account connections and OAuth tokens
2. **PinterestBoards** - Pinterest boards with stats
3. **PinterestPins** - Pins (draft, scheduled, published)
4. **PinterestSchedules** - Posting schedule configuration
5. **PinterestAnalytics** - Daily analytics data

### Backend Services

6 comprehensive service files have been created in `/src/services/`:

1. **pinterestAccountService.js** - OAuth connection, account management, token refresh
2. **pinterestPinService.js** - Pin CRUD, publishing, scheduling, bulk operations
3. **pinterestBoardService.js** - Board management and statistics
4. **pinterestSchedulingService.js** - Smart scheduling, queue management, optimal times
5. **pinterestAnalyticsService.js** - Analytics fetching, reporting, trends
6. **pinterestAutomationService.js** - RSS auto-pinning, repinning, content recycling

## Setup Instructions

### Phase 1: Pinterest App Registration

1. **Create Pinterest App:**
   - Go to https://developers.pinterest.com/apps/
   - Create new app
   - Note: App ID and App Secret

2. **Configure OAuth:**
   - Add redirect URI: `https://yoursite.com/pinterest/callback`
   - Request scopes: `boards:read`, `boards:write`, `pins:read`, `pins:write`, `user_accounts:read`

3. **Store Credentials in Wix Secrets:**
   ```javascript
   // In Wix Secrets Manager:
   PINTEREST_APP_ID=your_app_id
   PINTEREST_APP_SECRET=your_app_secret
   PINTEREST_REDIRECT_URI=https://yoursite.com/pinterest/callback
   ```

### Phase 2: Database Setup (Wix Data Collections)

1. **Create Collections:**
   - Create each collection using the JSON schema files in `/schema/`
   - Manually add fields as defined in schemas

2. **Set Permissions:**
   - Read: Anyone (logged in users)
   - Write: Author (owner only)
   - Delete: Author (owner only)

3. **Create Indexes:**
   - Add indexes specified in each schema file

### Phase 3: Backend Services Integration

1. **Upload Service Files:**
   ```
   Copy all Pinterest service files to Wix Backend:
   - Backend/pinterestServices/pinterestAccountService.js
   - Backend/pinterestServices/pinterestPinService.js
   - Backend/pinterestServices/pinterestBoardService.js
   - Backend/pinterestServices/pinterestSchedulingService.js
   - Backend/pinterestServices/pinterestAnalyticsService.js
   - Backend/pinterestServices/pinterestAutomationService.js
   ```

2. **Create Backend API Endpoints:**

Create file: `Backend/http-functions.js`

```javascript
import { ok, notFound, serverError } from 'wix-http-functions';
import wixUsers from 'wix-users';
import * as pinterestAccount from './pinterestServices/pinterestAccountService';
import * as pinterestPin from './pinterestServices/pinterestPinService';
import * as pinterestBoard from './pinterestServices/pinterestBoardService';
import * as pinterestScheduling from './pinterestServices/pinterestSchedulingService';
import * as pinterestAnalytics from './pinterestServices/pinterestAnalyticsService';
import * as pinterestAutomation from './pinterestServices/pinterestAutomationService';

// Pinterest Account Endpoints
export async function get_pinterestAuth(request) {
  try {
    const userId = request.user.id;
    const authUrl = pinterestAccount.getAuthorizationUrl(userId);
    return ok({ body: JSON.stringify({ authUrl }) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

export async function get_pinterestCallback(request) {
  try {
    const code = request.query.code;
    const state = request.query.state;

    const { userId } = pinterestAccount.verifyStateToken(state);
    await pinterestAccount.exchangeCodeForToken(code, userId);

    // Redirect to Pinterest dashboard
    return {
      status: 302,
      headers: { 'Location': '/social/pinterest' }
    };
  } catch (error) {
    return serverError({ body: error.message });
  }
}

export async function get_pinterestAccount(request) {
  try {
    const userId = request.user.id;
    const account = await pinterestAccount.getPinterestAccount(userId);
    return ok({ body: JSON.stringify(account) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

export async function post_pinterestSync(request) {
  try {
    const userId = request.user.id;
    const account = await pinterestAccount.syncAccount(userId);
    return ok({ body: JSON.stringify(account) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

// Pin Endpoints
export async function get_pins(request) {
  try {
    const pinterestAccountId = request.query.accountId;
    const options = {
      status: request.query.status,
      boardId: request.query.boardId,
      limit: request.query.limit ? parseInt(request.query.limit) : 100
    };

    const pins = await pinterestPin.getPins(pinterestAccountId, options);
    return ok({ body: JSON.stringify(pins) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

export async function post_pins(request) {
  try {
    const pinData = await request.body.json();
    const pin = await pinterestPin.createPin(pinData);
    return ok({ body: JSON.stringify(pin) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

export async function post_pinsPublish(request) {
  try {
    const { pinId } = await request.body.json();
    const userId = request.user.id;

    const published = await pinterestPin.publishPin(pinId, userId);
    return ok({ body: JSON.stringify(published) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

export async function post_pinsSchedule(request) {
  try {
    const { pinId, scheduledTime } = await request.body.json();
    const scheduled = await pinterestPin.schedulePin(pinId, new Date(scheduledTime));
    return ok({ body: JSON.stringify(scheduled) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

// Board Endpoints
export async function get_boards(request) {
  try {
    const accountId = request.query.accountId;
    const boards = await pinterestBoard.getBoards(accountId);
    return ok({ body: JSON.stringify(boards) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

export async function post_boards(request) {
  try {
    const { pinterestAccountId, boardData } = await request.body.json();
    const userId = request.user.id;

    const board = await pinterestBoard.createBoard(pinterestAccountId, userId, boardData);
    return ok({ body: JSON.stringify(board) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

// Scheduling Endpoints
export async function get_schedule(request) {
  try {
    const accountId = request.query.accountId;
    const schedule = await pinterestScheduling.getScheduleConfig(accountId);
    return ok({ body: JSON.stringify(schedule) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

export async function post_addToQueue(request) {
  try {
    const { pinIds, pinterestAccountId } = await request.body.json();
    const scheduled = await pinterestScheduling.addToQueue(pinIds, pinterestAccountId);
    return ok({ body: JSON.stringify(scheduled) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

// Analytics Endpoints
export async function get_analytics(request) {
  try {
    const accountId = request.query.accountId;
    const startDate = new Date(request.query.startDate);
    const endDate = new Date(request.query.endDate);

    const summary = await pinterestAnalytics.getAnalyticsSummary(accountId, startDate, endDate);
    return ok({ body: JSON.stringify(summary) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

// Automation Endpoints
export async function post_autoPinRSS(request) {
  try {
    const { pinterestAccountId, rssFeedUrl, boardId, options } = await request.body.json();
    const pins = await pinterestAutomation.autoPinFromRSS(pinterestAccountId, rssFeedUrl, boardId, options);
    return ok({ body: JSON.stringify(pins) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}
```

### Phase 4: Frontend Implementation

## Page Structure

### Main Pages

#### 1. Pinterest Dashboard (`/social/pinterest`)

**Purpose:** Overview of Pinterest account and quick actions

**Components:**
- Connect Account button (if not connected)
- Stats cards (monthly viewers, impressions, saves, clicks)
- Recent pins grid
- Quick action buttons

**Wix Editor Setup:**
```
Page: pinterestDashboard
Elements:
- #connectBtn (Button) - Shows if not connected
- #statsCards (Repeater) - Stats display
- #recentPinsRepeater (Repeater) - Recent pins
- #createPinBtn (Button)
- #scheduleBtn (Button)
- #analyticsBtn (Button)
```

**Page Code (`pinterestDashboard.js`):**
```javascript
import wixWindow from 'wix-window';
import { fetch } from 'wix-fetch';

$w.onReady(async function () {
  await checkConnection();
  await loadStats();
  await loadRecentPins();

  $w('#connectBtn').onClick(() => connectPinterest());
  $w('#createPinBtn').onClick(() => createPin());
  $w('#syncBtn').onClick(() => syncAccount());
});

async function checkConnection() {
  try {
    const response = await fetch('/_functions/pinterestAccount');
    const account = await response.json();

    if (account && account.isConnected) {
      $w('#connectBtn').hide();
      $w('#connectedView').show();
      $w('#accountName').text = `@${account.username}`;
    } else {
      $w('#connectBtn').show();
      $w('#connectedView').hide();
    }
  } catch (error) {
    console.error('Error checking connection:', error);
    $w('#connectBtn').show();
    $w('#connectedView').hide();
  }
}

async function connectPinterest() {
  try {
    const response = await fetch('/_functions/pinterestAuth');
    const { authUrl } = await response.json();

    // Redirect to Pinterest OAuth
    wixWindow.openLightbox('authConfirm', { authUrl });
  } catch (error) {
    console.error('Error connecting Pinterest:', error);
  }
}

async function loadStats() {
  try {
    const accountResponse = await fetch('/_functions/pinterestAccount');
    const account = await accountResponse.json();

    if (!account) return;

    // Get analytics for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const analyticsResponse = await fetch(
      `/_functions/analytics?accountId=${account._id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
    const analytics = await analyticsResponse.json();

    // Display stats
    $w('#monthlyViewers').text = account.monthlyViews.toLocaleString();
    $w('#impressions30d').text = analytics.totalImpressions.toLocaleString();
    $w('#saves30d').text = analytics.totalSaves.toLocaleString();
    $w('#clicks30d').text = analytics.totalClicks.toLocaleString();
  } catch (error) {
    console.error('Error loading stats:', error);
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
      $item('#pinImage').src = itemData.imageUrl;
      $item('#pinTitle').text = itemData.title;
      $item('#pinStatus').text = itemData.status;

      // Status color
      const statusColors = {
        'draft': '#9CA3AF',
        'scheduled': '#3B82F6',
        'published': '#10B981',
        'failed': '#EF4444'
      };
      $item('#statusBadge').style.backgroundColor = statusColors[itemData.status];

      $item('#pinCard').onClick(() => {
        wixWindow.openLightbox('pinEditor', { pinId: itemData._id });
      });
    });
  } catch (error) {
    console.error('Error loading recent pins:', error);
  }
}

function createPin() {
  wixWindow.openLightbox('pinCreator');
}

async function syncAccount() {
  $w('#syncBtn').disable();
  $w('#syncBtn').label = 'Syncing...';

  try {
    await fetch('/_functions/pinterestSync', { method: 'POST' });

    await loadStats();
    await loadRecentPins();

    $w('#syncBtn').label = 'Synced!';
    setTimeout(() => {
      $w('#syncBtn').label = 'Sync';
      $w('#syncBtn').enable();
    }, 2000);
  } catch (error) {
    console.error('Error syncing:', error);
    $w('#syncBtn').label = 'Sync Failed';
    $w('#syncBtn').enable();
  }
}
```

#### 2. Pin Creator (`/social/pinterest/create`)

**Lightbox:** pinCreator

**Features:**
- Image upload
- Title input (100 char limit)
- Description input (500 char limit)
- Alt text input
- Destination link
- Board selector
- Schedule options (now, specific time, add to queue)
- Preview

**Lightbox Code (`pinCreator.js`):**
```javascript
import wixWindow from 'wix-window';
import { fetch } from 'wix-fetch';

let currentImageUrl = null;
let boards = [];

$w.onReady(async function () {
  await loadBoards();

  $w('#titleInput').onInput(() => updateCharCount('title'));
  $w('#descriptionInput').onInput(() => updateCharCount('description'));
  $w('#imageUpload').onChange(() => handleImageUpload());

  $w('#publishNowBtn').onClick(() => publishNow());
  $w('#scheduleBtn').onClick(() => schedulePin());
  $w('#queueBtn').onClick(() => addToQueue());
  $w('#saveDraftBtn').onClick(() => saveDraft());
});

async function loadBoards() {
  try {
    const accountResponse = await fetch('/_functions/pinterestAccount');
    const account = await accountResponse.json();

    const boardsResponse = await fetch(`/_functions/boards?accountId=${account._id}`);
    boards = await boardsResponse.json();

    $w('#boardDropdown').options = boards.map(b => ({
      label: b.name,
      value: b._id
    }));
  } catch (error) {
    console.error('Error loading boards:', error);
  }
}

function updateCharCount(field) {
  if (field === 'title') {
    const count = $w('#titleInput').value.length;
    $w('#titleCount').text = `${count}/100`;
    if (count > 100) {
      $w('#titleCount').style.color = '#EF4444';
    } else {
      $w('#titleCount').style.color = '#6B7280';
    }
  } else if (field === 'description') {
    const count = $w('#descriptionInput').value.length;
    $w('#descriptionCount').text = `${count}/500`;
    if (count > 500) {
      $w('#descriptionCount').style.color = '#EF4444';
    } else {
      $w('#descriptionCount').style.color = '#6B7280';
    }
  }
}

async function handleImageUpload() {
  try {
    if ($w('#imageUpload').value.length > 0) {
      const uploadedFile = $w('#imageUpload').uploadFiles()[0];
      currentImageUrl = uploadedFile.url;

      $w('#previewImage').src = currentImageUrl;
      $w('#previewSection').expand();
    }
  } catch (error) {
    console.error('Error uploading image:', error);
  }
}

async function createPinData() {
  const accountResponse = await fetch('/_functions/pinterestAccount');
  const account = await accountResponse.json();

  return {
    pinterestAccountId: account._id,
    boardId: $w('#boardDropdown').value,
    title: $w('#titleInput').value.substring(0, 100),
    description: $w('#descriptionInput').value.substring(0, 500),
    link: $w('#linkInput').value || null,
    imageUrl: currentImageUrl,
    altText: $w('#altTextInput').value || $w('#titleInput').value
  };
}

async function publishNow() {
  try {
    const pinData = await createPinData();

    // Create pin
    const createResponse = await fetch('/_functions/pins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pinData)
    });

    const pin = await createResponse.json();

    // Publish immediately
    await fetch('/_functions/pinsPublish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinId: pin._id })
    });

    wixWindow.lightbox.close({ success: true, action: 'published' });
  } catch (error) {
    console.error('Error publishing pin:', error);
    $w('#errorMessage').text = error.message;
    $w('#errorBox').show();
  }
}

async function schedulePin() {
  try {
    const pinData = await createPinData();

    // Create pin
    const createResponse = await fetch('/_functions/pins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pinData)
    });

    const pin = await createResponse.json();

    // Get scheduled time from date picker
    const scheduledTime = $w('#schedulePicker').value;

    // Schedule pin
    await fetch('/_functions/pinsSchedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pinId: pin._id,
        scheduledTime: scheduledTime.toISOString()
      })
    });

    wixWindow.lightbox.close({ success: true, action: 'scheduled' });
  } catch (error) {
    console.error('Error scheduling pin:', error);
    $w('#errorMessage').text = error.message;
    $w('#errorBox').show();
  }
}

async function addToQueue() {
  try {
    const pinData = await createPinData();

    // Create pin
    const createResponse = await fetch('/_functions/pins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pinData)
    });

    const pin = await createResponse.json();

    // Add to queue (auto-schedule)
    await fetch('/_functions/addToQueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pinIds: [pin._id],
        pinterestAccountId: pinData.pinterestAccountId
      })
    });

    wixWindow.lightbox.close({ success: true, action: 'queued' });
  } catch (error) {
    console.error('Error adding to queue:', error);
    $w('#errorMessage').text = error.message;
    $w('#errorBox').show();
  }
}

async function saveDraft() {
  try {
    const pinData = await createPinData();

    await fetch('/_functions/pins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pinData)
    });

    wixWindow.lightbox.close({ success: true, action: 'draft' });
  } catch (error) {
    console.error('Error saving draft:', error);
  }
}
```

## Key Features Implementation

### 1. OAuth Connection Flow

```javascript
// Step 1: User clicks "Connect Pinterest"
// Step 2: Backend generates authorization URL
// Step 3: User is redirected to Pinterest to authorize
// Step 4: Pinterest redirects back with code
// Step 5: Backend exchanges code for access token
// Step 6: Account details are fetched and stored
```

### 2. Smart Scheduling

- Analyzes when pins get most engagement
- Suggests optimal posting times
- Auto-schedules pins to best times
- Spreads pins evenly across schedule

### 3. Queue Management

- Add pins to queue without specific times
- System auto-assigns based on schedule
- Rebalance queue to optimize posting times

### 4. Analytics Dashboard

- Daily impressions, saves, clicks
- Engagement rate trends
- Top performing pins and boards
- Growth metrics

### 5. Automation

**RSS Auto-Pinning:**
- Fetch latest posts from blog RSS
- Auto-create pins with images
- Schedule or queue automatically

**Repinning:**
- Identify old high-performing content
- Recreate as new pins
- Rotate across boards

## Success Metrics

- Pinterest account connection rate
- Pins published per user
- Average engagement rate improvement
- Time saved vs manual Pinterest management

## Next Steps

1. **Create UI in Wix Editor**
2. **Upload Backend Services**
3. **Configure OAuth**
4. **Test End-to-End**
5. **Deploy**

---

**Pinterest Integration provides complete Pinterest management within dAItaniverse!** 📌
