import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { file, folder } = body

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, folder || 'coci')

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { publicId } = body

    if (!publicId) {
      return NextResponse.json(
        { error: 'No public ID provided' },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(publicId)

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}

