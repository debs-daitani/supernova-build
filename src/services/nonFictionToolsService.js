/**
 * SUPERNova Book Writing Suite - Non-Fiction Tools Service
 *
 * Manages non-fiction specific tools:
 * - Research organization
 * - Case studies
 * - Expert interviews
 * - Book proposals
 * - Market research
 */

import wixData from 'wix-data';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  RESEARCH_ITEMS: 'ResearchItems',
  CASE_STUDIES: 'CaseStudies',
  EXPERT_INTERVIEWS: 'ExpertInterviews',
  BOOK_PROPOSALS: 'BookProposals'
};

// ============================================================================
// Research Operations
// ============================================================================

/**
 * Create research item
 * @param {Object} researchInput - Research data
 * @returns {Promise<Object>} Created research item
 */
export async function createResearchItem(researchInput) {
  try {
    const now = new Date();

    const research = {
      bookProjectId: researchInput.bookProjectId,
      category: researchInput.category,
      title: researchInput.title,
      content: researchInput.content || '',
      source: researchInput.source || '',
      url: researchInput.url || null,
      credibility: researchInput.credibility || 'medium',
      chapterIds: researchInput.chapterIds || [],
      tags: researchInput.tags || [],
      notes: researchInput.notes || '',
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.RESEARCH_ITEMS, research);
    return result;
  } catch (error) {
    console.error('Error creating research item:', error);
    throw new Error(`Failed to create research item: ${error.message}`);
  }
}

/**
 * Get research items for a project
 * @param {string} bookProjectId - Book project ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of research items
 */
export async function getResearchItems(bookProjectId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.RESEARCH_ITEMS)
      .eq('bookProjectId', bookProjectId);

    if (options.category) {
      query = query.eq('category', options.category);
    }

    if (options.credibility) {
      query = query.eq('credibility', options.credibility);
    }

    if (options.tag) {
      query = query.hasSome('tags', [options.tag]);
    }

    const results = await query
      .descending('createdAt')
      .limit(options.limit || 100)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting research items:', error);
    throw new Error(`Failed to get research items: ${error.message}`);
  }
}

/**
 * Update research item
 * @param {string} researchId - Research ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated research item
 */
export async function updateResearchItem(researchId, updates) {
  try {
    const research = await wixData.get(COLLECTIONS.RESEARCH_ITEMS, researchId);
    if (!research) {
      throw new Error('Research item not found');
    }

    const updatedResearch = {
      ...research,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.RESEARCH_ITEMS, updatedResearch);
    return result;
  } catch (error) {
    console.error('Error updating research item:', error);
    throw new Error(`Failed to update research item: ${error.message}`);
  }
}

/**
 * Delete research item
 * @param {string} researchId - Research ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteResearchItem(researchId) {
  try {
    await wixData.remove(COLLECTIONS.RESEARCH_ITEMS, researchId);
    return true;
  } catch (error) {
    console.error('Error deleting research item:', error);
    throw new Error(`Failed to delete research item: ${error.message}`);
  }
}

/**
 * Search research items
 * @param {string} bookProjectId - Book project ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Matching research items
 */
export async function searchResearch(bookProjectId, searchTerm) {
  try {
    const results = await wixData.query(COLLECTIONS.RESEARCH_ITEMS)
      .eq('bookProjectId', bookProjectId)
      .contains('title', searchTerm)
      .or(
        wixData.query(COLLECTIONS.RESEARCH_ITEMS).contains('content', searchTerm)
      )
      .find();

    return results.items;
  } catch (error) {
    console.error('Error searching research:', error);
    throw new Error(`Failed to search research: ${error.message}`);
  }
}

// ============================================================================
// Case Study Operations
// ============================================================================

/**
 * Create case study
 * @param {Object} caseStudyInput - Case study data
 * @returns {Promise<Object>} Created case study
 */
export async function createCaseStudy(caseStudyInput) {
  try {
    const now = new Date();

    const caseStudy = {
      bookProjectId: caseStudyInput.bookProjectId,
      subject: caseStudyInput.subject,
      problem: caseStudyInput.problem || '',
      solution: caseStudyInput.solution || '',
      results: caseStudyInput.results || '',
      quotes: caseStudyInput.quotes || [],
      dataPoints: caseStudyInput.dataPoints || [],
      lessons: caseStudyInput.lessons || '',
      chapterIds: caseStudyInput.chapterIds || [],
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.CASE_STUDIES, caseStudy);
    return result;
  } catch (error) {
    console.error('Error creating case study:', error);
    throw new Error(`Failed to create case study: ${error.message}`);
  }
}

/**
 * Get case studies for a project
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Array>} Array of case studies
 */
export async function getCaseStudies(bookProjectId) {
  try {
    const results = await wixData.query(COLLECTIONS.CASE_STUDIES)
      .eq('bookProjectId', bookProjectId)
      .descending('createdAt')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting case studies:', error);
    throw new Error(`Failed to get case studies: ${error.message}`);
  }
}

/**
 * Update case study
 * @param {string} caseStudyId - Case study ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated case study
 */
export async function updateCaseStudy(caseStudyId, updates) {
  try {
    const caseStudy = await wixData.get(COLLECTIONS.CASE_STUDIES, caseStudyId);
    if (!caseStudy) {
      throw new Error('Case study not found');
    }

    const updatedCaseStudy = {
      ...caseStudy,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.CASE_STUDIES, updatedCaseStudy);
    return result;
  } catch (error) {
    console.error('Error updating case study:', error);
    throw new Error(`Failed to update case study: ${error.message}`);
  }
}

/**
 * Delete case study
 * @param {string} caseStudyId - Case study ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCaseStudy(caseStudyId) {
  try {
    await wixData.remove(COLLECTIONS.CASE_STUDIES, caseStudyId);
    return true;
  } catch (error) {
    console.error('Error deleting case study:', error);
    throw new Error(`Failed to delete case study: ${error.message}`);
  }
}

// ============================================================================
// Expert Interview Operations
// ============================================================================

/**
 * Create expert interview
 * @param {Object} interviewInput - Interview data
 * @returns {Promise<Object>} Created interview
 */
export async function createExpertInterview(interviewInput) {
  try {
    const now = new Date();

    const interview = {
      bookProjectId: interviewInput.bookProjectId,
      expertName: interviewInput.expertName,
      expertise: interviewInput.expertise || '',
      credentials: interviewInput.credentials || '',
      interviewDate: interviewInput.interviewDate || null,
      questions: interviewInput.questions || [],
      answers: interviewInput.answers || [],
      keyQuotes: interviewInput.keyQuotes || [],
      usageNotes: interviewInput.usageNotes || '',
      chapterIds: interviewInput.chapterIds || [],
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.EXPERT_INTERVIEWS, interview);
    return result;
  } catch (error) {
    console.error('Error creating expert interview:', error);
    throw new Error(`Failed to create expert interview: ${error.message}`);
  }
}

/**
 * Get expert interviews for a project
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Array>} Array of expert interviews
 */
export async function getExpertInterviews(bookProjectId) {
  try {
    const results = await wixData.query(COLLECTIONS.EXPERT_INTERVIEWS)
      .eq('bookProjectId', bookProjectId)
      .descending('interviewDate')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting expert interviews:', error);
    throw new Error(`Failed to get expert interviews: ${error.message}`);
  }
}

/**
 * Update expert interview
 * @param {string} interviewId - Interview ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated interview
 */
export async function updateExpertInterview(interviewId, updates) {
  try {
    const interview = await wixData.get(COLLECTIONS.EXPERT_INTERVIEWS, interviewId);
    if (!interview) {
      throw new Error('Expert interview not found');
    }

    const updatedInterview = {
      ...interview,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.EXPERT_INTERVIEWS, updatedInterview);
    return result;
  } catch (error) {
    console.error('Error updating expert interview:', error);
    throw new Error(`Failed to update expert interview: ${error.message}`);
  }
}

/**
 * Delete expert interview
 * @param {string} interviewId - Interview ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteExpertInterview(interviewId) {
  try {
    await wixData.remove(COLLECTIONS.EXPERT_INTERVIEWS, interviewId);
    return true;
  } catch (error) {
    console.error('Error deleting expert interview:', error);
    throw new Error(`Failed to delete expert interview: ${error.message}`);
  }
}

// ============================================================================
// Book Proposal Operations
// ============================================================================

/**
 * Create or update book proposal
 * @param {Object} proposalInput - Proposal data
 * @returns {Promise<Object>} Created/updated proposal
 */
export async function saveBookProposal(proposalInput) {
  try {
    const now = new Date();

    // Check if proposal already exists for this book
    const existingProposal = await wixData.query(COLLECTIONS.BOOK_PROPOSALS)
      .eq('bookProjectId', proposalInput.bookProjectId)
      .find();

    if (existingProposal.items.length > 0) {
      // Update existing
      const proposal = existingProposal.items[0];
      const updatedProposal = {
        ...proposal,
        ...proposalInput,
        updatedAt: now
      };
      return await wixData.update(COLLECTIONS.BOOK_PROPOSALS, updatedProposal);
    } else {
      // Create new
      const proposal = {
        bookProjectId: proposalInput.bookProjectId,
        hook: proposalInput.hook || '',
        marketAnalysis: proposalInput.marketAnalysis || '',
        targetAudience: proposalInput.targetAudience || '',
        competitorAnalysis: proposalInput.competitorAnalysis || '',
        authorBio: proposalInput.authorBio || '',
        platformStats: proposalInput.platformStats || {},
        chapterOutline: proposalInput.chapterOutline || [],
        sampleChapters: proposalInput.sampleChapters || [],
        marketingPlan: proposalInput.marketingPlan || '',
        status: proposalInput.status || 'draft',
        createdAt: now,
        updatedAt: now
      };

      return await wixData.insert(COLLECTIONS.BOOK_PROPOSALS, proposal);
    }
  } catch (error) {
    console.error('Error saving book proposal:', error);
    throw new Error(`Failed to save book proposal: ${error.message}`);
  }
}

/**
 * Get book proposal
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Object|null>} Book proposal or null
 */
export async function getBookProposal(bookProjectId) {
  try {
    const results = await wixData.query(COLLECTIONS.BOOK_PROPOSALS)
      .eq('bookProjectId', bookProjectId)
      .find();

    return results.items.length > 0 ? results.items[0] : null;
  } catch (error) {
    console.error('Error getting book proposal:', error);
    throw new Error(`Failed to get book proposal: ${error.message}`);
  }
}

/**
 * Delete book proposal
 * @param {string} proposalId - Proposal ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteBookProposal(proposalId) {
  try {
    await wixData.remove(COLLECTIONS.BOOK_PROPOSALS, proposalId);
    return true;
  } catch (error) {
    console.error('Error deleting book proposal:', error);
    throw new Error(`Failed to delete book proposal: ${error.message}`);
  }
}

/**
 * Generate book proposal from project data
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Object>} Generated proposal template
 */
export async function generateProposalTemplate(bookProjectId) {
  try {
    // Get book project
    const project = await wixData.get('BookProjects', bookProjectId);
    if (!project) {
      throw new Error('Book project not found');
    }

    // Get chapters for outline
    const chapters = await wixData.query('Chapters')
      .eq('bookProjectId', bookProjectId)
      .ascending('chapterNumber')
      .find();

    const chapterOutline = chapters.items.map(chapter => ({
      number: chapter.chapterNumber,
      title: chapter.title,
      synopsis: chapter.synopsis || 'Synopsis to be written...'
    }));

    // Create proposal template
    const proposalTemplate = {
      bookProjectId,
      hook: project.elevatorPitch || 'Compelling hook to be written...',
      marketAnalysis: `Target Market: ${project.targetAudience || 'To be defined...'}`,
      targetAudience: project.targetAudience || 'To be defined...',
      competitorAnalysis: 'Competitor analysis to be completed...',
      authorBio: 'Author biography to be written...',
      platformStats: {
        emailList: 0,
        socialMedia: {},
        websiteTraffic: 0
      },
      chapterOutline,
      sampleChapters: [],
      marketingPlan: 'Marketing plan to be developed...',
      status: 'draft'
    };

    return proposalTemplate;
  } catch (error) {
    console.error('Error generating proposal template:', error);
    throw new Error(`Failed to generate proposal: ${error.message}`);
  }
}

export default {
  // Research
  createResearchItem,
  getResearchItems,
  updateResearchItem,
  deleteResearchItem,
  searchResearch,
  // Case Studies
  createCaseStudy,
  getCaseStudies,
  updateCaseStudy,
  deleteCaseStudy,
  // Expert Interviews
  createExpertInterview,
  getExpertInterviews,
  updateExpertInterview,
  deleteExpertInterview,
  // Book Proposals
  saveBookProposal,
  getBookProposal,
  deleteBookProposal,
  generateProposalTemplate
};
