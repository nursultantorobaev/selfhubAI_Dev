/**
 * Sentry configuration and initialization
 * Only initializes in production or when DSN is provided
 */

import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry error tracking
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE || "development";

  // Only initialize if DSN is provided
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.info(
        "[Sentry] Not initialized - VITE_SENTRY_DSN not set. This is normal in development."
      );
    }
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Performance Monitoring
      tracesSampleRate: environment === "production" ? 0.1 : 1.0, // 10% of transactions in production

      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

      // Set sample rate for profiling
      profilesSampleRate: environment === "production" ? 0.1 : 1.0,

      // Filter out sensitive data
      beforeSend(event, hint) {
        // Don't send events in development
        if (environment === "development") {
          return null;
        }

        // Filter out sensitive information
        if (event.request) {
          // Remove sensitive headers
          if (event.request.headers) {
            delete event.request.headers.Authorization;
            delete event.request.headers.Cookie;
          }

          // Remove sensitive query params
          if (event.request.query_string) {
            const queryString = event.request.query_string;
            if (queryString.includes("token") || queryString.includes("key")) {
              event.request.query_string = "[Filtered]";
            }
          }
        }

        return event;
      },

      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        "top.GLOBALS",
        "originalCreateNotification",
        "canvas.contentDocument",
        "MyApp_RemoveAllHighlights",
        "atomicFindClose",
        "fb_xd_fragment",
        "bmi_SafeAddOnload",
        "EBCallBackMessageReceived",
        "conduitPage",
        // Network errors that are expected
        "NetworkError",
        "Failed to fetch",
        "Network request failed",
        // ResizeObserver errors (common and harmless)
        "ResizeObserver loop limit exceeded",
      ],

      // Don't send errors from browser extensions
      denyUrls: [
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        /^moz-extension:\/\//i,
      ],
    });

    if (import.meta.env.DEV) {
      console.info("[Sentry] Initialized successfully");
    }
  } catch (error) {
    console.error("[Sentry] Failed to initialize:", error);
  }
}

/**
 * Capture an exception manually
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>
) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  }
}

/**
 * Set user context for Sentry
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: "debug" | "info" | "warning" | "error" | "fatal",
  data?: Record<string, unknown>
) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      category,
      level: level || "info",
      data,
    });
  }
}


