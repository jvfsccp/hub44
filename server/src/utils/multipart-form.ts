import type { FastifyRequest } from 'fastify'

export type MultipartImage = {
  fieldname: string
  filename: string
  contentType: string
  buffer: Buffer
}

export type MultipartForm = {
  fields: Record<string, string>
  files: Record<string, MultipartImage>
}

export class MultipartFormError extends Error {}

type ReadMultipartFormOptions = {
  fileFields?: readonly string[]
}

export async function readMultipartForm(
  request: FastifyRequest,
  options: ReadMultipartFormOptions = {},
): Promise<MultipartForm> {
  if (!request.isMultipart()) {
    throw new MultipartFormError('Content-Type must be multipart/form-data')
  }

  const fileFields = new Set(options.fileFields ?? [])
  const fields: Record<string, string> = {}
  const files: Record<string, MultipartImage> = {}

  for await (const part of request.parts()) {
    if (part.type === 'file') {
      if (fileFields.size > 0 && !fileFields.has(part.fieldname)) {
        throw new MultipartFormError(`Unexpected file field: ${part.fieldname}`)
      }

      if (!part.mimetype.startsWith('image/')) {
        throw new MultipartFormError(
          `File field ${part.fieldname} must be an image`,
        )
      }

      files[part.fieldname] = {
        fieldname: part.fieldname,
        filename: part.filename,
        contentType: part.mimetype,
        buffer: await part.toBuffer(),
      }

      continue
    }

    if (part.fieldnameTruncated || part.valueTruncated) {
      throw new MultipartFormError(`Field ${part.fieldname} was truncated`)
    }

    fields[part.fieldname] = String(part.value ?? '')
  }

  return { fields, files }
}
