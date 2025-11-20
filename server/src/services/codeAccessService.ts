/**
 * Code Assistant Access Service
 *
 * Manages access tiers and unlock logic for Code Assistant feature
 */

import { PrismaClient, CodeAssistantLevel } from '@prisma/client';

const prisma = new PrismaClient();

interface AccessCheckResult {
  accessLevel: CodeAssistantLevel;
  isUnlocked: boolean;
  websitePageCount: number;
  platformFeaturesUsed: string[];
  requirementsForNextTier?: {
    tier: CodeAssistantLevel;
    requirements: string[];
    missing: string[];
  };
}

export class CodeAccessService {
  /**
   * Check and update user's access level
   */
  static async checkAndUpdateAccess(userId: string): Promise<AccessCheckResult> {
    // Get or create access record
    let access = await prisma.codeAssistantAccess.findUnique({
      where: { userId },
    });

    if (!access) {
      access = await prisma.codeAssistantAccess.create({
        data: {
          userId,
          accessLevel: 'LOCKED',
          websitePageCount: 0,
          platformFeaturesUsed: [],
        },
      });
    }

    // Get user's actual platform usage
    const usage = await this.getUserPlatformUsage(userId);

    // Calculate appropriate tier
    const newAccessLevel = this.calculateAccessLevel(
      usage.websitePageCount,
      usage.platformFeaturesUsed
    );

    // Update access if changed
    if (access.accessLevel !== newAccessLevel || access.accessLevel === 'LOCKED') {
      const wasLocked = access.accessLevel === 'LOCKED';

      access = await prisma.codeAssistantAccess.update({
        where: { userId },
        data: {
          accessLevel: newAccessLevel,
          websitePageCount: usage.websitePageCount,
          platformFeaturesUsed: usage.platformFeaturesUsed,
          lastCheckedAt: new Date(),
          unlockedAt: wasLocked && newAccessLevel !== 'LOCKED' ? new Date() : access.unlockedAt,
        },
      });
    }

    // Get requirements for next tier
    const requirementsForNextTier = this.getNextTierRequirements(
      newAccessLevel,
      usage.websitePageCount,
      usage.platformFeaturesUsed
    );

    return {
      accessLevel: access.accessLevel,
      isUnlocked: access.accessLevel !== 'LOCKED',
      websitePageCount: usage.websitePageCount,
      platformFeaturesUsed: usage.platformFeaturesUsed,
      requirementsForNextTier,
    };
  }

  /**
   * Get user's platform usage metrics
   */
  private static async getUserPlatformUsage(userId: string): Promise<{
    websitePageCount: number;
    platformFeaturesUsed: string[];
  }> {
    // In production, this would query actual website/feature usage
    // For now, we'll use placeholder data structure

    // Example queries (implement based on actual schema):
    // - Count website pages
    // - Check if user has store setup
    // - Check if user has courses
    // - Check if user has email campaigns
    // - Check if user has CRM data
    // - etc.

    const websitePageCount = 0; // TODO: Query actual website pages
    const platformFeaturesUsed: string[] = []; // TODO: Query actual features used

    // Placeholder logic - replace with actual queries
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // Include relations to check feature usage
        // websites, stores, courses, etc.
      },
    });

    if (!user) {
      return {
        websitePageCount: 0,
        platformFeaturesUsed: [],
      };
    }

    // TODO: Implement actual feature detection
    // Example:
    // if (user.websites?.length > 0) platformFeaturesUsed.push('website');
    // if (user.stores?.length > 0) platformFeaturesUsed.push('store');
    // websitePageCount = user.websites?.reduce((sum, site) => sum + site.pageCount, 0) || 0;

    return {
      websitePageCount,
      platformFeaturesUsed,
    };
  }

  /**
   * Calculate access level based on usage
   */
  private static calculateAccessLevel(
    websitePageCount: number,
    platformFeaturesUsed: string[]
  ): CodeAssistantLevel {
    // Level 4: All-In Rockstar - Using 5+ major platform features
    if (platformFeaturesUsed.length >= 5) {
      return 'ALL_IN_ROCKSTAR';
    }

    // Level 3: Full Business Setup - Using 3+ features
    if (platformFeaturesUsed.length >= 3) {
      return 'FULL_BUSINESS';
    }

    // Level 2: Multi-Page Site - 5+ pages
    if (websitePageCount >= 5) {
      return 'MULTI_PAGE';
    }

    // Level 1: Landing Page - At least 1 page
    if (websitePageCount >= 1) {
      return 'LANDING_PAGE';
    }

    // Locked - No website yet
    return 'LOCKED';
  }

  /**
   * Get requirements for next tier
   */
  private static getNextTierRequirements(
    currentLevel: CodeAssistantLevel,
    websitePageCount: number,
    platformFeaturesUsed: string[]
  ): {
    tier: CodeAssistantLevel;
    requirements: string[];
    missing: string[];
  } | undefined {
    const tierRequirements: Record<
      CodeAssistantLevel,
      { requirements: string[]; nextTier?: CodeAssistantLevel }
    > = {
      LOCKED: {
        requirements: ['Create at least 1 landing page'],
        nextTier: 'LANDING_PAGE',
      },
      LANDING_PAGE: {
        requirements: ['Create a website with 5+ pages'],
        nextTier: 'MULTI_PAGE',
      },
      MULTI_PAGE: {
        requirements: [
          'Use 3+ platform features',
          'Examples: Store, Courses, Email, CRM, Social',
        ],
        nextTier: 'FULL_BUSINESS',
      },
      FULL_BUSINESS: {
        requirements: [
          'Use 5+ major platform features',
          'Go all-in on dAItaniverse ecosystem',
        ],
        nextTier: 'ALL_IN_ROCKSTAR',
      },
      ALL_IN_ROCKSTAR: {
        requirements: ['You have maximum access!'],
      },
    };

    const currentTierInfo = tierRequirements[currentLevel];
    if (!currentTierInfo.nextTier) {
      return undefined; // Already at max tier
    }

    const missing: string[] = [];

    if (currentLevel === 'LOCKED') {
      if (websitePageCount < 1) {
        missing.push('Create at least 1 landing page');
      }
    } else if (currentLevel === 'LANDING_PAGE') {
      const pagesNeeded = 5 - websitePageCount;
      if (pagesNeeded > 0) {
        missing.push(`Create ${pagesNeeded} more page(s) (${websitePageCount}/5)`);
      }
    } else if (currentLevel === 'MULTI_PAGE') {
      const featuresNeeded = 3 - platformFeaturesUsed.length;
      if (featuresNeeded > 0) {
        missing.push(
          `Use ${featuresNeeded} more platform feature(s) (${platformFeaturesUsed.length}/3)`
        );
      }
    } else if (currentLevel === 'FULL_BUSINESS') {
      const featuresNeeded = 5 - platformFeaturesUsed.length;
      if (featuresNeeded > 0) {
        missing.push(
          `Use ${featuresNeeded} more platform feature(s) (${platformFeaturesUsed.length}/5)`
        );
      }
    }

    return {
      tier: currentTierInfo.nextTier,
      requirements: currentTierInfo.requirements,
      missing,
    };
  }

  /**
   * Get access capabilities for a tier
   */
  static getAccessCapabilities(level: CodeAssistantLevel): {
    name: string;
    maxLinesOfCode: number | null;
    features: string[];
    canUseAPIs: boolean;
    canUseDatabase: boolean;
    prioritySupport: boolean;
  } {
    const capabilities = {
      LOCKED: {
        name: 'Locked',
        maxLinesOfCode: 0,
        features: [],
        canUseAPIs: false,
        canUseDatabase: false,
        prioritySupport: false,
      },
      LANDING_PAGE: {
        name: 'Landing Page (Basic)',
        maxLinesOfCode: 200,
        features: [
          'Simple widgets (calculators, timers, forms)',
          'Basic interactivity (buttons, animations)',
          'Simple design customizations',
          'Pre-built component library',
        ],
        canUseAPIs: false,
        canUseDatabase: false,
        prioritySupport: false,
      },
      MULTI_PAGE: {
        name: 'Multi-Page Site (Advanced)',
        maxLinesOfCode: 500,
        features: [
          'Everything in Basic tier',
          'Custom integrations (APIs, third-party services)',
          'Complex forms and workflows',
          'Custom animations and interactions',
          'Database queries (within dAItaniverse)',
        ],
        canUseAPIs: true,
        canUseDatabase: true,
        prioritySupport: false,
      },
      FULL_BUSINESS: {
        name: 'Full Business Setup (Enterprise)',
        maxLinesOfCode: 2000,
        features: [
          'Everything in Advanced tier',
          'Complex custom features',
          'Full stack development',
          'Advanced integrations',
          'Custom dashboards',
          'Priority support',
        ],
        canUseAPIs: true,
        canUseDatabase: true,
        prioritySupport: true,
      },
      ALL_IN_ROCKSTAR: {
        name: 'All-In Rockstar (Unlimited)',
        maxLinesOfCode: null, // Unlimited
        features: [
          'Everything in Enterprise tier',
          'Unlimited code complexity',
          'White-label code generation (for agencies)',
          'Custom export options',
          'Priority queue',
          'Dedicated support',
          'Revenue share opportunities',
        ],
        canUseAPIs: true,
        canUseDatabase: true,
        prioritySupport: true,
      },
    };

    return capabilities[level];
  }

  /**
   * Check if user can perform action based on tier
   */
  static async canPerformAction(
    userId: string,
    action: {
      type: 'generate' | 'deploy' | 'integrate';
      linesOfCode?: number;
      requiresAPI?: boolean;
      requiresDatabase?: boolean;
    }
  ): Promise<{ allowed: boolean; reason?: string }> {
    const accessCheck = await this.checkAndUpdateAccess(userId);

    if (!accessCheck.isUnlocked) {
      return {
        allowed: false,
        reason: 'Code Assistant is locked. Create a website to unlock!',
      };
    }

    const capabilities = this.getAccessCapabilities(accessCheck.accessLevel);

    // Check lines of code limit
    if (
      action.linesOfCode &&
      capabilities.maxLinesOfCode !== null &&
      action.linesOfCode > capabilities.maxLinesOfCode
    ) {
      return {
        allowed: false,
        reason: `Code complexity exceeds your tier limit (${action.linesOfCode} > ${capabilities.maxLinesOfCode} lines). Upgrade to ${this.getNextTierName(accessCheck.accessLevel)}.`,
      };
    }

    // Check API access
    if (action.requiresAPI && !capabilities.canUseAPIs) {
      return {
        allowed: false,
        reason: 'API integrations require Multi-Page tier or higher.',
      };
    }

    // Check database access
    if (action.requiresDatabase && !capabilities.canUseDatabase) {
      return {
        allowed: false,
        reason: 'Database access requires Multi-Page tier or higher.',
      };
    }

    return { allowed: true };
  }

  /**
   * Get next tier name
   */
  private static getNextTierName(currentLevel: CodeAssistantLevel): string {
    const nextTier: Record<CodeAssistantLevel, string> = {
      LOCKED: 'Landing Page',
      LANDING_PAGE: 'Multi-Page Site',
      MULTI_PAGE: 'Full Business Setup',
      FULL_BUSINESS: 'All-In Rockstar',
      ALL_IN_ROCKSTAR: 'Maximum',
    };

    return nextTier[currentLevel];
  }

  /**
   * Update usage stats
   */
  static async updateUsageStats(userId: string, stats: {
    conversationsCount?: number;
    deploymentsCount?: number;
    linesOfCodeGenerated?: number;
  }) {
    const access = await prisma.codeAssistantAccess.findUnique({
      where: { userId },
    });

    if (!access) {
      return;
    }

    await prisma.codeAssistantAccess.update({
      where: { userId },
      data: {
        conversationsCount: stats.conversationsCount
          ? access.conversationsCount + stats.conversationsCount
          : access.conversationsCount,
        deploymentsCount: stats.deploymentsCount
          ? access.deploymentsCount + stats.deploymentsCount
          : access.deploymentsCount,
        linesOfCodeGenerated: stats.linesOfCodeGenerated
          ? access.linesOfCodeGenerated + stats.linesOfCodeGenerated
          : access.linesOfCodeGenerated,
      },
    });
  }

  /**
   * Get user's usage stats
   */
  static async getUsageStats(userId: string) {
    const access = await prisma.codeAssistantAccess.findUnique({
      where: { userId },
    });

    if (!access) {
      return {
        conversationsCount: 0,
        deploymentsCount: 0,
        linesOfCodeGenerated: 0,
      };
    }

    return {
      conversationsCount: access.conversationsCount,
      deploymentsCount: access.deploymentsCount,
      linesOfCodeGenerated: access.linesOfCodeGenerated,
    };
  }
}
