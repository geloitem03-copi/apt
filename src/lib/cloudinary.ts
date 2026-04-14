'use client'

import { CldUploadWidget } from 'next-cloudinary'

let cloudinaryLoaded = false

export async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'rental-app')
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Upload error:', error)
    return null
  }
}