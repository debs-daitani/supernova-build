/**
 * SUPERNova Book Writing Suite - Complete Implementation Example
 *
 * This file demonstrates how to integrate the Book Writing Suite
 * into your Wix site with complete examples for all major features.
 */

import wixWindow from 'wix-window';
import { fetch } from 'wix-fetch';
import wixData from 'wix-data';

// ============================================================================
// BOOK DASHBOARD PAGE
// ============================================================================

/**
 * Book Dashboard - Main entry point
 * Page: /books
 */
export async function bookDashboard_onReady() {
  // Check premium access
  const hasAccess = await checkBookWritingSuiteAccess();
  if (!hasAccess) {
    $w('#upgradeBox').show();
    $w('#mainContent').hide();
    return;
  }

  // Load user's book projects
  await loadBookProjects();

  // Setup event handlers
  $w('#newFictionBtn').onClick(() => createNewBook('fiction'));
  $w('#newNonFictionBtn').onClick(() => createNewBook('non_fiction'));
  $w('#searchInput').onInput(() => filterProjects());
  $w('#filterDropdown').onChange(() => filterProjects());
}

async function loadBookProjects() {
  try {
    const response = await fetch('/_functions/bookProjects', {
      method: 'GET'
    });

    const projects = await response.json();

    // Bind to repeater
    $w('#projectsRepeater').data = projects;

    $w('#projectsRepeater').onItemReady(($item, itemData) => {
      // Set project data
      $item('#projectTitle').text = itemData.title;
      $item('#projectGenre').text = itemData.genre.toUpperCase();
      $item('#projectStatus').text = itemData.status;

      // Word count progress
      const progress = (itemData.currentWordCount / itemData.targetWordCount) * 100;
      $item('#wordCountText').text = `${itemData.currentWordCount} / ${itemData.targetWordCount}`;
      $item('#progressBar').value = progress;

      // Cover image
      if (itemData.coverImageUrl) {
        $item('#coverImage').src = itemData.coverImageUrl;
      }

      // Days writing
      const daysWriting = Math.floor(
        (new Date() - new Date(itemData.startedAt)) / (1000 * 60 * 60 * 24)
      );
      $item('#daysWriting').text = `${daysWriting} days`;

      // View project button
      $item('#viewProjectBtn').onClick(() => {
        wixWindow.openLightbox('bookProjectView', {
          projectId: itemData._id
        });
      });

      // Delete button
      $item('#deleteBtn').onClick(async () => {
        if (confirm('Delete this book project? This cannot be undone.')) {
          await deleteProject(itemData._id);
        }
      });
    });

    // Show empty state if no projects
    if (projects.length === 0) {
      $w('#emptyState').show();
      $w('#projectsRepeater').hide();
    } else {
      $w('#emptyState').hide();
      $w('#projectsRepeater').show();
    }
  } catch (error) {
    console.error('Error loading projects:', error);
    $w('#errorMessage').text = 'Failed to load projects';
    $w('#errorBox').show();
  }
}

async function createNewBook(genre) {
  wixWindow.openLightbox('newBookWizard', { genre });
}

async function deleteProject(projectId) {
  try {
    await fetch(`/_functions/bookProjects/${projectId}`, {
      method: 'DELETE'
    });

    // Reload projects
    await loadBookProjects();
  } catch (error) {
    console.error('Error deleting project:', error);
  }
}

function filterProjects() {
  const searchTerm = $w('#searchInput').value.toLowerCase();
  const filterStatus = $w('#filterDropdown').value;

  $w('#projectsRepeater').forEachItem(($item, itemData) => {
    let show = true;

    // Search filter
    if (searchTerm && !itemData.title.toLowerCase().includes(searchTerm)) {
      show = false;
    }

    // Status filter
    if (filterStatus !== 'all' && itemData.status !== filterStatus) {
      show = false;
    }

    $item.show(show);
  });
}

// ============================================================================
// BOOK PROJECT VIEW (LIGHTBOX)
// ============================================================================

/**
 * Book Project View - Main workspace
 * Lightbox: bookProjectView
 */
let currentProject = null;
let currentView = 'dashboard';

export async function bookProjectView_onReady() {
  const context = wixWindow.lightbox.getContext();
  const projectId = context.projectId;

  // Load project data
  await loadProject(projectId);

  // Setup navigation
  setupNavigation();

  // Load default view
  switchView('dashboard');
}

async function loadProject(projectId) {
  try {
    const response = await fetch(`/_functions/bookProjects/${projectId}`);
    currentProject = await response.json();

    // Update header
    $w('#bookTitleInput').value = currentProject.title;
    $w('#bookSubtitle').text = currentProject.subtitle || '';
    $w('#wordCountDisplay').text = `${currentProject.currentWordCount} / ${currentProject.targetWordCount}`;
    $w('#progressBar').value = (currentProject.currentWordCount / currentProject.targetWordCount) * 100;
    $w('#statusDropdown').value = currentProject.status;
    $w('#genreBadge').text = currentProject.genre;

    // Handle title editing
    $w('#bookTitleInput').onChange(async () => {
      await updateProject({ title: $w('#bookTitleInput').value });
    });

    // Handle status change
    $w('#statusDropdown').onChange(async () => {
      await updateProject({ status: $w('#statusDropdown').value });
    });
  } catch (error) {
    console.error('Error loading project:', error);
  }
}

async function updateProject(updates) {
  try {
    await fetch(`/_functions/bookProjects/${currentProject._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    // Refresh project data
    await loadProject(currentProject._id);
  } catch (error) {
    console.error('Error updating project:', error);
  }
}

function setupNavigation() {
  $w('#navDashboard').onClick(() => switchView('dashboard'));
  $w('#navMindMap').onClick(() => switchView('mindMap'));
  $w('#navStructure').onClick(() => switchView('structure'));
  $w('#navChapters').onClick(() => switchView('chapters'));
  $w('#navWriting').onClick(() => switchView('writing'));

  // Fiction-specific navigation
  if (currentProject.genre === 'fiction') {
    $w('#navCharacters').show();
    $w('#navWorldBuilding').show();
    $w('#navPlotThreads').show();
    $w('#navTimeline').show();

    $w('#navCharacters').onClick(() => switchView('characters'));
    $w('#navWorldBuilding').onClick(() => switchView('worldBuilding'));
    $w('#navPlotThreads').onClick(() => switchView('plotThreads'));
    $w('#navTimeline').onClick(() => switchView('timeline'));
  } else {
    // Hide fiction tools for non-fiction
    $w('#navCharacters').hide();
    $w('#navWorldBuilding').hide();
    $w('#navPlotThreads').hide();
    $w('#navTimeline').hide();
  }

  // Non-fiction specific navigation
  if (currentProject.genre === 'non_fiction' || currentProject.genre === 'business' || currentProject.genre === 'self_help') {
    $w('#navResearch').show();
    $w('#navCaseStudies').show();
    $w('#navProposal').show();

    $w('#navResearch').onClick(() => switchView('research'));
    $w('#navCaseStudies').onClick(() => switchView('caseStudies'));
    $w('#navProposal').onClick(() => switchView('proposal'));
  } else {
    // Hide non-fiction tools for fiction
    $w('#navResearch').hide();
    $w('#navCaseStudies').hide();
    $w('#navProposal').hide();
  }

  // Common navigation
  $w('#navAnalysis').onClick(() => switchView('analysis'));
  $w('#navPublishing').onClick(() => switchView('publishing'));
}

function switchView(viewName) {
  currentView = viewName;

  // Hide all views
  $w('#dashboardView').hide();
  $w('#mindMapView').hide();
  $w('#structureView').hide();
  $w('#chaptersView').hide();
  $w('#charactersView').hide();
  $w('#worldBuildingView').hide();
  $w('#plotThreadsView').hide();
  $w('#timelineView').hide();
  $w('#researchView').hide();
  $w('#caseStudiesView').hide();
  $w('#proposalView').hide();
  $w('#writingView').hide();
  $w('#analysisView').hide();
  $w('#publishingView').hide();

  // Show selected view
  $w(`#${viewName}View`).show();

  // Update active nav item
  $w('#navDashboard').style.backgroundColor = viewName === 'dashboard' ? '#E5E7EB' : 'transparent';
  $w('#navMindMap').style.backgroundColor = viewName === 'mindMap' ? '#E5E7EB' : 'transparent';
  // ... update all nav items

  // Load view-specific data
  loadViewData(viewName);
}

async function loadViewData(viewName) {
  switch (viewName) {
    case 'dashboard':
      await loadDashboardView();
      break;
    case 'chapters':
      await loadChaptersView();
      break;
    case 'characters':
      await loadCharactersView();
      break;
    case 'writing':
      loadWritingView();
      break;
    case 'analysis':
      await loadAnalysisView();
      break;
    // Add other views...
  }
}

// ============================================================================
// DASHBOARD VIEW
// ============================================================================

async function loadDashboardView() {
  try {
    // Get project statistics
    const response = await fetch(`/_functions/bookProjects/${currentProject._id}/stats`);
    const stats = await response.json();

    // Display statistics
    $w('#statTotalChapters').text = stats.chapters.total.toString();
    $w('#statOutline').text = stats.chapters.outline.toString();
    $w('#statDraft').text = stats.chapters.draft.toString();
    $w('#statRevision').text = stats.chapters.revision.toString();
    $w('#statComplete').text = stats.chapters.complete.toString();

    $w('#statWordsLast30Days').text = stats.writingActivity.wordsLast30Days.toLocaleString();
    $w('#statAvgWordsPerDay').text = stats.writingActivity.avgWordsPerDay.toString();
    $w('#statSessionsLast30Days').text = stats.writingActivity.sessionsLast30Days.toString();

    // Completion percentage
    $w('#completionPercentage').text = `${stats.project.completionPercentage}%`;
    $w('#completionBar').value = stats.project.completionPercentage;

    // Days to completion estimate
    if (stats.writingActivity.daysToCompletion) {
      $w('#estimatedCompletion').text = `${stats.writingActivity.daysToCompletion} days`;
    } else {
      $w('#estimatedCompletion').text = 'Not enough data';
    }

    // Get writing streak
    const streakResponse = await fetch(`/_functions/bookProjects/${currentProject._id}/streak`);
    const streak = await streakResponse.json();

    $w('#currentStreak').text = streak.currentStreak.toString();
    $w('#longestStreak').text = streak.longestStreak.toString();
    $w('#totalDaysWritten').text = streak.totalDaysWritten.toString();

    // Show streak fire emoji if streak > 0
    if (streak.currentStreak > 0) {
      $w('#streakEmoji').text = '🔥';
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// ============================================================================
// CHAPTERS VIEW
// ============================================================================

async function loadChaptersView() {
  try {
    const response = await fetch(`/_functions/chapters?bookProjectId=${currentProject._id}`);
    const chapters = await response.json();

    $w('#chaptersRepeater').data = chapters;

    $w('#chaptersRepeater').onItemReady(($item, itemData) => {
      $item('#chapterNumber').text = `Chapter ${itemData.chapterNumber}`;
      $item('#chapterTitle').text = itemData.title;
      $item('#chapterWordCount').text = `${itemData.wordCount} words`;
      $item('#chapterStatus').text = itemData.status;

      // Progress bar
      if (itemData.targetWordCount) {
        const progress = (itemData.wordCount / itemData.targetWordCount) * 100;
        $item('#chapterProgress').value = progress;
        $item('#chapterProgress').show();
      } else {
        $item('#chapterProgress').hide();
      }

      // Status color
      const statusColors = {
        'outline': '#9CA3AF',
        'draft': '#3B82F6',
        'revision': '#F59E0B',
        'complete': '#10B981'
      };
      $item('#statusBadge').style.backgroundColor = statusColors[itemData.status] || '#9CA3AF';

      // Edit button
      $item('#editBtn').onClick(() => {
        wixWindow.openLightbox('chapterEditor', {
          chapterId: itemData._id,
          projectId: currentProject._id
        });
      });

      // Quick write button
      $item('#writeBtn').onClick(() => {
        wixWindow.openLightbox('writingMode', {
          chapterId: itemData._id,
          projectId: currentProject._id
        });
      });
    });

    // Add chapter button
    $w('#addChapterBtn').onClick(async () => {
      const nextChapterNumber = chapters.length + 1;

      const newChapter = {
        bookProjectId: currentProject._id,
        chapterNumber: nextChapterNumber,
        title: `Chapter ${nextChapterNumber}`,
        status: 'outline'
      };

      try {
        await fetch('/_functions/chapters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newChapter)
        });

        // Reload chapters
        await loadChaptersView();
      } catch (error) {
        console.error('Error creating chapter:', error);
      }
    });
  } catch (error) {
    console.error('Error loading chapters:', error);
  }
}

// ============================================================================
// CHARACTERS VIEW (Fiction)
// ============================================================================

async function loadCharactersView() {
  try {
    const response = await fetch(`/_functions/characters?bookProjectId=${currentProject._id}`);
    const characters = await response.json();

    $w('#charactersRepeater').data = characters;

    $w('#charactersRepeater').onItemReady(($item, itemData) => {
      $item('#characterName').text = itemData.name;
      $item('#characterRole').text = itemData.role.toUpperCase();

      // Character image
      if (itemData.imageUrl) {
        $item('#characterImage').src = itemData.imageUrl;
      } else {
        $item('#characterImage').src = '/default-avatar.png';
      }

      // Role color
      const roleColors = {
        'protagonist': '#10B981',
        'antagonist': '#EF4444',
        'supporting': '#3B82F6',
        'minor': '#9CA3AF'
      };
      $item('#roleBadge').style.backgroundColor = roleColors[itemData.role] || '#9CA3AF';

      // View character button
      $item('#viewBtn').onClick(() => {
        wixWindow.openLightbox('characterProfile', {
          characterId: itemData._id,
          projectId: currentProject._id
        });
      });
    });

    // Add character button
    $w('#addCharacterBtn').onClick(() => {
      wixWindow.openLightbox('characterProfile', {
        characterId: 'new',
        projectId: currentProject._id
      });
    });

    // View relationship map button
    $w('#relationshipMapBtn').onClick(() => {
      wixWindow.openLightbox('relationshipMap', {
        projectId: currentProject._id
      });
    });
  } catch (error) {
    console.error('Error loading characters:', error);
  }
}

// ============================================================================
// WRITING VIEW (Start Session)
// ============================================================================

function loadWritingView() {
  $w('#startWritingBtn').onClick(() => {
    // Show chapter selection
    $w('#chapterSelector').show();

    // Load chapters for selection
    loadChapterSelector();
  });

  $w('#freeWriteBtn').onClick(() => {
    wixWindow.openLightbox('writingMode', {
      projectId: currentProject._id,
      chapterId: null
    });
  });

  // Load today's stats
  loadTodayWritingStats();
}

async function loadTodayWritingStats() {
  try {
    const response = await fetch(`/_functions/writingSessions/today?projectId=${currentProject._id}`);
    const stats = await response.json();

    $w('#todayWords').text = stats.totalWords.toLocaleString();
    $w('#todayMinutes').text = stats.totalMinutes.toString();
    $w('#todaySessions').text = stats.sessionsCount.toString();

    if (stats.goalMet) {
      $w('#goalStatus').text = '✓ Goal Met!';
      $w('#goalStatus').style.color = '#10B981';
    } else {
      $w('#goalStatus').text = 'Keep going!';
      $w('#goalStatus').style.color = '#9CA3AF';
    }
  } catch (error) {
    console.error('Error loading today stats:', error);
  }
}

// ============================================================================
// ANALYSIS VIEW
// ============================================================================

async function loadAnalysisView() {
  // Load plot hole analysis
  $w('#runPlotAnalysisBtn').onClick(async () => {
    $w('#loadingPlotAnalysis').show();

    try {
      const response = await fetch(`/_functions/analysis/plotHoles?projectId=${currentProject._id}`);
      const results = await response.json();

      $w('#loadingPlotAnalysis').hide();

      if (results.issues.length === 0) {
        $w('#plotAnalysisResults').text = '✓ No plot holes detected!';
      } else {
        let resultsText = `Found ${results.issues.length} potential issues:\n\n`;
        results.issues.forEach((issue, index) => {
          resultsText += `${index + 1}. ${issue.description} (${issue.severity})\n`;
        });
        $w('#plotAnalysisResults').text = resultsText;
      }
    } catch (error) {
      console.error('Error running plot analysis:', error);
      $w('#loadingPlotAnalysis').hide();
    }
  });

  // Load readability scores
  loadReadabilityScores();
}

async function loadReadabilityScores() {
  try {
    const response = await fetch(`/_functions/analysis/readability?projectId=${currentProject._id}`);
    const scores = await response.json();

    $w('#readingEase').text = scores.fleschReadingEase.toString();
    $w('#gradeLevel').text = scores.fleschKincaidGrade.toString();
    $w('#avgSentenceLength').text = scores.avgSentenceLength.toString();
    $w('#avgWordLength').text = scores.avgWordLength.toFixed(1);
  } catch (error) {
    console.error('Error loading readability:', error);
  }
}

// ============================================================================
// PREMIUM ACCESS CHECK
// ============================================================================

async function checkBookWritingSuiteAccess() {
  try {
    // Check if user has active Book Writing Suite subscription
    const response = await fetch('/_functions/checkPremiumAccess?feature=book-writing');
    const data = await response.json();

    return data.hasAccess;
  } catch (error) {
    console.error('Error checking access:', error);
    return false; // Fail closed
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

export {
  bookDashboard_onReady,
  bookProjectView_onReady,
  loadProject,
  loadChaptersView,
  loadCharactersView,
  checkBookWritingSuiteAccess
};
