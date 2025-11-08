/**
 * Analytics utility for tracking user events
 * Supports Google Analytics 4 (GA4)
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Initialize Google Analytics
 * Call this once when the app loads
 */
export function initAnalytics(measurementId: string) {
  if (typeof window === "undefined" || !measurementId) {
    return;
  }

  // Load GA4 script
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  };

  // Configure GA4
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    page_path: window.location.pathname,
  });
}

/**
 * Track a page view
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("config", import.meta.env.VITE_GA_MEASUREMENT_ID || "", {
    page_path: path,
    page_title: title || document.title,
  });
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, eventParams);
}

/**
 * Track user sign up
 */
export function trackSignUp(method: string = "email") {
  trackEvent("sign_up", {
    method,
  });
}

/**
 * Track user login
 */
export function trackLogin(method: string = "email") {
  trackEvent("login", {
    method,
  });
}

/**
 * Track appointment booking
 */
export function trackBooking(params: {
  business_id?: string;
  service_id?: string;
  value?: number;
  currency?: string;
}) {
  trackEvent("book_appointment", {
    ...params,
    currency: params.currency || "USD",
  });
}

/**
 * Track appointment cancellation
 */
export function trackCancellation(params: {
  business_id?: string;
  appointment_id?: string;
}) {
  trackEvent("cancel_appointment", params);
}

/**
 * Track appointment reschedule
 */
export function trackReschedule(params: {
  business_id?: string;
  appointment_id?: string;
}) {
  trackEvent("reschedule_appointment", params);
}

/**
 * Track review submission
 */
export function trackReview(params: {
  business_id?: string;
  rating?: number;
}) {
  trackEvent("submit_review", params);
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string, filters?: Record<string, unknown>) {
  trackEvent("search", {
    search_term: searchTerm,
    ...filters,
  });
}

/**
 * Track business profile view
 */
export function trackBusinessView(businessId: string, businessName?: string) {
  trackEvent("view_business", {
    business_id: businessId,
    business_name: businessName,
  });
}

/**
 * Track service view
 */
export function trackServiceView(serviceId: string, serviceName?: string) {
  trackEvent("view_service", {
    service_id: serviceId,
    service_name: serviceName,
  });
}

/**
 * Track business creation
 */
export function trackBusinessCreation(method: "manual" | "ai") {
  trackEvent("create_business", {
    method,
  });
}

/**
 * Track error
 */
export function trackError(error: Error, context?: Record<string, unknown>) {
  trackEvent("exception", {
    description: error.message,
    fatal: false,
    ...context,
  });
}


