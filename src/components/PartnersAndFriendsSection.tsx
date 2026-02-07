import { motion, useInView } from 'framer-motion'
import { PencilSimple, User, Plus, Trash, InstagramLogo, FacebookLogo, SpotifyLogo, SoundcloudLogo, YoutubeLogo, MusicNote, Globe, Link } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import ProgressiveImage from '@/components/ProgressiveImage'
import { useState, useRef } from 'react'
import { useTypingEffect } from '@/hooks/use-typing-effect'
import { ChromaticText } from '@/components/ChromaticText'
import type { Friend } from '@/lib/types'
import { toDirectImageUrl } from '@/lib/image-cache'

interface PartnersAndFriendsSectionProps {
  friends?: Friend[]
  editMode?: boolean
  onUpdate?: (friends: Friend[]) => void
}

const friendSocialIcons: { key: keyof NonNullable<Friend['socials']>; icon: any; label: string }[] = [
  { key: 'instagram', icon: InstagramLogo, label: 'Instagram' },
  { key: 'facebook', icon: FacebookLogo, label: 'Facebook' },
  { key: 'spotify', icon: SpotifyLogo, label: 'Spotify' },
  { key: 'soundcloud', icon: SoundcloudLogo, label: 'SoundCloud' },
  { key: 'youtube', icon: YoutubeLogo, label: 'YouTube' },
  { key: 'bandcamp', icon: MusicNote, label: 'Bandcamp' },
  { key: 'website', icon: Globe, label: 'Website' },
]

function FriendCard({ friend, editMode, onUpdate, onDelete }: {
  friend: Friend
  editMode?: boolean
  onUpdate: (friend: Friend) => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(friend)

  const handleSave = () => {
    // Convert Google Drive URLs to wsrv.nl URLs before saving
    const updatedData = {
      ...editData,
      photo: editData.photo ? toDirectImageUrl(editData.photo) : editData.photo
    }
    onUpdate(updatedData)
    setIsEditing(false)
  }

  if (isEditing && editMode) {
    return (
      <Card className="bg-card border-primary/30 p-4 space-y-3">
        <div className="space-y-2">
          <div>
            <Label className="text-[10px]">Name</Label>
            <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="text-xs h-8" />
          </div>
          <div>
            <Label className="text-[10px]">Photo URL</Label>
            <Input value={editData.photo || ''} onChange={(e) => setEditData({ ...editData, photo: e.target.value })} className="text-xs h-8" placeholder="https://..." />
          </div>
          <div>
            <Label className="text-[10px]">Description</Label>
            <Input value={editData.description || ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="text-xs h-8" />
          </div>
          <div>
            <Label className="text-[10px]">Main URL</Label>
            <Input value={editData.url || ''} onChange={(e) => setEditData({ ...editData, url: e.target.value })} className="text-xs h-8" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {friendSocialIcons.map(({ key, label }) => (
              <div key={key}>
                <Label className="text-[10px]">{label}</Label>
                <Input
                  value={editData.socials?.[key] || ''}
                  onChange={(e) => setEditData({ ...editData, socials: { ...editData.socials, [key]: e.target.value } })}
                  className="text-xs h-8"
                  placeholder="https://..."
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="flex-1">Save</Button>
          <Button size="sm" variant="outline" onClick={() => { setEditData(friend); setIsEditing(false) }}>Cancel</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group hud-element hud-corner">
      <span className="corner-bl"></span>
      <span className="corner-br"></span>
      <div className="flex gap-3 p-4">
        {friend.photo ? (
          <div className="w-16 h-16 flex-shrink-0 overflow-hidden">
            <ProgressiveImage
              src={friend.photo}
              alt={friend.name}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-16 h-16 flex-shrink-0 bg-secondary/30 border border-border flex items-center justify-center">
            <User size={24} className="text-muted-foreground/40" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {friend.url ? (
                <a href={friend.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:text-primary transition-colors line-clamp-1 flex items-center gap-1">
                  {friend.name}
                  <Link size={12} className="text-primary/40 flex-shrink-0" />
                </a>
              ) : (
                <p className="text-sm font-bold line-clamp-1">{friend.name}</p>
              )}
              {friend.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{friend.description}</p>
              )}
            </div>
            {editMode && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setEditData(friend); setIsEditing(true) }} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                  <PencilSimple size={14} />
                </button>
                <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash size={14} />
                </button>
              </div>
            )}
          </div>
          {friend.socials && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {friendSocialIcons.map(({ key, icon: Icon, label }) => {
                const url = friend.socials?.[key]
                if (!url) return null
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground/60 hover:text-primary transition-colors"
                    title={label}
                  >
                    <Icon size={16} weight="fill" />
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function PartnersAndFriendsSection({ friends = [], editMode, onUpdate }: PartnersAndFriendsSectionProps) {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const titleText = 'PARTNERS & FRIENDS'
  const { displayedText: displayedTitle } = useTypingEffect(
    isInView ? titleText : '',
    50,
    100
  )

  if (!editMode && friends.length === 0) return null

  return (
    <section ref={sectionRef} className="py-20 px-4 relative" id="partners">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-mono scanline-text dot-matrix-text"
              style={{
                textShadow: '0 0 6px oklch(1 0 0 / 0.5), 0 0 12px oklch(0.50 0.22 25 / 0.3), 0 0 18px oklch(0.50 0.22 25 / 0.2)'
              }}
            >
              <ChromaticText intensity={1.5}>
                &gt; {displayedTitle}
              </ChromaticText>
              <span className="animate-pulse">_</span>
            </h2>
            {editMode && onUpdate && (
              <Button
                size="sm"
                variant="outline"
                className="border-primary/30 hover:bg-primary/10 gap-1"
                onClick={() => {
                  const newFriend: Friend = {
                    id: `friend-${Date.now()}`,
                    name: 'New Friend',
                  }
                  onUpdate([...friends, newFriend])
                }}
              >
                <Plus size={16} />
                <span className="hidden md:inline">Add</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                editMode={editMode}
                onUpdate={(updated) => {
                  if (onUpdate) {
                    onUpdate(friends.map(f => f.id === updated.id ? updated : f))
                  }
                }}
                onDelete={() => {
                  if (onUpdate) {
                    onUpdate(friends.filter(f => f.id !== friend.id))
                  }
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
