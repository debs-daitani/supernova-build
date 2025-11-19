/**
 * SUPERNova Pinterest Integration - Scheduling Service
 *
 * Manages pin scheduling and queue:
 * - Schedule configuration
 * - Smart scheduling
 * - Queue management
 * - Optimal time suggestions
 */

import wixData from 'wix-data';
import { schedulePin, getPins } from './pinterestPinService';

// ============================================================================
// Configuration
// ============================================================================

const COLLECTIONS = {
  PINTEREST_SCHEDULES: 'PinterestSchedules',
  PINTEREST_PINS: 'PinterestPins',
  PINTEREST_ANALYTICS: 'PinterestAnalytics'
};

// ============================================================================
// Schedule Configuration
// ============================================================================

/**
 * Get schedule configuration for an account
 * @param {string} pinterestAccountId - Pinterest account ID
 * @returns {Promise<Array>} Schedule configuration
 */
export async function getScheduleConfig(pinterestAccountId) {
  try {
    const results = await wixData.query(COLLECTIONS.PINTEREST_SCHEDULES)
      .eq('pinterestAccountId', pinterestAccountId)
      .ascending('dayOfWeek')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting schedule config:', error);
    throw new Error(`Failed to get schedule: ${error.message}`);
  }
}

/**
 * Update schedule for a specific day
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {number} dayOfWeek - Day of week (0-6)
 * @param {Array} timeSlots - Array of time slots
 * @param {string} timezone - Timezone
 * @returns {Promise<Object>} Updated schedule
 */
export async function updateDaySchedule(pinterestAccountId, dayOfWeek, timeSlots, timezone) {
  try {
    // Check if schedule exists for this day
    const existing = await wixData.query(COLLECTIONS.PINTEREST_SCHEDULES)
      .eq('pinterestAccountId', pinterestAccountId)
      .eq('dayOfWeek', dayOfWeek)
      .find();

    const now = new Date();

    const scheduleData = {
      pinterestAccountId,
      dayOfWeek,
      timeSlots,
      isActive: timeSlots.length > 0,
      timezone,
      createdAt: existing.items.length > 0 ? existing.items[0].createdAt : now,
      updatedAt: now
    };

    if (existing.items.length > 0) {
      scheduleData._id = existing.items[0]._id;
      return await wixData.update(COLLECTIONS.PINTEREST_SCHEDULES, scheduleData);
    } else {
      return await wixData.insert(COLLECTIONS.PINTEREST_SCHEDULES, scheduleData);
    }
  } catch (error) {
    console.error('Error updating day schedule:', error);
    throw new Error(`Failed to update schedule: ${error.message}`);
  }
}

/**
 * Initialize default schedule (optimal times)
 * @param {string} pinterestAccountId - Pinterest account ID
 * @param {string} timezone - Timezone
 * @returns {Promise<Array>} Created schedules
 */
export async function initializeDefaultSchedule(pinterestAccountId, timezone = 'America/New_York') {
  try {
    // Default optimal times based on research
    const defaultSchedule = {
      0: [], // Sunday - skip
      1: ['09:00', '14:00', '20:00'], // Monday
      2: ['09:00', '14:00', '20:00'], // Tuesday
      3: ['09:00', '14:00', '20:00'], // Wednesday
      4: ['09:00', '14:00', '20:00'], // Thursday
      5: ['09:00', '14:00', '20:00'], // Friday
      6: ['12:00', '20:00'] // Saturday
    };

    const schedules = [];

    for (let day = 0; day <= 6; day++) {
      const schedule = await updateDaySchedule(
        pinterestAccountId,
        day,
        defaultSchedule[day],
        timezone
      );
      schedules.push(schedule);
    }

    return schedules;
  } catch (error) {
    console.error('Error initializing default schedule:', error);
    throw error;
  }
}

// ============================================================================
// Smart Scheduling
// ============================================================================

/**
 * Get optimal posting times based on analytics
 * @param {string} pinterestAccountId - Pinterest account ID
 * @returns {Promise<Object>} Optimal times
 */
export async function getOptimalPostingTimes(pinterestAccountId) {
  try {
    // Get analytics data for the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const analytics = await wixData.query(COLLECTIONS.PINTEREST_ANALYTICS)
      .eq('pinterestAccountId', pinterestAccountId)
      .ge('date', thirtyDaysAgo)
      .find();

    if (analytics.items.length === 0) {
      // Return default optimal times if no analytics data
      return getDefaultOptimalTimes();
    }

    // Analyze engagement by day of week and hour
    const engagementMap = {};

    analytics.items.forEach(dayData => {
      const date = new Date(dayData.date);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();

      const key = `${dayOfWeek}-${hour}`;

      if (!engagementMap[key]) {
        engagementMap[key] = {
          impressions: 0,
          saves: 0,
          clicks: 0,
          count: 0
        };
      }

      engagementMap[key].impressions += dayData.impressions || 0;
      engagementMap[key].saves += dayData.saves || 0;
      engagementMap[key].clicks += dayData.clicks || 0;
      engagementMap[key].count++;
    });

    // Calculate engagement scores and find top times per day
    const optimalTimes = {};

    for (let day = 0; day <= 6; day++) {
      const dayTimes = [];

      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        const data = engagementMap[key];

        if (data && data.count > 0) {
          const avgEngagement = (data.saves + data.clicks) / data.count;
          dayTimes.push({ hour, score: avgEngagement });
        }
      }

      // Sort by score and take top 3 times
      dayTimes.sort((a, b) => b.score - a.score);
      optimalTimes[day] = dayTimes.slice(0, 3).map(t => {
        const hourStr = String(t.hour).padStart(2, '0');
        return `${hourStr}:00`;
      });
    }

    return optimalTimes;
  } catch (error) {
    console.error('Error getting optimal posting times:', error);
    return getDefaultOptimalTimes();
  }
}

/**
 * Get default optimal times (industry standards)
 * @returns {Object} Default optimal times
 */
function getDefaultOptimalTimes() {
  return {
    0: ['12:00', '20:00'], // Sunday
    1: ['09:00', '14:00', '20:00'], // Monday
    2: ['09:00', '14:00', '20:00'], // Tuesday
    3: ['09:00', '14:00', '20:00'], // Wednesday
    4: ['09:00', '14:00', '20:00'], // Thursday
    5: ['09:00', '14:00', '20:00'], // Friday
    6: ['12:00', '20:00'] // Saturday
  };
}

// ============================================================================
// Queue Management
// ============================================================================

/**
 * Add pins to queue (auto-schedule based on optimal times)
 * @param {Array} pinIds - Array of pin IDs
 * @param {string} pinterestAccountId - Pinterest account ID
 * @returns {Promise<Array>} Scheduled pins
 */
export async function addToQueue(pinIds, pinterestAccountId) {
  try {
    // Get schedule configuration
    const scheduleConfig = await getScheduleConfig(pinterestAccountId);

    if (scheduleConfig.length === 0) {
      // Initialize default schedule if none exists
      await initializeDefaultSchedule(pinterestAccountId);
      return await addToQueue(pinIds, pinterestAccountId);
    }

    // Get already scheduled pins to avoid conflicts
    const scheduledPins = await getPins(pinterestAccountId, { status: 'scheduled' });

    const scheduledTimes = new Set(
      scheduledPins.map(p => p.scheduledFor.toISOString())
    );

    // Generate schedule times for the next 30 days
    const availableSlots = generateAvailableSlots(scheduleConfig, scheduledTimes, 30);

    // Assign pins to available slots
    const scheduledPinsList = [];

    for (let i = 0; i < pinIds.length && i < availableSlots.length; i++) {
      const pin = await schedulePin(pinIds[i], availableSlots[i]);
      scheduledPinsList.push(pin);
    }

    return scheduledPinsList;
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw new Error(`Failed to add to queue: ${error.message}`);
  }
}

/**
 * Generate available time slots
 * @param {Array} scheduleConfig - Schedule configuration
 * @param {Set} scheduledTimes - Already scheduled times
 * @param {number} days - Number of days to generate
 * @returns {Array} Available time slots
 */
function generateAvailableSlots(scheduleConfig, scheduledTimes, days) {
  const availableSlots = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);

    const dayOfWeek = date.getDay();

    // Find schedule for this day of week
    const daySchedule = scheduleConfig.find(s => s.dayOfWeek === dayOfWeek);

    if (!daySchedule || !daySchedule.isActive || !daySchedule.timeSlots) {
      continue;
    }

    // For each time slot on this day
    daySchedule.timeSlots.forEach(timeSlot => {
      const [hour, minute] = timeSlot.split(':').map(Number);

      const slotTime = new Date(date);
      slotTime.setHours(hour, minute, 0, 0);

      // Only use future times
      if (slotTime > now && !scheduledTimes.has(slotTime.toISOString())) {
        availableSlots.push(slotTime);
      }
    });
  }

  return availableSlots.sort((a, b) => a - b);
}

/**
 * Reschedule all queued pins (spread evenly across schedule)
 * @param {string} pinterestAccountId - Pinterest account ID
 * @returns {Promise<Array>} Rescheduled pins
 */
export async function rebalanceQueue(pinterestAccountId) {
  try {
    // Get all scheduled pins
    const scheduledPins = await getPins(pinterestAccountId, { status: 'scheduled' });

    // Clear their schedules temporarily
    const pinIds = scheduledPins.map(p => p._id);

    for (const pinId of pinIds) {
      await wixData.get(COLLECTIONS.PINTEREST_PINS, pinId).then(pin => {
        pin.status = 'draft';
        pin.scheduledFor = null;
        return wixData.update(COLLECTIONS.PINTEREST_PINS, pin);
      });
    }

    // Re-add to queue
    return await addToQueue(pinIds, pinterestAccountId);
  } catch (error) {
    console.error('Error rebalancing queue:', error);
    throw error;
  }
}

/**
 * Get queue overview
 * @param {string} pinterestAccountId - Pinterest account ID
 * @returns {Promise<Object>} Queue information
 */
export async function getQueueOverview(pinterestAccountId) {
  try {
    const scheduledPins = await getPins(pinterestAccountId, { status: 'scheduled' });

    // Group by date
    const byDate = {};

    scheduledPins.forEach(pin => {
      const dateKey = new Date(pin.scheduledFor).toDateString();
      if (!byDate[dateKey]) {
        byDate[dateKey] = [];
      }
      byDate[dateKey].push(pin);
    });

    // Find next available slot
    const scheduleConfig = await getScheduleConfig(pinterestAccountId);
    const scheduledTimes = new Set(scheduledPins.map(p => p.scheduledFor.toISOString()));
    const nextSlot = generateAvailableSlots(scheduleConfig, scheduledTimes, 7)[0];

    return {
      totalScheduled: scheduledPins.length,
      byDate,
      nextAvailableSlot: nextSlot
    };
  } catch (error) {
    console.error('Error getting queue overview:', error);
    throw error;
  }
}

export default {
  getScheduleConfig,
  updateDaySchedule,
  initializeDefaultSchedule,
  getOptimalPostingTimes,
  addToQueue,
  rebalanceQueue,
  getQueueOverview
};
