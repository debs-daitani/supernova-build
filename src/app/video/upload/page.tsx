'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function UploadVideoPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Validate file size (max 2GB)
      if (selectedFile.size > 2 * 1024 * 1024 * 1024) {
        alert('File too large. Maximum size is 2GB.')
        return
      }

      setFile(selectedFile)
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)

    try {
      // TODO: Implement actual file upload to cloud storage
      // Mock progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setProgress(i)
      }

      // Create video record
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          originalUrl: 'https://placeholder.com/video.mp4', // TODO: actual URL
          duration: 0,
          width: 1920,
          height: 1080,
          fileSize: file.size,
          format: file.type.split('/')[1].toUpperCase(),
        }),
      })

      const video = await res.json()
      router.push(`/video/${video.id}`)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Upload Video
          </h1>
          <p className="text-gray-600">Upload a video to edit and repurpose for social media</p>
        </div>

        <Card className="p-8">
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-pink-400 transition-colors">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Drag and drop video here</p>
              <p className="text-sm text-gray-500 mb-4">or click to browse (MP4, MOV, AVI - max 2GB)</p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white" asChild>
                  <span>Select File</span>
                </Button>
              </label>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <File className="w-10 h-10 text-purple-500" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)} disabled={uploading}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-6">
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title..."
                  className="mt-2"
                  disabled={uploading}
                />
              </div>

              {uploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Uploading...</span>
                    <span className="text-sm text-gray-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={uploading || !title.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </div>
          )}
        </Card>

        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-2">Supported formats: MP4, MOV, AVI</p>
          <p className="mb-2">Maximum file size: 2GB</p>
          <p>After upload, video will be processed and ready for editing in 1-5 minutes</p>
        </div>
      </div>
    </div>
  )
}
