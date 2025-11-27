/**
 * Brand Kit Service
 * Business logic for brand asset management
 */

/**
 * Get all brand kits for a user
 */
async function getBrandKits(prisma, userId) {
  try {
    const brandKits = await prisma.brandKit.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            assets: true,
            guidelineSections: true
          }
        }
      },
      orderBy: [
        { isPrimary: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    return { success: true, brandKits };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get single brand kit with full details
 */
async function getBrandKit(prisma, brandKitId, userId) {
  try {
    const brandKit = await prisma.brandKit.findFirst({
      where: {
        id: brandKitId,
        userId
      },
      include: {
        assets: {
          orderBy: { uploadedAt: 'desc' }
        },
        guidelineSections: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!brandKit) {
      return { success: false, error: 'Brand kit not found' };
    }

    return { success: true, brandKit };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create new brand kit
 */
async function createBrandKit(prisma, userId, data) {
  try {
    const { name, colors, fonts, logos, guidelines, isPrimary } = data;

    // If setting as primary, unset other primary kits
    if (isPrimary) {
      await prisma.brandKit.updateMany({
        where: {
          userId,
          isPrimary: true
        },
        data: {
          isPrimary: false
        }
      });
    }

    const brandKit = await prisma.brandKit.create({
      data: {
        userId,
        name,
        isPrimary: isPrimary || false,
        colors: colors || [],
        fonts: fonts || [],
        logos: logos || [],
        guidelines: guidelines || {}
      }
    });

    return { success: true, brandKit };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update brand kit
 */
async function updateBrandKit(prisma, brandKitId, userId, data) {
  try {
    // Check ownership
    const existing = await prisma.brandKit.findFirst({
      where: { id: brandKitId, userId }
    });

    if (!existing) {
      return { success: false, error: 'Brand kit not found' };
    }

    // If setting as primary, unset other primary kits
    if (data.isPrimary && !existing.isPrimary) {
      await prisma.brandKit.updateMany({
        where: {
          userId,
          isPrimary: true,
          id: { not: brandKitId }
        },
        data: {
          isPrimary: false
        }
      });
    }

    const brandKit = await prisma.brandKit.update({
      where: { id: brandKitId },
      data
    });

    return { success: true, brandKit };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete brand kit
 */
async function deleteBrandKit(prisma, brandKitId, userId) {
  try {
    const brandKit = await prisma.brandKit.findFirst({
      where: { id: brandKitId, userId }
    });

    if (!brandKit) {
      return { success: false, error: 'Brand kit not found' };
    }

    await prisma.brandKit.delete({
      where: { id: brandKitId }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Upload brand asset
 */
async function createBrandAsset(prisma, brandKitId, userId, assetData) {
  try {
    // Verify brand kit ownership
    const brandKit = await prisma.brandKit.findFirst({
      where: { id: brandKitId, userId }
    });

    if (!brandKit) {
      return { success: false, error: 'Brand kit not found' };
    }

    const asset = await prisma.brandAsset.create({
      data: {
        brandKitId,
        ...assetData
      }
    });

    return { success: true, asset };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get brand assets
 */
async function getBrandAssets(prisma, brandKitId, userId, filters = {}) {
  try {
    // Verify ownership
    const brandKit = await prisma.brandKit.findFirst({
      where: { id: brandKitId, userId }
    });

    if (!brandKit) {
      return { success: false, error: 'Brand kit not found' };
    }

    const where = { brandKitId };

    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } }
      ];
    }

    const assets = await prisma.brandAsset.findMany({
      where,
      orderBy: { uploadedAt: 'desc' }
    });

    return { success: true, assets };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete brand asset
 */
async function deleteBrandAsset(prisma, assetId, userId) {
  try {
    const asset = await prisma.brandAsset.findUnique({
      where: { id: assetId },
      include: { brandKit: true }
    });

    if (!asset || asset.brandKit.userId !== userId) {
      return { success: false, error: 'Asset not found' };
    }

    await prisma.brandAsset.delete({
      where: { id: assetId }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create or update brand guideline section
 */
async function saveBrandGuideline(prisma, brandKitId, userId, guidelineData) {
  try {
    // Verify ownership
    const brandKit = await prisma.brandKit.findFirst({
      where: { id: brandKitId, userId }
    });

    if (!brandKit) {
      return { success: false, error: 'Brand kit not found' };
    }

    const { id, section, title, content, examples, order } = guidelineData;

    let guideline;

    if (id) {
      // Update existing
      guideline = await prisma.brandGuideline.update({
        where: { id },
        data: { title, content, examples, order }
      });
    } else {
      // Create new
      guideline = await prisma.brandGuideline.create({
        data: {
          brandKitId,
          section,
          title,
          content,
          examples,
          order: order || 0
        }
      });
    }

    return { success: true, guideline };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete brand guideline section
 */
async function deleteBrandGuideline(prisma, guidelineId, userId) {
  try {
    const guideline = await prisma.brandGuideline.findUnique({
      where: { id: guidelineId },
      include: { brandKit: true }
    });

    if (!guideline || guideline.brandKit.userId !== userId) {
      return { success: false, error: 'Guideline not found' };
    }

    await prisma.brandGuideline.delete({
      where: { id: guidelineId }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate color palette from primary color
 */
function generateColorPalette(primaryHex) {
  try {
    // Convert hex to HSL
    const hsl = hexToHSL(primaryHex);

    const palette = [
      {
        name: 'Primary',
        hex: primaryHex,
        rgb: hexToRGB(primaryHex),
        usage: 'Main brand color for CTAs and important elements'
      },
      {
        name: 'Secondary',
        hex: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
        rgb: hexToRGB(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)),
        usage: 'Complementary color for contrast'
      },
      {
        name: 'Accent',
        hex: hslToHex((hsl.h + 30) % 360, hsl.s, Math.min(hsl.l + 10, 90)),
        rgb: hexToRGB(hslToHex((hsl.h + 30) % 360, hsl.s, Math.min(hsl.l + 10, 90))),
        usage: 'Accent color for highlights'
      },
      {
        name: 'Light',
        hex: hslToHex(hsl.h, Math.max(hsl.s - 20, 10), Math.min(hsl.l + 30, 95)),
        rgb: hexToRGB(hslToHex(hsl.h, Math.max(hsl.s - 20, 10), Math.min(hsl.l + 30, 95))),
        usage: 'Light background color'
      },
      {
        name: 'Dark',
        hex: hslToHex(hsl.h, Math.min(hsl.s + 10, 100), Math.max(hsl.l - 30, 10)),
        rgb: hexToRGB(hslToHex(hsl.h, Math.min(hsl.s + 10, 100), Math.max(hsl.l - 30, 10))),
        usage: 'Dark text or background'
      }
    ];

    return { success: true, palette };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Check contrast ratio between two colors
 */
function checkContrast(color1Hex, color2Hex) {
  try {
    const rgb1 = hexToRGB(color1Hex);
    const rgb2 = hexToRGB(color2Hex);

    const l1 = getRelativeLuminance(rgb1);
    const l2 = getRelativeLuminance(rgb2);

    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      success: true,
      ratio: ratio.toFixed(2),
      passAA: ratio >= 4.5,  // WCAG AA standard
      passAAA: ratio >= 7,   // WCAG AAA standard
      passAALarge: ratio >= 3 // WCAG AA for large text
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create shareable link
 */
async function createShareLink(prisma, brandKitId, userId, shareData) {
  try {
    // Verify ownership
    const brandKit = await prisma.brandKit.findFirst({
      where: { id: brandKitId, userId }
    });

    if (!brandKit) {
      return { success: false, error: 'Brand kit not found' };
    }

    const { permissions, password, expiresAt } = shareData;

    // Generate unique token
    const token = generateToken();

    const share = await prisma.brandShare.create({
      data: {
        brandKitId,
        token,
        permissions: permissions || 'VIEW',
        password,
        expiresAt,
        createdBy: userId
      }
    });

    return { success: true, share, shareUrl: `/brand-kit/shared/${token}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get shared brand kit
 */
async function getSharedBrandKit(prisma, token, password) {
  try {
    const share = await prisma.brandShare.findUnique({
      where: { token },
      include: {
        brandKit: {
          include: {
            assets: true,
            guidelineSections: true
          }
        }
      }
    });

    if (!share) {
      return { success: false, error: 'Share link not found' };
    }

    // Check expiry
    if (share.expiresAt && new Date() > share.expiresAt) {
      return { success: false, error: 'Share link has expired' };
    }

    // Check password
    if (share.password && share.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    // Update access count
    await prisma.brandShare.update({
      where: { id: share.id },
      data: {
        accessCount: { increment: 1 },
        lastAccessAt: new Date()
      }
    });

    return {
      success: true,
      brandKit: share.brandKit,
      permissions: share.permissions
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate CSS variables from brand kit
 */
function generateCSS(brandKit) {
  let css = ':root {\n';

  // Colors
  if (brandKit.colors && Array.isArray(brandKit.colors)) {
    brandKit.colors.forEach((color, index) => {
      const varName = color.name.toLowerCase().replace(/\s+/g, '-');
      css += `  --brand-${varName}: ${color.hex};\n`;
    });
  }

  // Fonts
  if (brandKit.fonts && Array.isArray(brandKit.fonts)) {
    brandKit.fonts.forEach((font, index) => {
      const varName = font.name.toLowerCase().replace(/\s+/g, '-');
      css += `  --font-${varName}: ${font.family};\n`;
    });
  }

  css += '}';

  return css;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function hexToRGB(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

function hexToHSL(hex) {
  const rgb = hexToRGB(hex);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getRelativeLuminance(rgb) {
  const { r, g, b } = rgb;

  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

function generateToken() {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

module.exports = {
  getBrandKits,
  getBrandKit,
  createBrandKit,
  updateBrandKit,
  deleteBrandKit,
  createBrandAsset,
  getBrandAssets,
  deleteBrandAsset,
  saveBrandGuideline,
  deleteBrandGuideline,
  generateColorPalette,
  checkContrast,
  createShareLink,
  getSharedBrandKit,
  generateCSS
};
