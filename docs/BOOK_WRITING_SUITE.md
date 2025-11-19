# Book Writing Suite - Implementation Guide

## Overview

The Book Writing Suite is a comprehensive premium add-on (£10/month) for The dAItaniverse platform that helps authors plan, write, analyze, and publish their books. It supports both FICTION and NON-FICTION authors with specialized tools for each.

**Goal:** Replace Scrivener + Atticus + Plottr + multiple writing tools with one integrated suite.

## Architecture

### Database Collections

16 Wix Data Collections have been created to support the Book Writing Suite:

#### Core Collections:
1. **BookProjects** - Main book project data
2. **Chapters** - Chapter content and metadata
3. **Scenes** - Scene-level organization (fiction)
4. **WritingSessions** - Writing session tracking

#### Fiction Tools:
5. **Characters** - Character profiles and development
6. **WorldBuilding** - World-building elements
7. **PlotThreads** - Plot and subplot tracking
8. **Timelines** - Story chronology

#### Non-Fiction Tools:
9. **ResearchItems** - Research organization
10. **CaseStudies** - Case study tracking
11. **ExpertInterviews** - Interview management
12. **BookProposals** - Book proposal builder

#### Publishing Tools:
13. **QueryLetters** - Query letter versions
14. **AgentPublishers** - Agent/publisher contacts
15. **PublishingChecklists** - Publishing task tracking

#### Planning Tools:
16. **MindMapNodes** - Mind mapping and brainstorming

### Backend Services

8 comprehensive service files have been created in `/src/services/`:

1. **bookProjectService.js** - Project management, word count tracking, statistics
2. **chapterService.js** - Chapter and scene management
3. **characterService.js** - Character development and relationship mapping
4. **fictionToolsService.js** - World building, plot threads, timelines
5. **nonFictionToolsService.js** - Research, case studies, expert interviews, proposals
6. **writingSessionService.js** - Session tracking, productivity analytics
7. **publishingService.js** - Query letters, agent tracking, publishing checklists
8. **mindMapService.js** - Mind mapping and brainstorming

## Setup Instructions

### Phase 1: Database Setup (Wix Data Collections)

1. **Create Collections in Wix:**
   - Go to Database > + New Collection
   - Create each collection using the JSON schema files in `/schema/`
   - For each collection, manually add the fields as defined in the schema

2. **Set Permissions:**
   - Read: Anyone (logged in users)
   - Write: Author (collection owner)
   - Delete: Author (collection owner)

3. **Create Indexes:**
   - For each collection, add the indexes specified in the schema file
   - This improves query performance

### Phase 2: Backend Services Integration

1. **Upload Service Files:**
   ```
   Copy all files from /src/services/ to your Wix Backend folder:
   - Backend/bookWritingServices/bookProjectService.js
   - Backend/bookWritingServices/chapterService.js
   - Backend/bookWritingServices/characterService.js
   - Backend/bookWritingServices/fictionToolsService.js
   - Backend/bookWritingServices/nonFictionToolsService.js
   - Backend/bookWritingServices/writingSessionService.js
   - Backend/bookWritingServices/publishingService.js
   - Backend/bookWritingServices/mindMapService.js
   ```

2. **Create Backend API Endpoints:**

Create file: `Backend/http-functions.js`

```javascript
import { ok, notFound, serverError } from 'wix-http-functions';
import wixData from 'wix-data';
import * as bookProjectService from './bookWritingServices/bookProjectService';
import * as chapterService from './bookWritingServices/chapterService';
import * as characterService from './bookWritingServices/characterService';
// ... import other services

// Book Projects
export async function get_bookProjects(request) {
  try {
    const userId = request.user.id; // Get from Wix authentication
    const projects = await bookProjectService.getUserBookProjects(userId);
    return ok({ body: JSON.stringify(projects) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

export async function post_bookProjects(request) {
  try {
    const userId = request.user.id;
    const projectData = await request.body.json();
    projectData.userId = userId;
    const project = await bookProjectService.createBookProject(projectData);
    return ok({ body: JSON.stringify(project) });
  } catch (error) {
    return serverError({ body: error.message });
  }
}

// Add more endpoints for all other operations...
```

### Phase 3: Frontend Implementation

## Page Structure

### Main Pages

#### 1. Book Dashboard (`/books`)

**Purpose:** List all book projects, create new books

**Components:**
- Project cards grid
- "New Fiction Book" button
- "New Non-Fiction Book" button
- Filters (status, genre)
- Search bar

**Wix Editor Setup:**
```
Page: bookDashboard
Elements:
- #projectsRepeater (Repeater for book cards)
- #newFictionBtn (Button)
- #newNonFictionBtn (Button)
- #filterDropdown (Dropdown)
- #searchInput (Text Input)
```

**Page Code (`bookDashboard.js`):**
```javascript
import wixWindow from 'wix-window';
import { fetch } from 'wix-fetch';

$w.onReady(function () {
  loadBookProjects();

  $w('#newFictionBtn').onClick(() => {
    createNewBook('fiction');
  });

  $w('#newNonFictionBtn').onClick(() => {
    createNewBook('non_fiction');
  });
});

async function loadBookProjects() {
  try {
    const response = await fetch('/_functions/bookProjects', {
      method: 'GET'
    });
    const projects = await response.json();

    $w('#projectsRepeater').data = projects;
    $w('#projectsRepeater').onItemReady(($item, itemData) => {
      $item('#projectTitle').text = itemData.title;
      $item('#projectGenre').text = itemData.genre;
      $item('#wordCount').text = `${itemData.currentWordCount} / ${itemData.targetWordCount}`;
      $item('#progressBar').value = (itemData.currentWordCount / itemData.targetWordCount) * 100;
      $item('#statusBadge').text = itemData.status;

      $item('#viewBtn').onClick(() => {
        wixWindow.openLightbox('bookProjectView', {
          projectId: itemData._id
        });
      });
    });
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

async function createNewBook(genre) {
  const projectData = {
    title: 'Untitled Book',
    genre: genre,
    targetWordCount: 80000
  };

  try {
    const response = await fetch('/_functions/bookProjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });

    const newProject = await response.json();

    wixWindow.openLightbox('bookProjectView', {
      projectId: newProject._id
    });
  } catch (error) {
    console.error('Error creating book:', error);
  }
}
```

#### 2. Book Project View (`/books/:id`)

**Purpose:** Main workspace for a book project

**Lightbox:** bookProjectView

**Components:**
- Top bar (title, word count, status)
- Left sidebar navigation
- Main content area (changes based on selected view)

**Navigation Views:**
- Dashboard (overview)
- Mind Map
- Chapters
- Characters (fiction)
- World Building (fiction)
- Plot Threads (fiction)
- Research (non-fiction)
- Case Studies (non-fiction)
- Writing
- Analysis
- Publishing

**Lightbox Code (`bookProjectView.js`):**
```javascript
import wixWindow from 'wix-window';
import { fetch } from 'wix-fetch';

let currentProject = null;
let currentView = 'dashboard';

$w.onReady(async function () {
  const data = wixWindow.lightbox.getContext();
  const projectId = data.projectId;

  await loadProject(projectId);

  // Navigation handlers
  $w('#navDashboard').onClick(() => switchView('dashboard'));
  $w('#navMindMap').onClick(() => switchView('mindMap'));
  $w('#navChapters').onClick(() => switchView('chapters'));
  $w('#navCharacters').onClick(() => switchView('characters'));
  $w('#navWriting').onClick(() => switchView('writing'));
  // ... more navigation handlers
});

async function loadProject(projectId) {
  try {
    const response = await fetch(`/_functions/bookProjects/${projectId}`);
    currentProject = await response.json();

    // Update header
    $w('#bookTitle').text = currentProject.title;
    $w('#wordCountText').text = `${currentProject.currentWordCount} / ${currentProject.targetWordCount}`;
    $w('#progressBar').value = (currentProject.currentWordCount / currentProject.targetWordCount) * 100;
    $w('#statusDropdown').value = currentProject.status;
  } catch (error) {
    console.error('Error loading project:', error);
  }
}

function switchView(viewName) {
  currentView = viewName;

  // Hide all view containers
  $w('#dashboardView').hide();
  $w('#mindMapView').hide();
  $w('#chaptersView').hide();
  $w('#charactersView').hide();
  // ... hide others

  // Show selected view
  $w(`#${viewName}View`).show();

  // Load view-specific data
  switch (viewName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'mindMap':
      loadMindMap();
      break;
    case 'chapters':
      loadChapters();
      break;
    case 'characters':
      loadCharacters();
      break;
    // ... other cases
  }
}

async function loadDashboard() {
  try {
    const response = await fetch(`/_functions/bookProjects/${currentProject._id}/stats`);
    const stats = await response.json();

    $w('#totalChapters').text = stats.chapters.total.toString();
    $w('#chaptersComplete').text = stats.chapters.complete.toString();
    $w('#wordsLast30Days').text = stats.writingActivity.wordsLast30Days.toString();
    $w('#avgWordsPerDay').text = stats.writingActivity.avgWordsPerDay.toString();
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

async function loadChapters() {
  try {
    const response = await fetch(`/_functions/chapters?bookProjectId=${currentProject._id}`);
    const chapters = await response.json();

    $w('#chaptersRepeater').data = chapters;
    $w('#chaptersRepeater').onItemReady(($item, itemData) => {
      $item('#chapterNumber').text = `Chapter ${itemData.chapterNumber}`;
      $item('#chapterTitle').text = itemData.title;
      $item('#chapterWordCount').text = `${itemData.wordCount} words`;
      $item('#chapterStatus').text = itemData.status;

      $item('#editChapterBtn').onClick(() => {
        openChapterEditor(itemData._id);
      });
    });
  } catch (error) {
    console.error('Error loading chapters:', error);
  }
}

async function loadCharacters() {
  try {
    const response = await fetch(`/_functions/characters?bookProjectId=${currentProject._id}`);
    const characters = await response.json();

    $w('#charactersRepeater').data = characters;
    $w('#charactersRepeater').onItemReady(($item, itemData) => {
      $item('#characterName').text = itemData.name;
      $item('#characterRole').text = itemData.role;
      if (itemData.imageUrl) {
        $item('#characterImage').src = itemData.imageUrl;
      }

      $item('#viewCharacterBtn').onClick(() => {
        openCharacterProfile(itemData._id);
      });
    });
  } catch (error) {
    console.error('Error loading characters:', error);
  }
}

function openChapterEditor(chapterId) {
  wixWindow.openLightbox('chapterEditor', {
    chapterId,
    projectId: currentProject._id
  });
}

function openCharacterProfile(characterId) {
  wixWindow.openLightbox('characterProfile', {
    characterId,
    projectId: currentProject._id
  });
}
```

#### 3. Distraction-Free Writing Mode

**Lightbox:** writingMode

**Features:**
- Full-screen editor
- Minimal UI
- Word count at bottom
- Auto-save every 30 seconds
- Focus timer (Pomodoro)

**Code (`writingMode.js`):**
```javascript
import wixWindow from 'wix-window';
import { fetch } from 'wix-fetch';

let currentChapter = null;
let autosaveTimer = null;
let sessionStartTime = null;
let initialWordCount = 0;

$w.onReady(async function () {
  const data = wixWindow.lightbox.getContext();
  const chapterId = data.chapterId;

  await loadChapter(chapterId);
  startWritingSession();
  startAutosave();

  $w('#editor').onChange(() => {
    updateWordCount();
  });

  $w('#exitBtn').onClick(() => {
    endSession();
  });
});

async function loadChapter(chapterId) {
  try {
    const response = await fetch(`/_functions/chapters/${chapterId}`);
    currentChapter = await response.json();

    $w('#editor').value = currentChapter.content || '';
    initialWordCount = currentChapter.wordCount || 0;
    updateWordCount();
  } catch (error) {
    console.error('Error loading chapter:', error);
  }
}

function updateWordCount() {
  const text = $w('#editor').value;
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  $w('#wordCountText').text = `${words} words`;

  // Show words written this session
  const wordsThisSession = words - initialWordCount;
  $w('#sessionWords').text = `+${wordsThisSession} today`;
}

function startAutosave() {
  autosaveTimer = setInterval(async () => {
    await saveChapter();
  }, 30000); // Every 30 seconds
}

async function saveChapter() {
  const content = $w('#editor').value;

  try {
    await fetch(`/_functions/chapters/${currentChapter._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
  } catch (error) {
    console.error('Error saving chapter:', error);
  }
}

async function startWritingSession() {
  sessionStartTime = new Date();

  try {
    const response = await fetch('/_functions/writingSessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookProjectId: currentChapter.bookProjectId,
        chapterId: currentChapter._id,
        startTime: sessionStartTime
      })
    });
  } catch (error) {
    console.error('Error starting session:', error);
  }
}

async function endSession() {
  clearInterval(autosaveTimer);
  await saveChapter();

  // Log session
  const endTime = new Date();
  const currentWordCount = $w('#editor').value.trim().split(/\s+/).length;
  const wordsWritten = currentWordCount - initialWordCount;

  try {
    await fetch('/_functions/writingSessions/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endTime,
        wordsWritten
      })
    });
  } catch (error) {
    console.error('Error ending session:', error);
  }

  wixWindow.lightbox.close();
}
```

#### 4. Mind Map Interface

**Page:** mindMap (or lightbox)

**Features:**
- Drag-and-drop nodes
- Visual canvas
- Color-coded nodes
- Connection lines

**Implementation:**
Use a third-party library like:
- **vis.js** - Network visualization
- **Cytoscape.js** - Graph visualization
- **D3.js** - Custom visualization

**Example with vis.js:**
```javascript
import wixWindow from 'wix-window';
import { fetch } from 'wix-fetch';
// Import vis.js via Custom Code in Wix

let network = null;
let currentProjectId = null;

$w.onReady(async function () {
  const data = wixWindow.lightbox.getContext();
  currentProjectId = data.projectId;

  await loadMindMap();

  $w('#addNodeBtn').onClick(() => {
    addNode();
  });
});

async function loadMindMap() {
  try {
    const response = await fetch(`/_functions/mindMap/${currentProjectId}/visualization`);
    const data = await response.json();

    // Create vis.js network
    const container = document.getElementById('mindMapCanvas');

    const visData = {
      nodes: data.nodes.map(node => ({
        id: node.id,
        label: node.content,
        color: node.color,
        x: node.position.x,
        y: node.position.y
      })),
      edges: data.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        arrows: 'to'
      }))
    };

    const options = {
      physics: false,
      manipulation: {
        enabled: true
      }
    };

    network = new vis.Network(container, visData, options);

    // Handle node dragging
    network.on('dragEnd', async (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const position = network.getPositions([nodeId])[nodeId];

        await updateNodePosition(nodeId, position);
      }
    });
  } catch (error) {
    console.error('Error loading mind map:', error);
  }
}

async function updateNodePosition(nodeId, position) {
  try {
    await fetch(`/_functions/mindMap/nodes/${nodeId}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position })
    });
  } catch (error) {
    console.error('Error updating position:', error);
  }
}
```

## Key Features Implementation

### 1. Word Count Tracking

Automatically calculated when content is saved:

```javascript
function countWords(text) {
  if (!text) return 0;
  const plainText = text.replace(/<[^>]*>/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}
```

### 2. Writing Streak Calculation

Implemented in `bookProjectService.getWritingStreak()`:
- Tracks consecutive days of writing
- Shows current streak
- Shows longest streak
- Calendar heatmap visualization

### 3. Plot Hole Detection

Analyze story elements for consistency:
- Character appearance changes
- Timeline conflicts
- Unresolved plot threads

### 4. Publishing Readiness

Calculate completion percentage of publishing checklist:
- 90%+ = ready to publish
- Shows remaining tasks

## Premium Subscription Management

### Wix Paid Plans Integration

1. **Create Paid Plan:**
   - Go to Wix Dashboard > Paid Plans
   - Create "Book Writing Suite" plan at £10/month
   - Set benefits and features

2. **Check Access in Code:**

```javascript
import { plans } from 'wix-pricing-plans-backend';

async function checkBookWritingSuiteAccess(userId) {
  try {
    const memberPlans = await plans.getCurrentMemberOrders();

    const hasAccess = memberPlans.some(plan =>
      plan.planName === 'Book Writing Suite' &&
      plan.status === 'ACTIVE'
    );

    return hasAccess;
  } catch (error) {
    console.error('Error checking access:', error);
    return false;
  }
}

// Use in pages
$w.onReady(async function () {
  const hasAccess = await checkBookWritingSuiteAccess();

  if (!hasAccess) {
    // Show upgrade prompt
    wixWindow.openLightbox('upgradePrompt');
    return;
  }

  // Continue with normal page functionality
});
```

## Testing Checklist

- [ ] Can create new book projects (fiction and non-fiction)
- [ ] Can create and edit chapters
- [ ] Can create and manage characters
- [ ] Word count updates automatically
- [ ] Writing sessions are tracked
- [ ] Mind map nodes can be created and connected
- [ ] Research items can be organized
- [ ] Query letters can be generated
- [ ] Publishing checklist works
- [ ] Premium subscription check works
- [ ] Data persists correctly in Wix Data Collections

## Next Steps

1. **Design UI in Wix Editor** - Create all pages and lightboxes
2. **Upload Backend Services** - Copy service files to Wix Backend
3. **Create HTTP Functions** - Set up API endpoints
4. **Implement Frontend Code** - Add page code for all views
5. **Test Thoroughly** - Verify all functionality works
6. **Add Premium Gate** - Integrate with Wix Paid Plans
7. **Deploy to Production** - Publish site

## Support & Resources

- Wix Data Documentation: https://www.wix.com/velo/reference/wix-data
- Wix HTTP Functions: https://www.wix.com/velo/reference/wix-http-functions
- Wix Pricing Plans: https://www.wix.com/velo/reference/wix-pricing-plans-backend

---

**This comprehensive system replaces multiple expensive tools with one integrated platform, providing immense value to authors!**
