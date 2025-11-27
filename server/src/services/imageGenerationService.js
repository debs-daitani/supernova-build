import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { uploadToCloudinary } from './cloudinaryService.js';

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate an image using DALL-E 3
 * @param {string} userPrompt - User's image request
 * @param {Object} options - Generation options
 * @returns {Object} Generated image data
 */
export async function generateImage(userPrompt, options = {}) {
  try {
    console.log('🎨 Generating image with DALL-E 3...', { userPrompt, options });

    // 1. Enhance prompt with AI for better results
    const enhancedPrompt = await enhancePromptForImageGen(userPrompt, options.context);

    console.log('✨ Enhanced prompt:', enhancedPrompt);

    // 2. Call DALL-E API
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: options.size || "1024x1024",
      style: options.style || "vivid",
      quality: options.quality || "hd"
    });

    // 3. Get image URL from OpenAI
    const temporaryImageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt; // DALL-E may revise the prompt

    console.log('✅ Image generated:', temporaryImageUrl);

    // 4. Download and save to our storage (Cloudinary)
    const savedUrl = await saveImageToStorage(temporaryImageUrl, options.userId);

    console.log('💾 Image saved to storage:', savedUrl);

    // 5. Store in database
    const generatedImage = await prisma.generatedImage.create({
      data: {
        userId: options.userId,
        prompt: userPrompt,
        enhancedPrompt: revisedPrompt || enhancedPrompt,
        imageUrl: savedUrl,
        size: options.size || "1024x1024",
        style: options.style || "vivid",
        quality: options.quality || "hd",
        model: "dall-e-3",
        conversationId: options.conversationId || null
      }
    });

    console.log('✅ Image record created in database:', generatedImage.id);

    return {
      imageId: generatedImage.id,
      imageUrl: savedUrl,
      prompt: userPrompt,
      enhancedPrompt: revisedPrompt || enhancedPrompt,
      size: options.size || "1024x1024",
      style: options.style || "vivid"
    };
  } catch (error) {
    console.error('❌ Error generating image:', error);
    throw new Error(`Image generation failed: ${error.message}`);
  }
}

/**
 * Enhance user's prompt for better DALL-E results
 * @param {string} userPrompt - User's original request
 * @param {string} context - Additional context about user's business/brand
 * @returns {string} Enhanced prompt
 */
async function enhancePromptForImageGen(userPrompt, context = '') {
  try {
    const systemPrompt = `You are a prompt engineer for DALL-E 3. Transform simple image requests into detailed, effective DALL-E prompts.

Guidelines:
- Be specific about style, composition, colors, and mood
- Include lighting, perspective, and atmosphere details
- Avoid text in images (DALL-E struggles with text)
- Keep prompts under 400 characters
- Make it visual and descriptive

${context ? `User context: ${context}` : ''}

Return ONLY the enhanced prompt, nothing else.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    // If enhancement fails, return original prompt
    return userPrompt;
  }
}

/**
 * Download image from OpenAI and save to Cloudinary
 * @param {string} imageUrl - Temporary OpenAI image URL
 * @param {string} userId - User ID for folder organization
 * @returns {string} Permanent Cloudinary URL
 */
async function saveImageToStorage(imageUrl, userId) {
  try {
    // Download image from OpenAI (these URLs expire after 1 hour)
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    const imageBuffer = Buffer.from(response.data);

    // Upload to Cloudinary with folder organization
    const result = await uploadToCloudinary(imageBuffer, {
      folder: `users/${userId}/generated-images`,
      resource_type: 'image'
    });

    return result.secure_url;
  } catch (error) {
    console.error('Error saving image to storage:', error);
    // Fallback: return original URL (will expire in 1 hour)
    return imageUrl;
  }
}

/**
 * Get user's generated images
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Array} Generated images
 */
export async function getUserGeneratedImages(userId, filters = {}) {
  try {
    const where = { userId };

    if (filters.conversationId) {
      where.conversationId = filters.conversationId;
    }

    if (filters.savedToLibrary !== undefined) {
      where.savedToLibrary = filters.savedToLibrary;
    }

    const images = await prisma.generatedImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50
    });

    return images;
  } catch (error) {
    console.error('Error fetching generated images:', error);
    throw error;
  }
}

/**
 * Save generated image to user's media library
 * @param {string} imageId - Generated image ID
 * @param {string} userId - User ID (for verification)
 * @returns {Object} Updated image record
 */
export async function saveToLibrary(imageId, userId) {
  try {
    // Verify ownership
    const image = await prisma.generatedImage.findFirst({
      where: { id: imageId, userId }
    });

    if (!image) {
      throw new Error('Image not found or unauthorized');
    }

    // Update saved status
    const updated = await prisma.generatedImage.update({
      where: { id: imageId },
      data: { savedToLibrary: true }
    });

    return updated;
  } catch (error) {
    console.error('Error saving to library:', error);
    throw error;
  }
}

/**
 * Mark image as used in a specific context
 * @param {string} imageId - Generated image ID
 * @param {string} userId - User ID (for verification)
 * @param {string} usedIn - Where it's being used (e.g., "website", "marketplace")
 * @returns {Object} Updated image record
 */
export async function markImageAsUsed(imageId, userId, usedIn) {
  try {
    const updated = await prisma.generatedImage.update({
      where: { id: imageId },
      data: { usedIn }
    });

    return updated;
  } catch (error) {
    console.error('Error marking image as used:', error);
    throw error;
  }
}

/**
 * Delete generated image
 * @param {string} imageId - Generated image ID
 * @param {string} userId - User ID (for verification)
 * @returns {boolean} Success status
 */
export async function deleteGeneratedImage(imageId, userId) {
  try {
    // Verify ownership
    const image = await prisma.generatedImage.findFirst({
      where: { id: imageId, userId }
    });

    if (!image) {
      throw new Error('Image not found or unauthorized');
    }

    await prisma.generatedImage.delete({
      where: { id: imageId }
    });

    // TODO: Also delete from Cloudinary to save storage costs

    return true;
  } catch (error) {
    console.error('Error deleting generated image:', error);
    throw error;
  }
}

export default {
  generateImage,
  getUserGeneratedImages,
  saveToLibrary,
  markImageAsUsed,
  deleteGeneratedImage
};
