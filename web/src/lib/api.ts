const apiBaseUrl = import.meta.env?.VITE_API_URL ?? 'http://localhost:3333'
const normalizedApiBaseUrl = apiBaseUrl.replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function getAccessToken() {
  return localStorage.getItem('hub44:access-token')
}

export function setAccessToken(token: string) {
  localStorage.setItem('hub44:access-token', token)
}

export function clearAccessToken() {
  localStorage.removeItem('hub44:access-token')
}

export function resolveApiAssetUrl(url: string) {
  const normalizedUrl = url.trim()

  if (!normalizedUrl) {
    return normalizedUrl
  }

  if (/^(https?:|data:|blob:)/i.test(normalizedUrl)) {
    return normalizedUrl
  }

  if (normalizedUrl.startsWith('/')) {
    return `${normalizedApiBaseUrl}${normalizedUrl}`
  }

  return normalizedUrl
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {},
) {
  const headers = new Headers(options.headers)
  const accessToken = getAccessToken()

  if (
    options.body &&
    !headers.has('Content-Type') &&
    !(options.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json')
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${normalizedApiBaseUrl}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? 'Erro inesperado na requisicao.',
      response.status,
    )
  }

  return data as TResponse
}
