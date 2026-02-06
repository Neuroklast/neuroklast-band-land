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
    <section className="py-24 px-4 bg-gradient-to-b from-background via-background to-secondary/5" id="gigs">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            UPCOMING SHOWS
          </motion.h2>
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

        <Separator className="bg-gradient-to-r from-primary via-primary/50 to-transparent mb-12 h-0.5" />

        {upcomingGigs.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <CalendarDots size={64} className="mx-auto mb-6 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg mb-2">No upcoming shows scheduled.</p>
            <p className="text-muted-foreground text-sm">Check back soon for tour dates.</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {upcomingGigs.map((gig, index) => (
              <motion.div
                key={gig.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <CalendarDots size={28} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <time className="text-lg md:text-xl font-semibold text-foreground/90 block mb-2">
                            {format(new Date(gig.date), 'EEEE, MMMM d, yyyy')}
                          </time>
                          <time className="text-sm text-muted-foreground">
                            {format(new Date(gig.date), 'HH:mm')}
                          </time>
                        </div>
                      </div>
                      
                      <div className="pl-12">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">{gig.venue}</h3>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin size={18} />
                          <span className="text-sm md:text-base">{gig.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                      {editMode && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingGig(gig)}
                            className="border-primary/30 hover:bg-primary/10"
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
                          className="bg-primary hover:bg-accent transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
                        >
                          <a href={gig.ticketUrl} target="_blank" rel="noopener noreferrer">
                            <Ticket className="mr-2" size={20} />
                            GET TICKETS
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
