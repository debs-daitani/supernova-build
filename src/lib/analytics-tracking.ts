// Analytics tracking utilities for dAItaniverse platform

export type EventCategory =
  | 'PAGE_VIEW'
  | 'FEATURE_USE'
  | 'CONVERSION'
  | 'ENGAGEMENT'
  | 'REVENUE'

export type EventType =
  // Page views
  | 'page_view'
  | 'page_exit'
  // Feature usage
  | 'website_created'
  | 'website_published'
  | 'design_created'
  | 'design_exported'
  | 'ai_image_generated'
  | 'video_uploaded'
  | 'video_clip_created'
  // Conversions
  | 'signup'
  | 'subscription_started'
  | 'subscription_upgraded'
  | 'subscription_cancelled'
  // Engagement
  | 'session_start'
  | 'session_end'
  | 'button_click'
  | 'form_submit'
  // Revenue
  | 'payment_success'
  | 'payment_failed'
  | 'refund_processed'

export interface AnalyticsEventData {
  userId?: string
  eventType: EventType
  eventCategory: EventCategory
  eventData?: Record<string, any>
  sessionId: string
  deviceType?: string
  browser?: string
  os?: string
  ipAddress?: string
  country?: string
  city?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface SessionData {
  sessionId: string
  userId?: string
  startedAt: Date
  endedAt?: Date
  duration?: number
  pageViews: number
  eventsCount: number
  deviceType?: string
  browser?: string
  os?: string
  entryPage?: string
  exitPage?: string
}

export interface MetricData {
  date: Date
  metricType: MetricType
  metricValue: number
  metadata?: Record<string, any>
}

export type MetricType =
  | 'dau'           // Daily Active Users
  | 'wau'           // Weekly Active Users
  | 'mau'           // Monthly Active Users
  | 'new_users'     // New signups
  | 'revenue'       // Daily revenue
  | 'mrr'           // Monthly Recurring Revenue
  | 'churn_rate'    // User churn rate
  | 'retention_rate' // User retention rate
  | 'avg_session_duration'
  | 'page_views'
  | 'feature_usage'
  | 'conversion_rate'

// Client-side event tracking
export class AnalyticsTracker {
  private sessionId: string
  private userId?: string
  private sessionStartTime: number

  constructor(userId?: string) {
    this.userId = userId
    this.sessionId = this.generateSessionId()
    this.sessionStartTime = Date.now()
    this.initSession()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async initSession() {
    await this.trackEvent('session_start', 'ENGAGEMENT', {
      timestamp: new Date().toISOString(),
    })
  }

  async trackEvent(
    eventType: EventType,
    eventCategory: EventCategory,
    eventData?: Record<string, any>
  ) {
    const deviceInfo = this.getDeviceInfo()
    const utmParams = this.getUtmParams()

    const payload: AnalyticsEventData = {
      userId: this.userId,
      eventType,
      eventCategory,
      eventData,
      sessionId: this.sessionId,
      ...deviceInfo,
      ...utmParams,
    }

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  async trackPageView(page: string, title?: string) {
    await this.trackEvent('page_view', 'PAGE_VIEW', {
      page,
      title,
      timestamp: new Date().toISOString(),
    })
  }

  async trackFeatureUse(featureName: string, featureData?: Record<string, any>) {
    await this.trackEvent(featureName as EventType, 'FEATURE_USE', {
      feature: featureName,
      ...featureData,
      timestamp: new Date().toISOString(),
    })
  }

  async trackConversion(conversionType: string, value?: number, metadata?: Record<string, any>) {
    await this.trackEvent(conversionType as EventType, 'CONVERSION', {
      type: conversionType,
      value,
      ...metadata,
      timestamp: new Date().toISOString(),
    })
  }

  async trackRevenue(amount: number, currency: string, metadata?: Record<string, any>) {
    await this.trackEvent('payment_success', 'REVENUE', {
      amount,
      currency,
      ...metadata,
      timestamp: new Date().toISOString(),
    })
  }

  async endSession() {
    const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000)
    await this.trackEvent('session_end', 'ENGAGEMENT', {
      duration,
      timestamp: new Date().toISOString(),
    })
  }

  private getDeviceInfo() {
    if (typeof window === 'undefined') return {}

    const ua = navigator.userAgent
    let deviceType = 'desktop'
    let browser = 'unknown'
    let os = 'unknown'

    // Detect device type
    if (/mobile/i.test(ua)) deviceType = 'mobile'
    else if (/tablet/i.test(ua)) deviceType = 'tablet'

    // Detect browser
    if (/chrome/i.test(ua)) browser = 'Chrome'
    else if (/firefox/i.test(ua)) browser = 'Firefox'
    else if (/safari/i.test(ua)) browser = 'Safari'
    else if (/edge/i.test(ua)) browser = 'Edge'

    // Detect OS
    if (/windows/i.test(ua)) os = 'Windows'
    else if (/mac/i.test(ua)) os = 'macOS'
    else if (/linux/i.test(ua)) os = 'Linux'
    else if (/android/i.test(ua)) os = 'Android'
    else if (/ios/i.test(ua)) os = 'iOS'

    return { deviceType, browser, os }
  }

  private getUtmParams() {
    if (typeof window === 'undefined') return {}

    const params = new URLSearchParams(window.location.search)
    return {
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      referrer: document.referrer || undefined,
    }
  }
}

// Server-side metric calculation utilities
export class MetricsCalculator {
  // Calculate Daily Active Users
  static async calculateDAU(date: Date): Promise<number> {
    // Implemented in API route
    return 0
  }

  // Calculate Weekly Active Users (last 7 days)
  static async calculateWAU(date: Date): Promise<number> {
    return 0
  }

  // Calculate Monthly Active Users (last 30 days)
  static async calculateMAU(date: Date): Promise<number> {
    return 0
  }

  // Calculate retention rate (users who returned)
  static async calculateRetentionRate(startDate: Date, endDate: Date): Promise<number> {
    return 0
  }

  // Calculate churn rate (users who left)
  static async calculateChurnRate(startDate: Date, endDate: Date): Promise<number> {
    return 0
  }

  // Calculate average session duration
  static async calculateAvgSessionDuration(date: Date): Promise<number> {
    return 0
  }

  // Calculate daily revenue
  static async calculateDailyRevenue(date: Date): Promise<number> {
    return 0
  }

  // Calculate Monthly Recurring Revenue
  static async calculateMRR(date: Date): Promise<number> {
    return 0
  }

  // Calculate conversion rate
  static async calculateConversionRate(startDate: Date, endDate: Date): Promise<number> {
    return 0
  }
}

// Privacy and compliance utilities
export class AnalyticsPrivacy {
  // Check if tracking is allowed for user
  static isTrackingAllowed(userId?: string): boolean {
    if (typeof window === 'undefined') return false

    // Check for Do Not Track
    if (navigator.doNotTrack === '1') return false

    // Check user preferences (from localStorage or user settings)
    const preferences = localStorage.getItem('analytics_preferences')
    if (preferences) {
      const { analyticsEnabled } = JSON.parse(preferences)
      return analyticsEnabled !== false
    }

    return true
  }

  // Anonymize IP address for GDPR compliance
  static anonymizeIP(ip: string): string {
    const parts = ip.split('.')
    if (parts.length === 4) {
      // IPv4: mask last octet
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`
    }
    // IPv6: mask last 80 bits
    const ipv6Parts = ip.split(':')
    return ipv6Parts.slice(0, 3).join(':') + '::0'
  }

  // Get consent status
  static getConsentStatus(): {
    analytics: boolean
    marketing: boolean
    necessary: boolean
  } {
    if (typeof window === 'undefined') {
      return { analytics: false, marketing: false, necessary: true }
    }

    const consent = localStorage.getItem('cookie_consent')
    if (consent) {
      return JSON.parse(consent)
    }

    return { analytics: false, marketing: false, necessary: true }
  }

  // Set consent preferences
  static setConsent(preferences: {
    analytics: boolean
    marketing: boolean
    necessary: boolean
  }) {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences))
  }

  // Clear user data for GDPR right to be forgotten
  static async deleteUserData(userId: string): Promise<void> {
    await fetch(`/api/analytics/user/${userId}`, {
      method: 'DELETE',
    })
  }

  // Export user data for GDPR data portability
  static async exportUserData(userId: string): Promise<any> {
    const res = await fetch(`/api/analytics/user/${userId}/export`)
    return await res.json()
  }
}

// Real-time analytics utilities
export class RealtimeAnalytics {
  private ws: WebSocket | null = null
  private reconnectTimeout: number = 1000
  private maxReconnectTimeout: number = 30000

  connect(userId?: string) {
    if (typeof window === 'undefined') return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/analytics/realtime`

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('Analytics WebSocket connected')
      this.reconnectTimeout = 1000

      // Send authentication if userId provided
      if (userId) {
        this.ws?.send(JSON.stringify({ type: 'auth', userId }))
      }
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleRealtimeUpdate(data)
    }

    this.ws.onerror = (error) => {
      console.error('Analytics WebSocket error:', error)
    }

    this.ws.onclose = () => {
      console.log('Analytics WebSocket disconnected')
      this.reconnect()
    }
  }

  private reconnect() {
    setTimeout(() => {
      console.log('Reconnecting to analytics WebSocket...')
      this.connect()
      this.reconnectTimeout = Math.min(
        this.reconnectTimeout * 2,
        this.maxReconnectTimeout
      )
    }, this.reconnectTimeout)
  }

  private handleRealtimeUpdate(data: any) {
    // Emit custom event for components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('analytics-update', { detail: data })
      )
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
}

// Feature usage tracking helpers
export const trackFeature = {
  websiteCreated: (websiteId: string) => {
    const tracker = new AnalyticsTracker()
    tracker.trackFeatureUse('website_created', { websiteId })
  },

  websitePublished: (websiteId: string, domain?: string) => {
    const tracker = new AnalyticsTracker()
    tracker.trackFeatureUse('website_published', { websiteId, domain })
  },

  designCreated: (designId: string, type: string) => {
    const tracker = new AnalyticsTracker()
    tracker.trackFeatureUse('design_created', { designId, type })
  },

  designExported: (designId: string, format: string) => {
    const tracker = new AnalyticsTracker()
    tracker.trackFeatureUse('design_exported', { designId, format })
  },

  aiImageGenerated: (imageId: string, model: string) => {
    const tracker = new AnalyticsTracker()
    tracker.trackFeatureUse('ai_image_generated', { imageId, model })
  },

  videoUploaded: (videoId: string, duration: number) => {
    const tracker = new AnalyticsTracker()
    tracker.trackFeatureUse('video_uploaded', { videoId, duration })
  },

  videoClipCreated: (clipId: string, platform: string) => {
    const tracker = new AnalyticsTracker()
    tracker.trackFeatureUse('video_clip_created', { clipId, platform })
  },
}

// Time-based aggregation helpers
export function getDateRange(period: 'day' | 'week' | 'month' | 'year'): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()

  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(start.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      break
    case 'month':
      start.setMonth(start.getMonth() - 1)
      start.setHours(0, 0, 0, 0)
      break
    case 'year':
      start.setFullYear(start.getFullYear() - 1)
      start.setHours(0, 0, 0, 0)
      break
  }

  return { start, end }
}

export function formatMetricValue(value: number, metricType: MetricType): string {
  switch (metricType) {
    case 'revenue':
    case 'mrr':
      return `£${value.toFixed(2)}`
    case 'churn_rate':
    case 'retention_rate':
    case 'conversion_rate':
      return `${(value * 100).toFixed(1)}%`
    case 'avg_session_duration':
      const mins = Math.floor(value / 60)
      const secs = Math.floor(value % 60)
      return `${mins}m ${secs}s`
    default:
      return value.toLocaleString()
  }
}
