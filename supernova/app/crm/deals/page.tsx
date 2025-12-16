'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, PoundSterling } from 'lucide-react'

const STAGES = [
  { id: 'LEAD', name: 'Lead', color: 'neon-lime' },
  { id: 'QUALIFIED', name: 'Qualified', color: 'light-teal' },
  { id: 'PROPOSAL', name: 'Proposal', color: 'blue-400' },
  { id: 'NEGOTIATION', name: 'Negotiation', color: 'purple-400' },
  { id: 'WON', name: 'Won', color: 'green-400' },
  { id: 'LOST', name: 'Lost', color: 'red-400' },
]

export default function DealsPage() {
  const router = useRouter()
  const [dealsByStage, setDealsByStage] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/crm/deals')
      if (response.ok) {
        const data = await response.json()
        setDealsByStage(data.dealsByStage)
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const dealId = active.id as string
    const newStage = over.id as string

    try {
      const response = await fetch(`/api/crm/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })

      if (response.ok) {
        fetchDeals()
      }
    } catch (error) {
      console.error('Failed to update deal stage:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading deals...</div>
      </div>
    )
  }

  const totalValue = Object.values(dealsByStage)
    .flat()
    .reduce((sum: number, deal: any) => sum + (deal.stage !== 'LOST' ? deal.value : 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-supernova text-light-teal">Deal Pipeline</h2>
          <p className="text-sm text-gray-400 font-josefin">
            Total Pipeline Value: ${totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {STAGES.map((stage) => {
            const deals = dealsByStage[stage.id] || []
            const stageValue = deals.reduce((sum: number, deal: any) => sum + deal.value, 0)

            return (
              <div key={stage.id} className="flex flex-col min-h-[500px]">
                {/* Stage Header */}
                <div className={`backdrop-blur-xl bg-white/10 rounded-t-2xl border border-${stage.color}/20 p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-supernova text-${stage.color}`}>{stage.name}</h3>
                    <span className="text-xs text-gray-400 font-josefin">{deals.length}</span>
                  </div>
                  <div className="text-sm font-josefin text-gray-300">
                    ${stageValue.toLocaleString()}
                  </div>
                </div>

                {/* Droppable Zone */}
                <SortableContext
                  id={stage.id}
                  items={deals.map((d: any) => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="backdrop-blur-xl bg-white/5 rounded-b-2xl border-x border-b border-light-teal/20 p-3 space-y-3 flex-1 overflow-y-auto">
                    {deals.map((deal: any) => (
                      <div
                        key={deal.id}
                        draggable
                        onClick={() => router.push(`/crm/deals/${deal.id}`)}
                        className="p-4 rounded-lg bg-black/50 border border-white/10 hover:border-light-teal/50 cursor-pointer transition-all"
                      >
                        <div className="font-josefin text-white mb-2">{deal.title}</div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-hot-pink font-semibold font-josefin">
                            ${deal.value.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 font-josefin">
                            {deal.probability}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 font-josefin">
                          {deal.contact.name}
                        </div>
                      </div>
                    ))}

                    {deals.length === 0 && (
                      <div className="text-center text-gray-500 font-josefin text-sm py-8">
                        No deals
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            )
          })}
        </div>
      </DndContext>
    </div>
  )
}
