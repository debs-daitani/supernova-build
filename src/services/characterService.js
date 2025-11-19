/**
 * SUPERNova Book Writing Suite - Character Service
 *
 * Manages character development for fiction books:
 * - Character profiles
 * - Character relationships
 * - Character arcs
 * - Voice and consistency tracking
 */

import wixData from 'wix-data';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  CHARACTERS: 'Characters',
  PLOT_THREADS: 'PlotThreads',
  WORLD_BUILDING: 'WorldBuilding'
};

// ============================================================================
// Character Operations
// ============================================================================

/**
 * Create a new character
 * @param {Object} characterInput - Character data
 * @returns {Promise<Object>} Created character
 */
export async function createCharacter(characterInput) {
  try {
    const now = new Date();

    const character = {
      bookProjectId: characterInput.bookProjectId,
      name: characterInput.name,
      role: characterInput.role || 'supporting',
      age: characterInput.age || '',
      occupation: characterInput.occupation || '',
      physicalDescription: characterInput.physicalDescription || '',
      personality: characterInput.personality || '',
      backstory: characterInput.backstory || '',
      motivation: characterInput.motivation || '',
      internalConflict: characterInput.internalConflict || '',
      externalConflict: characterInput.externalConflict || '',
      characterArc: characterInput.characterArc || '',
      relationships: characterInput.relationships || [],
      quirks: characterInput.quirks || '',
      strengths: characterInput.strengths || '',
      weaknesses: characterInput.weaknesses || '',
      voiceNotes: characterInput.voiceNotes || '',
      imageUrl: characterInput.imageUrl || null,
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.CHARACTERS, character);
    return result;
  } catch (error) {
    console.error('Error creating character:', error);
    throw new Error(`Failed to create character: ${error.message}`);
  }
}

/**
 * Get character by ID
 * @param {string} characterId - Character ID
 * @returns {Promise<Object|null>} Character object
 */
export async function getCharacter(characterId) {
  try {
    const character = await wixData.get(COLLECTIONS.CHARACTERS, characterId);
    return character;
  } catch (error) {
    console.error('Error getting character:', error);
    throw new Error(`Failed to get character: ${error.message}`);
  }
}

/**
 * Get all characters for a book project
 * @param {string} bookProjectId - Book project ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of characters
 */
export async function getProjectCharacters(bookProjectId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.CHARACTERS)
      .eq('bookProjectId', bookProjectId);

    if (options.role) {
      query = query.eq('role', options.role);
    }

    const results = await query
      .ascending('name')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting project characters:', error);
    throw new Error(`Failed to get characters: ${error.message}`);
  }
}

/**
 * Update character
 * @param {string} characterId - Character ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated character
 */
export async function updateCharacter(characterId, updates) {
  try {
    const character = await getCharacter(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const updatedCharacter = {
      ...character,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.CHARACTERS, updatedCharacter);
    return result;
  } catch (error) {
    console.error('Error updating character:', error);
    throw new Error(`Failed to update character: ${error.message}`);
  }
}

/**
 * Delete character
 * @param {string} characterId - Character ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCharacter(characterId) {
  try {
    await wixData.remove(COLLECTIONS.CHARACTERS, characterId);
    return true;
  } catch (error) {
    console.error('Error deleting character:', error);
    throw new Error(`Failed to delete character: ${error.message}`);
  }
}

/**
 * Add relationship between characters
 * @param {string} characterId - First character ID
 * @param {string} relatedCharacterId - Related character ID
 * @param {Object} relationshipData - Relationship details
 * @returns {Promise<Object>} Updated character
 */
export async function addCharacterRelationship(characterId, relatedCharacterId, relationshipData) {
  try {
    const character = await getCharacter(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const relationships = character.relationships || [];

    // Check if relationship already exists
    const existingIndex = relationships.findIndex(r => r.characterId === relatedCharacterId);

    const newRelationship = {
      characterId: relatedCharacterId,
      type: relationshipData.type || 'acquaintance',
      description: relationshipData.description || '',
      evolution: relationshipData.evolution || '',
      keyScenes: relationshipData.keyScenes || []
    };

    if (existingIndex >= 0) {
      // Update existing relationship
      relationships[existingIndex] = newRelationship;
    } else {
      // Add new relationship
      relationships.push(newRelationship);
    }

    return await updateCharacter(characterId, { relationships });
  } catch (error) {
    console.error('Error adding character relationship:', error);
    throw new Error(`Failed to add relationship: ${error.message}`);
  }
}

/**
 * Get character relationship map
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Object>} Relationship network data
 */
export async function getCharacterRelationshipMap(bookProjectId) {
  try {
    const characters = await getProjectCharacters(bookProjectId);

    // Build relationship network
    const nodes = characters.map(char => ({
      id: char._id,
      name: char.name,
      role: char.role,
      imageUrl: char.imageUrl
    }));

    const edges = [];
    characters.forEach(char => {
      if (char.relationships && Array.isArray(char.relationships)) {
        char.relationships.forEach(rel => {
          edges.push({
            from: char._id,
            to: rel.characterId,
            type: rel.type,
            description: rel.description
          });
        });
      }
    });

    return {
      nodes,
      edges
    };
  } catch (error) {
    console.error('Error getting character relationship map:', error);
    throw new Error(`Failed to get relationship map: ${error.message}`);
  }
}

/**
 * Get character arc progress
 * @param {string} characterId - Character ID
 * @returns {Promise<Object>} Character arc data
 */
export async function getCharacterArcProgress(characterId) {
  try {
    const character = await getCharacter(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Get plot threads involving this character
    const plotThreads = await wixData.query(COLLECTIONS.PLOT_THREADS)
      .eq('bookProjectId', character.bookProjectId)
      .find();

    const relevantThreads = plotThreads.items.filter(thread => {
      return thread.relatedCharacters &&
             Array.isArray(thread.relatedCharacters) &&
             thread.relatedCharacters.includes(characterId);
    });

    return {
      character: {
        name: character.name,
        role: character.role,
        internalConflict: character.internalConflict,
        externalConflict: character.externalConflict,
        characterArc: character.characterArc
      },
      plotThreads: relevantThreads.map(thread => ({
        name: thread.name,
        type: thread.type,
        status: thread.status,
        startChapter: thread.startChapter,
        endChapter: thread.endChapter
      }))
    };
  } catch (error) {
    console.error('Error getting character arc progress:', error);
    throw new Error(`Failed to get arc progress: ${error.message}`);
  }
}

/**
 * Search characters
 * @param {string} bookProjectId - Book project ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Matching characters
 */
export async function searchCharacters(bookProjectId, searchTerm) {
  try {
    const results = await wixData.query(COLLECTIONS.CHARACTERS)
      .eq('bookProjectId', bookProjectId)
      .contains('name', searchTerm)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error searching characters:', error);
    throw new Error(`Failed to search characters: ${error.message}`);
  }
}

/**
 * Get character statistics
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Object>} Character statistics
 */
export async function getCharacterStatistics(bookProjectId) {
  try {
    const characters = await getProjectCharacters(bookProjectId);

    const stats = {
      total: characters.length,
      byRole: {
        protagonist: 0,
        antagonist: 0,
        supporting: 0,
        minor: 0
      },
      withArcs: 0,
      withImages: 0
    };

    characters.forEach(char => {
      // Count by role
      if (stats.byRole[char.role] !== undefined) {
        stats.byRole[char.role]++;
      }

      // Count characters with defined arcs
      if (char.characterArc && char.characterArc.trim().length > 0) {
        stats.withArcs++;
      }

      // Count characters with images
      if (char.imageUrl) {
        stats.withImages++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting character statistics:', error);
    throw new Error(`Failed to get statistics: ${error.message}`);
  }
}

export default {
  createCharacter,
  getCharacter,
  getProjectCharacters,
  updateCharacter,
  deleteCharacter,
  addCharacterRelationship,
  getCharacterRelationshipMap,
  getCharacterArcProgress,
  searchCharacters,
  getCharacterStatistics
};
