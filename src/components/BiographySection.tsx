import { motion, useInView } from 'framer-motion'
import { PencilSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import BiographyEditDialog from '@/components/BiographyEditDialog'
import { useState, useRef } from 'react'
import type { Biography } from '@/lib/types'
import bandPhotoAI from '@/assets/images/NK_AI.jpeg'

interface BiographySectionProps {
  biography?: Biography
  editMode?: boolean
  onUpdate?: (biography: Biography) => void
}

const defaultBiography: Biography = {
  story: `Neuroklast is hard techno, industrial, DnB, dark electro, whatever breaks the surface. It’s noisy, heavy, emotional, sometimes a bit fucked up; just like life. We started this in 2020. Not to fit into a scene, but to build something that feels real. There's a story behind it. A visual world. A lot of weird lore. It's not just for show, but it’s part of how we deal with things. Mental health is a big one. Inner shit. No masks. No fake shit. Operating under the darkTunes banner and the mastering of  we continue to develop our sound, we're not stuck to genres. A Neuroklast show is loud, physical and dark, but there’s space in it. It’s not about being brutal all the time. It’s about honesty. If it leaves a mark, good. If not, that’s fine too. This isn’t for everyone. And it’s not trying to be.
`,
  founded: '2020',
  achievements: []
}

export default function BiographySection({ biography = defaultBiography, editMode, onUpdate }: BiographySectionProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  const handleUpdate = (updatedBiography: Biography) => {
    onUpdate?.(updatedBiography)
    setIsEditDialogOpen(false)
  }

  return (
    <section id="biography" ref={sectionRef} className="relative py-20 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
            <motion.h2 
              className="text-4xl md:text-5xl text-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              BIOGRAPHY
            </motion.h2>
            {editMode && (
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2 active:scale-95 transition-transform touch-manipulation w-full sm:w-auto"
              >
                <PencilSimple size={16} />
                Edit
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="md:col-span-2 space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <motion.div
                className="relative overflow-hidden rounded-lg aspect-square md:aspect-video group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={bandPhotoAI}
                  alt="NEUROKLAST AI"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 transition-colors duration-300 rounded-lg" />
              </motion.div>

              <Card className="bg-card border-border p-4 md:p-8 hover:border-primary/50 active:border-primary transition-all duration-300 touch-manipulation">
                <div className="prose prose-invert max-w-none">
                  {biography.story.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-sm md:text-base text-foreground/90 leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Card>
            </motion.div>

            <div className="space-y-6">
              {biography.founded && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  <Card className="bg-card border-border p-6 hover:border-primary/50 transition-colors duration-300">
                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
                      Founded
                    </h3>
                    <p className="text-2xl font-heading text-primary">{biography.founded}</p>
                  </Card>
                </motion.div>
              )}

              {biography.members && biography.members.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                >
                  <Card className="bg-card border-border p-6 hover:border-primary/50 transition-colors duration-300">
                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                      Members
                    </h3>
                    <ul className="space-y-2">
                      {biography.members.map((member, index) => (
                        <li key={index} className="text-foreground/90">
                          {member}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              )}

              {biography.achievements && biography.achievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                >
                  <Card className="bg-card border-border p-6 hover:border-primary/50 transition-colors duration-300">
                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                      Achievements
                    </h3>
                    <ul className="space-y-3">
                      {biography.achievements.map((achievement, index) => (
                        <li key={index} className="text-foreground/90 text-sm flex gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="flex-1">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {editMode && (
        <BiographyEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          biography={biography}
          onSave={handleUpdate}
        />
      )}
    </section>
  )
}
