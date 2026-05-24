import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

const seedImageKindSchema = z.enum(['store-logo', 'store-banner', 'product'])

export const seedImageRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/seed/images/:kind/:slug.svg',
    {
      schema: {
        summary: 'Get generated seed image asset',
        tags: ['Seed Assets'],
        params: z.object({
          kind: seedImageKindSchema,
          slug: z.string().trim().min(1),
        }),
        querystring: z.object({
          label: z.string().trim().min(1).optional(),
          variant: z.string().trim().min(1).optional(),
        }),
      },
    },
    async (request, reply) => {
      const { kind, slug } = request.params
      const label = request.query.label ?? titleizeSlug(slug)
      const variant = request.query.variant
      const svg = buildSeedImageSvg({ kind, slug, label, variant })

      return reply.type('image/svg+xml; charset=utf-8').send(svg)
    },
  )
}

function buildSeedImageSvg(input: {
  kind: z.infer<typeof seedImageKindSchema>
  slug: string
  label: string
  variant?: string
}) {
  const isLogo = input.kind === 'store-logo'
  const isBanner = input.kind === 'store-banner'
  const width = isLogo ? 512 : isBanner ? 1200 : 900
  const height = isLogo ? 512 : isBanner ? 480 : 900
  const palette = getPalette(input.slug)
  const escapedLabel = escapeXml(input.label)
  const escapedVariant = escapeXml(
    (input.variant ?? 'Hub44 seed').toUpperCase(),
  )
  const mainText = isLogo ? getInitials(input.label) : escapedLabel
  const titleSize = isLogo ? 132 : isBanner ? 72 : 56
  const subtitleSize = isLogo ? 28 : isBanner ? 30 : 28
  const titleY = isLogo ? 290 : isBanner ? 255 : 485
  const subtitleY = isLogo ? 350 : isBanner ? 318 : 552

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapedLabel}</title>
  <desc id="desc">Generated Hub44 seed image</desc>
  <rect width="${width}" height="${height}" fill="${palette.background}"/>
  <path d="M0 0h${width}v${Math.round(height * 0.36)}L0 ${Math.round(height * 0.62)}Z" fill="${palette.accent}" opacity="0.22"/>
  <path d="M${Math.round(width * 0.58)} 0h${Math.round(width * 0.42)}v${height}H${Math.round(width * 0.76)}Z" fill="${palette.foreground}" opacity="0.08"/>
  <rect x="${Math.round(width * 0.08)}" y="${Math.round(height * 0.14)}" width="${Math.round(width * 0.84)}" height="${Math.round(height * 0.72)}" rx="${isLogo ? 56 : 38}" fill="#ffffff" opacity="0.88"/>
  <text x="50%" y="${titleY}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${titleSize}" font-weight="800" fill="${palette.foreground}">${mainText}</text>
  <text x="50%" y="${subtitleY}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${subtitleSize}" font-weight="700" letter-spacing="4" fill="${palette.muted}">${escapedVariant}</text>
</svg>`
}

function getPalette(slug: string) {
  const palettes = [
    {
      background: '#f6f8fb',
      foreground: '#003f75',
      accent: '#f97316',
      muted: '#5f6f86',
    },
    {
      background: '#fff7ed',
      foreground: '#7c2d12',
      accent: '#2563eb',
      muted: '#9a3412',
    },
    {
      background: '#f0fdf4',
      foreground: '#14532d',
      accent: '#f59e0b',
      muted: '#166534',
    },
    {
      background: '#f8fafc',
      foreground: '#334155',
      accent: '#0f766e',
      muted: '#64748b',
    },
    {
      background: '#fdf2f8',
      foreground: '#831843',
      accent: '#1d4ed8',
      muted: '#9d174d',
    },
  ]

  return palettes[hashString(slug) % palettes.length]
}

function hashString(value: string) {
  let hash = 0

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return hash
}

function getInitials(label: string) {
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return escapeXml(initials || 'H44')
}

function titleizeSlug(slug: string) {
  return slug
    .replace(/\.svg$/i, '')
    .split('-')
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ')
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}
