/**
 * Typed API Client
 * Provides robust network requests with timeout, retries, and structured error shapes.
 */

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  errors?: Record<string, string>;
  message?: string;
  statusCode?: number;
}

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

/**
 * Standard typed JSON fetcher with AbortController timeout and retry support
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { timeoutMs = 15000, retries = 1, headers, ...rest } = options;

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...rest,
        headers: {
          'Content-Type': 'application/json',
          ...(headers || {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        return {
          ok: false,
          statusCode: response.status,
          errors: data?.details?.fieldErrors || data?.errors || undefined,
          message: data?.error || data?.message || `Request failed with HTTP ${response.status}`,
          data,
        };
      }

      return {
        ok: true,
        statusCode: response.status,
        data,
      };
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;

      if (err.name === 'AbortError') {
        return {
          ok: false,
          message: `Request timed out after ${timeoutMs}ms. Please check your connection.`,
        };
      }

      attempt++;
      if (attempt <= retries) {
        // Exponential backoff wait (300ms)
        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }
  }

  return {
    ok: false,
    message: lastError?.message || 'Network request failed after retry.',
  };
}
