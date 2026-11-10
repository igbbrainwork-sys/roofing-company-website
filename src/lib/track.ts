/**
 * Typed Whop Pixel Event Tracking Wrapper
 *
 * Wraps window.whop.track according to Whop Developer Docs:
 * https://docs.whop.com/developer/websites/tracking
 *
 * Guarantees:
 * 1. Safe no-op if window.whop or window.whop.track is unavailable
 * 2. Mandatory or generated event_id for idempotent event delivery
 * 3. Verbose console logging in dev
 * 4. In-memory event audit log dispatched via CustomEvent for the on-page debug drawer (?debug=1)
 */

declare global {
  interface Window {
    whop?: {
      track: (eventName: string, properties?: Record<string, unknown>, eventId?: string) => void;
      [key: string]: unknown;
    };
  }
}

export interface TrackedEventRecord {
  id: string;
  name: string;
  properties: Record<string, unknown>;
  eventId: string;
  timestamp: string;
  source: 'whop_pixel' | 'debug_recorder';
}

const eventLog: TrackedEventRecord[] = [];
const subscribers = new Set<(events: TrackedEventRecord[]) => void>();

/**
 * Returns current session ID or generates a persistent one in sessionStorage.
 */
export function getTrackingSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  try {
    let sid = window.sessionStorage.getItem('whop_roofing_sid');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      window.sessionStorage.setItem('whop_roofing_sid', sid);
    }
    return sid;
  } catch {
    return 'fallback_session';
  }
}

/**
 * Subscribe to tracking events (used by the debug drawer).
 */
export function subscribeToTrackedEvents(callback: (events: TrackedEventRecord[]) => void): () => void {
  subscribers.add(callback);
  callback([...eventLog]);
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Core tracking call that logs, notifies subscribers, and invokes window.whop.track safely.
 */
export function trackWhopEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  eventId?: string
): void {
  const finalEventId = eventId || `${eventName}:${Date.now()}:${Math.random().toString(36).substring(2, 7)}`;
  const record: TrackedEventRecord = {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    name: eventName,
    properties,
    eventId: finalEventId,
    timestamp: new Date().toLocaleTimeString(),
    source: typeof window !== 'undefined' && window.whop?.track ? 'whop_pixel' : 'debug_recorder',
  };

  eventLog.unshift(record);
  if (eventLog.length > 50) eventLog.pop();
  subscribers.forEach((sub) => {
    try {
      sub([...eventLog]);
    } catch {
      // ignore subscriber error
    }
  });

  if (import.meta.env.DEV) {
    console.info(`[Whop Pixel] track("${eventName}", payload=`, properties, `event_id="${finalEventId}")`);
  }

  if (typeof window !== 'undefined' && window.whop && typeof window.whop.track === 'function') {
    try {
      window.whop.track(eventName, properties, finalEventId);
    } catch (err) {
      console.warn('[Whop Pixel] error dispatching track event:', err);
    }
  }
}

/**
 * Fired when a roofing service card comes into view (IntersectionObserver)
 * or when the user clicks through to service details.
 */
export function trackServiceViewed(serviceSlug: string, trigger: 'scroll' | 'click' = 'scroll'): void {
  const sid = getTrackingSessionId();
  const eventId = `service_viewed:${serviceSlug}:${sid}`;
  trackWhopEvent('service_viewed', {
    service: serviceSlug,
    trigger,
    session_id: sid,
  }, eventId);
}

/**
 * Fired upon successful estimate request submission.
 */
export function trackEstimateRequested(data: {
  service: string;
  startingPrice?: number;
  leadId: string;
}): void {
  trackWhopEvent('estimate_requested', {
    service: data.service,
    value: data.startingPrice ?? 0,
    currency: 'USD',
  }, data.leadId);
}

/**
 * Fired when a customer mounts or begins the project deposit checkout.
 */
export function trackDepositStarted(valueUSD: number = 500): void {
  const sid = getTrackingSessionId();
  const eventId = `deposit_started:${sid}:${Date.now()}`;
  trackWhopEvent('deposit_started', {
    value: valueUSD,
    currency: 'USD',
    session_id: sid,
  }, eventId);
}
