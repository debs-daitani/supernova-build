'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Save,
  Download,
  Undo,
  Redo,
  Type,
  Image,
  Square,
  Circle,
  Minus,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  ZoomIn,
  ZoomOut,
  Layers,
  Upload,
  Palette,
  Settings,
  ChevronLeft,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Design {
  id: string
  name: string
  width: number
  height: number
  jsonData: any
}

// This will use Fabric.js when installed
// For now, we'll create the UI structure and placeholder functionality
export default function CanvasEditorPage() {
  const router = useRouter()
  const params = useParams()
  const designId = params.id as string

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<any>(null)

  const [design, setDesign] = useState<Design | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [selectedObject, setSelectedObject] = useState<any>(null)
  const [zoom, setZoom] = useState(100)
  const [showLayersPanel, setShowLayersPanel] = useState(true)
  const [brandKit, setBrandKit] = useState<any>(null)

  useEffect(() => {
    fetchDesign()
    fetchBrandKit()
  }, [designId])

  useEffect(() => {
    if (design && canvasRef.current) {
      initializeCanvas()
    }
  }, [design])

  const fetchDesign = async () => {
    try {
      const res = await fetch(`/api/designs/${designId}`)
      const data = await res.json()
      setDesign(data)
    } catch (error) {
      console.error('Error fetching design:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBrandKit = async () => {
    try {
      const res = await fetch('/api/brand-kit')
      const data = await res.json()
      setBrandKit(data)
    } catch (error) {
      console.error('Error fetching brand kit:', error)
    }
  }

  const initializeCanvas = () => {
    // TODO: Initialize Fabric.js canvas
    // const canvas = new fabric.Canvas(canvasRef.current, {
    //   width: design.width,
    //   height: design.height,
    //   backgroundColor: '#ffffff',
    // })
    // fabricCanvasRef.current = canvas
    // if (design.jsonData) {
    //   canvas.loadFromJSON(design.jsonData, () => {
    //     canvas.renderAll()
    //   })
    // }
    console.log('Canvas initialized (Fabric.js integration pending)')
  }

  const saveDesign = async () => {
    if (!design) return

    setSaving(true)
    try {
      // TODO: Get canvas JSON from Fabric.js
      // const canvasJSON = fabricCanvasRef.current?.toJSON()

      await fetch(`/api/designs/${designId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: design.name,
          // jsonData: canvasJSON,
        }),
      })

      alert('Design saved successfully!')
    } catch (error) {
      console.error('Error saving design:', error)
      alert('Failed to save design. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const exportDesign = async (format: 'png' | 'jpg' | 'pdf') => {
    // TODO: Export canvas using Fabric.js
    // const dataURL = fabricCanvasRef.current?.toDataURL({
    //   format: format === 'jpg' ? 'jpeg' : format,
    //   quality: 1,
    // })
    // Download the image
    console.log(`Export as ${format} (pending Fabric.js integration)`)
  }

  const addText = () => {
    // TODO: Add text using Fabric.js
    // const text = new fabric.Textbox('Double-click to edit', {
    //   left: 100,
    //   top: 100,
    //   fontSize: 32,
    //   fontFamily: brandKit?.primaryFont || 'Inter',
    //   fill: brandKit?.colors?.[0] || '#000000',
    // })
    // fabricCanvasRef.current?.add(text)
    console.log('Add text (pending Fabric.js integration)')
  }

  const addShape = (shape: 'rectangle' | 'circle' | 'line') => {
    // TODO: Add shape using Fabric.js
    console.log(`Add ${shape} (pending Fabric.js integration)`)
  }

  const addImage = async () => {
    // TODO: Add image upload functionality
    console.log('Add image (pending implementation)')
  }

  const deleteSelected = () => {
    // TODO: Delete selected object using Fabric.js
    // fabricCanvasRef.current?.remove(fabricCanvasRef.current.getActiveObject())
    console.log('Delete selected (pending Fabric.js integration)')
  }

  const duplicateSelected = () => {
    // TODO: Duplicate selected object using Fabric.js
    console.log('Duplicate selected (pending Fabric.js integration)')
  }

  const undo = () => {
    // TODO: Implement undo using Fabric.js history
    console.log('Undo (pending implementation)')
  }

  const redo = () => {
    // TODO: Implement redo using Fabric.js history
    console.log('Redo (pending implementation)')
  }

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? Math.min(zoom + 10, 200) : Math.max(zoom - 10, 25)
    setZoom(newZoom)
    // TODO: Apply zoom to Fabric.js canvas
    // fabricCanvasRef.current?.setZoom(newZoom / 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading design...</p>
        </div>
      </div>
    )
  }

  if (!design) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Design not found</h2>
          <Link href="/design/my-designs">
            <Button>Back to My Designs</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/design/my-designs">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="border-l border-gray-300 h-6"></div>
          <Input
            value={design.name}
            onChange={(e) => setDesign({ ...design, name: e.target.value })}
            className="w-64"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={undo}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={redo}>
            <Redo className="w-4 h-4" />
          </Button>
          <div className="border-l border-gray-300 h-6 mx-2"></div>
          <Button variant="outline" size="sm" onClick={() => exportDesign('png')}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            size="sm"
            onClick={saveDesign}
            disabled={saving}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2">
          <Button
            variant={selectedTool === 'text' ? 'default' : 'ghost'}
            size="icon"
            onClick={addText}
            title="Add Text"
          >
            <Type className="w-5 h-5" />
          </Button>
          <Button
            variant={selectedTool === 'image' ? 'default' : 'ghost'}
            size="icon"
            onClick={addImage}
            title="Add Image"
          >
            <Image className="w-5 h-5" />
          </Button>
          <Button
            variant={selectedTool === 'rectangle' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => addShape('rectangle')}
            title="Add Rectangle"
          >
            <Square className="w-5 h-5" />
          </Button>
          <Button
            variant={selectedTool === 'circle' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => addShape('circle')}
            title="Add Circle"
          >
            <Circle className="w-5 h-5" />
          </Button>
          <Button
            variant={selectedTool === 'line' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => addShape('line')}
            title="Add Line"
          >
            <Minus className="w-5 h-5" />
          </Button>
          <div className="border-t border-gray-300 w-full my-2"></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLayersPanel(!showLayersPanel)}
            title="Layers"
          >
            <Layers className="w-5 h-5" />
          </Button>
          <Link href="/design/uploads">
            <Button variant="ghost" size="icon" title="Uploads">
              <Upload className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/design/brand-kit">
            <Button variant="ghost" size="icon" title="Brand Kit">
              <Palette className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 overflow-auto p-8">
          <div className="relative">
            {/* Canvas */}
            <div
              className="bg-white shadow-2xl"
              style={{
                width: design.width,
                height: design.height,
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
              }}
            >
              <canvas ref={canvasRef} />
              {/* Placeholder content */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                <div className="text-center">
                  <Type className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Fabric.js integration pending</p>
                  <p className="text-xs mt-2">Canvas editor will be functional after installing fabric</p>
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-lg p-2">
              <Button variant="ghost" size="sm" onClick={() => handleZoom('out')}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="sm" onClick={() => handleZoom('in')}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          {selectedObject ? (
            <div className="p-4">
              <h3 className="font-bold mb-4">Object Properties</h3>

              {/* Text Properties */}
              {selectedObject.type === 'textbox' && (
                <div className="space-y-4">
                  <div>
                    <Label>Font Family</Label>
                    <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                      <option>Inter</option>
                      <option>Montserrat</option>
                      <option>Roboto</option>
                    </select>
                  </div>
                  <div>
                    <Label>Font Size</Label>
                    <Input type="number" defaultValue={32} className="mt-1" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Underline className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Common Properties */}
              <div className="space-y-4 mt-6">
                <div>
                  <Label>Fill Color</Label>
                  <Input type="color" defaultValue="#ec4899" className="mt-1 h-10" />
                </div>
                <div>
                  <Label>Opacity</Label>
                  <Input type="range" min="0" max="100" defaultValue="100" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Width</Label>
                    <Input type="number" defaultValue="200" className="mt-1" />
                  </div>
                  <div>
                    <Label>Height</Label>
                    <Input type="number" defaultValue="100" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>X Position</Label>
                    <Input type="number" defaultValue="100" className="mt-1" />
                  </div>
                  <div>
                    <Label>Y Position</Label>
                    <Input type="number" defaultValue="100" className="mt-1" />
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={duplicateSelected}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={deleteSelected}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <h3 className="font-bold mb-4">Design Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <Label className="text-gray-600">Dimensions</Label>
                  <p className="font-medium">{design.width} × {design.height} px</p>
                </div>
                <div>
                  <Label className="text-gray-600">Name</Label>
                  <p className="font-medium">{design.name}</p>
                </div>
              </div>

              {/* Brand Colors */}
              {brandKit?.colors && brandKit.colors.length > 0 && (
                <div className="mt-6">
                  <Label className="mb-3 block">Brand Colors</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {brandKit.colors.map((color: string) => (
                      <button
                        key={color}
                        className="aspect-square rounded-lg border-2 border-gray-200 hover:border-pink-400 transition-colors"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Export Options */}
              <div className="mt-6">
                <Label className="mb-3 block">Export Options</Label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => exportDesign('png')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export as PNG
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => exportDesign('jpg')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export as JPG
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => exportDesign('pdf')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
