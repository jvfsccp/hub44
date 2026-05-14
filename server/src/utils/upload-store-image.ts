// src/utils/upload-store-image.ts
import { supabase, SUPABASE_BUCKET } from '../lib/supabase'

type UploadStoreImageParams = {
  fileBuffer: Buffer
  path: string
  contentType: string
}

export async function uploadStoreImage({
  fileBuffer,
  path,
  contentType,
}: UploadStoreImageParams) {
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(path, fileBuffer, {
      contentType,
      upsert: true,
    })

  if (error) {
    throw new Error(`Erro ao enviar imagem: ${error.message}`)
  }

  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path)

  return {
    path,
    publicUrl: data.publicUrl,
  }
}
