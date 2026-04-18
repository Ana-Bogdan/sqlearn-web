const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

type ApiOptions = RequestInit & { _skipRefresh?: boolean };

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

let refreshPromise: Promise<void> | null = null;

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { _skipRefresh, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${path}`;
  const csrfToken = getCsrfToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    ...(fetchOptions.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && !_skipRefresh) {
    if (!refreshPromise) {
      refreshPromise = api<void>("/auth/refresh/", {
        method: "POST",
        _skipRefresh: true,
      })
        .then(() => {})
        .finally(() => {
          refreshPromise = null;
        });
    }
    try {
      await refreshPromise;
    } catch {
      const body = await response.json().catch(() => null);
      throw new ApiError(response.status, body);
    }
    return api<T>(path, { ...options, _skipRefresh: true });
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}
