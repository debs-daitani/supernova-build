/**
 * SUPERNova Book Writing Suite - Mind Map Service
 *
 * Manages mind mapping and brainstorming:
 * - Mind map nodes
 * - Node connections
 * - Hierarchical organization
 * - Visual positioning
 */

import wixData from 'wix-data';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  MINDMAP_NODES: 'MindMapNodes'
};

// ============================================================================
// Mind Map Node Operations
// ============================================================================

/**
 * Create mind map node
 * @param {Object} nodeInput - Node data
 * @returns {Promise<Object>} Created node
 */
export async function createMindMapNode(nodeInput) {
  try {
    const now = new Date();

    const node = {
      bookProjectId: nodeInput.bookProjectId,
      nodeType: nodeInput.nodeType,
      content: nodeInput.content,
      parentNodeId: nodeInput.parentNodeId || null,
      position: nodeInput.position || { x: 0, y: 0 },
      color: nodeInput.color || '#3B82F6',
      connections: nodeInput.connections || [],
      notes: nodeInput.notes || '',
      createdAt: now,
      updatedAt: now
    };

    const result = await wixData.insert(COLLECTIONS.MINDMAP_NODES, node);
    return result;
  } catch (error) {
    console.error('Error creating mind map node:', error);
    throw new Error(`Failed to create node: ${error.message}`);
  }
}

/**
 * Get mind map node by ID
 * @param {string} nodeId - Node ID
 * @returns {Promise<Object|null>} Node object
 */
export async function getMindMapNode(nodeId) {
  try {
    const node = await wixData.get(COLLECTIONS.MINDMAP_NODES, nodeId);
    return node;
  } catch (error) {
    console.error('Error getting mind map node:', error);
    throw new Error(`Failed to get node: ${error.message}`);
  }
}

/**
 * Get all mind map nodes for a book project
 * @param {string} bookProjectId - Book project ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of nodes
 */
export async function getProjectMindMapNodes(bookProjectId, options = {}) {
  try {
    let query = wixData.query(COLLECTIONS.MINDMAP_NODES)
      .eq('bookProjectId', bookProjectId);

    if (options.nodeType) {
      query = query.eq('nodeType', options.nodeType);
    }

    if (options.parentNodeId !== undefined) {
      query = query.eq('parentNodeId', options.parentNodeId);
    }

    const results = await query
      .ascending('createdAt')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting mind map nodes:', error);
    throw new Error(`Failed to get nodes: ${error.message}`);
  }
}

/**
 * Update mind map node
 * @param {string} nodeId - Node ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated node
 */
export async function updateMindMapNode(nodeId, updates) {
  try {
    const node = await getMindMapNode(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }

    const updatedNode = {
      ...node,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update(COLLECTIONS.MINDMAP_NODES, updatedNode);
    return result;
  } catch (error) {
    console.error('Error updating mind map node:', error);
    throw new Error(`Failed to update node: ${error.message}`);
  }
}

/**
 * Delete mind map node
 * @param {string} nodeId - Node ID
 * @param {boolean} deleteChildren - Whether to delete child nodes
 * @returns {Promise<boolean>} Success status
 */
export async function deleteMindMapNode(nodeId, deleteChildren = false) {
  try {
    if (deleteChildren) {
      // Get and delete all child nodes recursively
      const children = await wixData.query(COLLECTIONS.MINDMAP_NODES)
        .eq('parentNodeId', nodeId)
        .find();

      for (const child of children.items) {
        await deleteMindMapNode(child._id, true);
      }
    } else {
      // Update children to have no parent
      const children = await wixData.query(COLLECTIONS.MINDMAP_NODES)
        .eq('parentNodeId', nodeId)
        .find();

      for (const child of children.items) {
        child.parentNodeId = null;
        await wixData.update(COLLECTIONS.MINDMAP_NODES, child);
      }
    }

    // Remove this node from any connection arrays
    const allNodes = await wixData.query(COLLECTIONS.MINDMAP_NODES)
      .find();

    for (const node of allNodes.items) {
      if (node.connections && Array.isArray(node.connections)) {
        const filteredConnections = node.connections.filter(connId => connId !== nodeId);
        if (filteredConnections.length !== node.connections.length) {
          node.connections = filteredConnections;
          await wixData.update(COLLECTIONS.MINDMAP_NODES, node);
        }
      }
    }

    // Delete the node
    await wixData.remove(COLLECTIONS.MINDMAP_NODES, nodeId);
    return true;
  } catch (error) {
    console.error('Error deleting mind map node:', error);
    throw new Error(`Failed to delete node: ${error.message}`);
  }
}

/**
 * Add connection between nodes
 * @param {string} fromNodeId - Source node ID
 * @param {string} toNodeId - Target node ID
 * @returns {Promise<Object>} Updated source node
 */
export async function addNodeConnection(fromNodeId, toNodeId) {
  try {
    const fromNode = await getMindMapNode(fromNodeId);
    if (!fromNode) {
      throw new Error('Source node not found');
    }

    const connections = fromNode.connections || [];

    // Check if connection already exists
    if (!connections.includes(toNodeId)) {
      connections.push(toNodeId);

      return await updateMindMapNode(fromNodeId, { connections });
    }

    return fromNode;
  } catch (error) {
    console.error('Error adding node connection:', error);
    throw new Error(`Failed to add connection: ${error.message}`);
  }
}

/**
 * Remove connection between nodes
 * @param {string} fromNodeId - Source node ID
 * @param {string} toNodeId - Target node ID
 * @returns {Promise<Object>} Updated source node
 */
export async function removeNodeConnection(fromNodeId, toNodeId) {
  try {
    const fromNode = await getMindMapNode(fromNodeId);
    if (!fromNode) {
      throw new Error('Source node not found');
    }

    const connections = (fromNode.connections || []).filter(id => id !== toNodeId);

    return await updateMindMapNode(fromNodeId, { connections });
  } catch (error) {
    console.error('Error removing node connection:', error);
    throw new Error(`Failed to remove connection: ${error.message}`);
  }
}

/**
 * Get mind map structure (hierarchical)
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Object>} Mind map structure
 */
export async function getMindMapStructure(bookProjectId) {
  try {
    const nodes = await getProjectMindMapNodes(bookProjectId);

    // Build hierarchical structure
    const nodeMap = new Map();
    const rootNodes = [];

    // First pass: create map of all nodes
    nodes.forEach(node => {
      nodeMap.set(node._id, {
        ...node,
        children: []
      });
    });

    // Second pass: build hierarchy
    nodes.forEach(node => {
      if (node.parentNodeId && nodeMap.has(node.parentNodeId)) {
        const parent = nodeMap.get(node.parentNodeId);
        parent.children.push(nodeMap.get(node._id));
      } else {
        rootNodes.push(nodeMap.get(node._id));
      }
    });

    return {
      nodes: rootNodes,
      totalNodes: nodes.length
    };
  } catch (error) {
    console.error('Error getting mind map structure:', error);
    throw new Error(`Failed to get structure: ${error.message}`);
  }
}

/**
 * Get mind map for visualization (flat with connections)
 * @param {string} bookProjectId - Book project ID
 * @returns {Promise<Object>} Visualization data
 */
export async function getMindMapVisualization(bookProjectId) {
  try {
    const nodes = await getProjectMindMapNodes(bookProjectId);

    const visualNodes = nodes.map(node => ({
      id: node._id,
      type: node.nodeType,
      content: node.content,
      position: node.position,
      color: node.color
    }));

    const edges = [];

    // Build edges from parent-child relationships
    nodes.forEach(node => {
      if (node.parentNodeId) {
        edges.push({
          from: node.parentNodeId,
          to: node._id,
          type: 'hierarchy'
        });
      }

      // Add connection edges
      if (node.connections && Array.isArray(node.connections)) {
        node.connections.forEach(targetId => {
          edges.push({
            from: node._id,
            to: targetId,
            type: 'connection'
          });
        });
      }
    });

    return {
      nodes: visualNodes,
      edges
    };
  } catch (error) {
    console.error('Error getting mind map visualization:', error);
    throw new Error(`Failed to get visualization: ${error.message}`);
  }
}

/**
 * Update node position (for drag and drop)
 * @param {string} nodeId - Node ID
 * @param {Object} position - New position {x, y}
 * @returns {Promise<Object>} Updated node
 */
export async function updateNodePosition(nodeId, position) {
  try {
    return await updateMindMapNode(nodeId, { position });
  } catch (error) {
    console.error('Error updating node position:', error);
    throw new Error(`Failed to update position: ${error.message}`);
  }
}

/**
 * Bulk update node positions
 * @param {Array} updates - Array of {nodeId, position} objects
 * @returns {Promise<boolean>} Success status
 */
export async function bulkUpdateNodePositions(updates) {
  try {
    for (const update of updates) {
      await updateNodePosition(update.nodeId, update.position);
    }
    return true;
  } catch (error) {
    console.error('Error bulk updating node positions:', error);
    throw new Error(`Failed to bulk update: ${error.message}`);
  }
}

/**
 * Search mind map nodes
 * @param {string} bookProjectId - Book project ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Matching nodes
 */
export async function searchMindMapNodes(bookProjectId, searchTerm) {
  try {
    const results = await wixData.query(COLLECTIONS.MINDMAP_NODES)
      .eq('bookProjectId', bookProjectId)
      .contains('content', searchTerm)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error searching mind map nodes:', error);
    throw new Error(`Failed to search nodes: ${error.message}`);
  }
}

/**
 * Duplicate mind map node
 * @param {string} nodeId - Node ID to duplicate
 * @param {boolean} includeChildren - Whether to duplicate children
 * @returns {Promise<Object>} New node
 */
export async function duplicateMindMapNode(nodeId, includeChildren = false) {
  try {
    const sourceNode = await getMindMapNode(nodeId);
    if (!sourceNode) {
      throw new Error('Source node not found');
    }

    // Create duplicate with offset position
    const newPosition = {
      x: (sourceNode.position?.x || 0) + 50,
      y: (sourceNode.position?.y || 0) + 50
    };

    const newNodeInput = {
      ...sourceNode,
      _id: undefined,
      content: `${sourceNode.content} (Copy)`,
      position: newPosition,
      connections: [] // Don't copy connections
    };

    const newNode = await createMindMapNode(newNodeInput);

    if (includeChildren) {
      const children = await wixData.query(COLLECTIONS.MINDMAP_NODES)
        .eq('parentNodeId', nodeId)
        .find();

      for (const child of children.items) {
        const childInput = {
          ...child,
          _id: undefined,
          parentNodeId: newNode._id,
          connections: []
        };
        await createMindMapNode(childInput);
      }
    }

    return newNode;
  } catch (error) {
    console.error('Error duplicating mind map node:', error);
    throw new Error(`Failed to duplicate node: ${error.message}`);
  }
}

export default {
  createMindMapNode,
  getMindMapNode,
  getProjectMindMapNodes,
  updateMindMapNode,
  deleteMindMapNode,
  addNodeConnection,
  removeNodeConnection,
  getMindMapStructure,
  getMindMapVisualization,
  updateNodePosition,
  bulkUpdateNodePositions,
  searchMindMapNodes,
  duplicateMindMapNode
};
