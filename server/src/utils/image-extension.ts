export function getImageExtension(contentType: string) {
  const extensionsByContentType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
  }

  return extensionsByContentType[contentType] ?? 'bin'
}
