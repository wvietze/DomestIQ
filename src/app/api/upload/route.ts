import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Allowed MIME types and their max sizes in bytes.
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_DOC_TYPES = ['application/pdf']
const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Valid storage buckets.
 */
const VALID_BUCKETS = ['avatars', 'documents', 'chat-media']

/**
 * POST /api/upload
 * Handle file uploads to Supabase Storage.
 * Accept multipart form data with fields: file, bucket.
 * Validates file type and size. Returns public URL.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = formData.get('bucket') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!bucket || !VALID_BUCKETS.includes(bucket)) {
      return NextResponse.json(
        {
          error: `Invalid bucket. Must be one of: ${VALID_BUCKETS.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALL_ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Allowed types: ${ALL_ALLOWED_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate file size
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE
    const maxSizeLabel = isImage ? '5MB' : '10MB'

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSizeLabel}` },
        { status: 400 }
      )
    }

    // Generate a unique file path
    const fileExtension = file.name.split('.').pop() || 'bin'
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const filePath = `${user.id}/${timestamp}-${randomSuffix}.${fileExtension}`

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return NextResponse.json(
      {
        url: publicUrl,
        path: filePath,
        bucket,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
