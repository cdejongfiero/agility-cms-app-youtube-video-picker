'use client'
import { useAgilityAppSDK } from '@agility/app-sdk'
import { Video, List, Play } from 'lucide-react'

export default function HomePage() {
  const { initializing } = useAgilityAppSDK()

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading YouTube Video Picker...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-500 rounded-full p-4 mr-4">
            <Play className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            YouTube Video Picker
          </h1>
        </div>
        
        <p className="text-gray-600 mb-8 text-lg">
          Pick YouTube videos and playlists with rich metadata for Agility CMS
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <Video className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Single Video</h3>
            <p className="text-gray-600 text-sm">Select individual YouTube videos with full metadata</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="w-8 h-8 mx-auto mb-3 flex items-center justify-center">
              <Video className="w-6 h-6 text-red-500" />
              <Video className="w-6 h-6 text-red-500 -ml-2" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Multiple Videos</h3>
            <p className="text-gray-600 text-sm">Curate collections of YouTube videos</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <List className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Playlists</h3>
            <p className="text-gray-600 text-sm">Select entire YouTube playlists with metadata</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 text-sm">
            This app provides custom field types for selecting YouTube content in Agility CMS with full API integration.
          </p>
        </div>
      </div>
    </div>
  )
}
