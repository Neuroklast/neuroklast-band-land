import { motion } from 'framer-motion'
import { CalendarDots, MapPin, Ticket, Plus, Trash } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Gig } from '@/lib/types'
import { useState } from 'react'
import GigEditDialog from './GigEditDialog'
import { format, isPast } from 'date-fns'

interface GigsSectionProps {
  gigs: Gig[]
  editMode: boolean
  onUpdate: (gigs: Gig[]) => void
}

export default function GigsSection({ gigs, editMode, onUpdate }: GigsSectionProps) {
  const [editingGig, setEditingGig] = useState<Gig | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const upcomingGigs = gigs
    .filter(gig => !isPast(new Date(gig.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const handleDelete = (id: string) => {
    onUpdate(gigs.filter(g => g.id !== id))
  }

  const handleSave = (gig: Gig) => {
    if (editingGig) {
      onUpdate(gigs.map(g => g.id === gig.id ? gig : g))
    } else {
      onUpdate([...gigs, gig])
    }
    setEditingGig(null)
    setIsAdding(false)
  }

  return (
    <section className="py-20 px-4" id="gigs">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl md:text-5xl font-bold">UPCOMING SHOWS</h2>
          {editMode && (
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-primary hover:bg-accent"
            >
              <Plus className="mr-2" size={20} />
              Add Gig
            </Button>
          )}
        </div>

        <Separator className="bg-primary mb-12" />

        {upcomingGigs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No upcoming shows scheduled.</p>
            <p className="text-muted-foreground text-sm mt-2">Check back soon for tour dates.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {upcomingGigs.map((gig, index) => (
              <motion.div
                key={gig.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="p-6 bg-card border-border hover:border-primary transition-all duration-300 group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <CalendarDots size={24} className="text-primary" />
                        <time className="text-lg font-semibold">
                          {format(new Date(gig.date), 'MMMM d, yyyy · HH:mm')}
                        </time>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-2">{gig.venue}</h3>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={18} />
                        <span>{gig.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {editMode && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingGig(gig)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(gig.id)}
                          >
                            <Trash size={18} />
                          </Button>
                        </>
                      )}
                      {gig.ticketUrl && !editMode && (
                        <Button
                          asChild
                          className="bg-primary hover:bg-accent"
                        >
                          <a href={gig.ticketUrl} target="_blank" rel="noopener noreferrer">
                            <Ticket className="mr-2" size={20} />
                            Tickets
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {(editingGig || isAdding) && (
        <GigEditDialog
          gig={editingGig}
          onSave={handleSave}
          onClose={() => {
            setEditingGig(null)
            setIsAdding(false)
          }}
        />
      )}
    </section>
  )
}
