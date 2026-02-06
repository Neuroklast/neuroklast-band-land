import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, X } from '@phosphor-icons/react'
import type { Biography } from '@/lib/types'

interface BiographyEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  biography: Biography
  onSave: (biography: Biography) => void
}

export default function BiographyEditDialog({ open, onOpenChange, biography, onSave }: BiographyEditDialogProps) {
  const [story, setStory] = useState(biography.story)
  const [founded, setFounded] = useState(biography.founded || '')
  const [members, setMembers] = useState<string[]>(biography.members || [])
  const [achievements, setAchievements] = useState<string[]>(biography.achievements || [])
  const [newMember, setNewMember] = useState('')
  const [newAchievement, setNewAchievement] = useState('')

  const handleSave = () => {
    onSave({
      story,
      founded: founded || undefined,
      members: members.length > 0 ? members : undefined,
      achievements: achievements.length > 0 ? achievements : undefined,
    })
  }

  const addMember = () => {
    if (newMember.trim()) {
      setMembers([...members, newMember.trim()])
      setNewMember('')
    }
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements([...achievements, newAchievement.trim()])
      setNewAchievement('')
    }
  }

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Biography</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="story">Band Story</Label>
            <Textarea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Tell your band's story..."
              className="min-h-[200px] resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="founded">Founded (Year)</Label>
            <Input
              id="founded"
              type="text"
              value={founded}
              onChange={(e) => setFounded(e.target.value)}
              placeholder="e.g., 2020"
            />
          </div>

          <div className="space-y-2">
            <Label>Members</Label>
            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input value={member} disabled className="flex-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  placeholder="Add member name"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                />
                <Button type="button" onClick={addMember} size="icon">
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Achievements</Label>
            <div className="space-y-2">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input value={achievement} disabled className="flex-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAchievement(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder="Add achievement"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                />
                <Button type="button" onClick={addAchievement} size="icon">
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
