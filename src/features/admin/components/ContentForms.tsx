import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash, ArrowsDownUp, Spinner } from '@phosphor-icons/react'
import type { SiteConfig, Gig, Release, NewsItem } from '@/lib/types'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { useLocale } from '@/hooks/use-locale'

interface ContentFormsProps {
  data: SiteConfig
  onUpdate: (key: keyof SiteConfig, value: unknown) => void
}

export function ContentForms({ data, onUpdate }: ContentFormsProps) {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<'info' | 'news' | 'gigs' | 'releases' | 'contact'>('info')

  const handleBandInfoChange = (field: string, value: unknown) => {
    onUpdate(field as keyof SiteConfig, value)
  }

  const handleBioChange = (field: string, value: string) => {
    const newBio = { ...(data.biography || { story: '' }), [field]: value }
    onUpdate('biography', newBio)
  }

  // --- Gigs ---
  const syncBandsintownMutation = useMutation({
    mutationFn: async ({ appId, artistName }: { appId: string; artistName: string }) => {
      const response = await fetch(`https://rest.bandsintown.com/artists/${encodeURIComponent(artistName)}/events?app_id=${encodeURIComponent(appId)}`)
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }
      const events = await response.json()
      if (!Array.isArray(events)) {
        throw new Error('Invalid response format from Bandsintown')
      }
      return events
    },
    onSuccess: (events) => {
      const syncedGigs: Gig[] = events.map(event => ({
        id: `bit-${event.id}`,
        date: event.datetime,
        venue: event.venue?.name || 'Unknown Venue',
        location: `${event.venue?.city || ''}, ${event.venue?.country || ''}`.replace(/^, | , $/g, ''),
        ticketUrl: event.offers?.find((o: { type?: string; url?: string }) => o.type === 'Tickets')?.url || event.url,
        status: 'confirmed'
      }))

      if (syncedGigs.length > 0) {
        const manualGigs = (data.gigs || []).filter(g => !g.id.startsWith('bit-'))
        onUpdate('gigs', [...manualGigs, ...syncedGigs])
        toast.success(`Successfully synced ${syncedGigs.length} gigs from Bandsintown!`)
      } else {
        toast.info('No upcoming gigs found on Bandsintown.')
      }
    },
    onError: (error) => {
      console.error('Bandsintown sync error:', error)
      toast.error('Failed to sync gigs', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  })

  const handleSyncBandsintown = () => {
    const overrides = data.configOverrides as { integrations?: { bandsintownAppId?: string } } | undefined
    const appId = overrides?.integrations?.bandsintownAppId
    const artistName = data.siteName

    if (!appId || !artistName) {
      toast.error('Missing Bandsintown API Key or Band Name', {
        description: 'Please configure your Bandsintown App ID in System Settings > Integrations & APIs, and ensure your Band Name is set in Content > Band Info.'
      })
      return
    }

    syncBandsintownMutation.mutate({ appId, artistName })
  }

  const handleAddGig = () => {
    const newGig: Gig = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      venue: 'New Venue',
      location: 'City, Country',
      status: 'confirmed'
    }
    onUpdate('gigs', [...(data.gigs || []), newGig])
  }

  const handleUpdateGig = (id: string, field: keyof Gig, value: string) => {
    const newGigs = (data.gigs || []).map(g => g.id === id ? { ...g, [field]: value } : g)
    onUpdate('gigs', newGigs)
  }

  const handleRemoveGig = (id: string) => {
    onUpdate('gigs', (data.gigs || []).filter(g => g.id !== id))
  }

  // --- Releases ---
  const handleAddRelease = () => {
    const newRelease: Release = {
      id: Date.now().toString(),
      title: 'New Release',
      releaseDate: new Date().toISOString().split('T')[0],
      type: 'single',
      streamingLinks: {}
    }
    onUpdate('releases', [...(data.releases || []), newRelease])
  }

  const handleUpdateRelease = (id: string, field: string, value: string) => {
    const newReleases = (data.releases || []).map(r => {
      if (r.id !== id) return r
      if (field.startsWith('link.')) {
        const platform = field.split('.')[1]
        return { ...r, streamingLinks: { ...(r.streamingLinks || {}), [platform]: value } }
      }
      return { ...r, [field]: value }
    })
    onUpdate('releases', newReleases)
  }

  const handleRemoveRelease = (id: string) => {
    onUpdate('releases', (data.releases || []).filter(r => r.id !== id))
  }

  const handleAddNews = () => {
    const newItem: NewsItem = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      text: '',
    }
    onUpdate('news', [...(data.news || []), newItem])
  }

  const handleUpdateNews = (id: string, field: keyof NewsItem, value: string) => {
    const updated = (data.news || []).map(item => item.id === id ? { ...item, [field]: value } : item)
    onUpdate('news', updated)
  }

  const handleRemoveNews = (id: string) => {
    onUpdate('news', (data.news || []).filter(item => item.id !== id))
  }

  const tabs = [
    { id: 'info', label: t('content.bandInfo') || 'Band Info' },
    { id: 'news', label: t('content.newsTab') || 'News' },
    { id: 'gigs', label: t('content.gigsTab') || 'Gigs & Tour' },
    { id: 'releases', label: t('content.releasesTab') || 'Releases' },
    { id: 'contact', label: t('content.contactTab') || 'Contact & SEO' },
  ] as const

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-mono text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8">

          {activeTab === 'info' && (
            <div className="space-y-6">
              <h3 className="font-mono font-bold text-lg text-primary border-b border-border pb-2">{t('content.globalIdentity') || 'Global Identity'}</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>{t('content.bandName') || 'Band Name'}</Label>
                  <Input value={data.siteName || ''} onChange={e => handleBandInfoChange('siteName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('content.slogan') || 'Slogan / Subtitle'}</Label>
                  <Input value={data.tagline || ''} onChange={e => handleBandInfoChange('tagline', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('content.genres') || 'Genres (comma separated)'}</Label>
                  <Input
                    value={(data.genres || []).join(', ')}
                    onChange={e => handleBandInfoChange('genres', e.target.value.split(',').map(s => s.trim()))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('content.logoUrl') || 'Logo URL'}</Label>
                  <Input value={data.logoUrl || ''} onChange={e => handleBandInfoChange('logoUrl', e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>{t('content.heroImageUrl') || 'Press Photo / Hero Image URL'}</Label>
                  <Input value={data.titleImageUrl || ''} onChange={e => handleBandInfoChange('titleImageUrl', e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <h3 className="font-mono font-bold text-lg text-primary border-b border-border pb-2 mt-8">{t('bio.defaultTitle') || 'Biography'}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('content.shortBio') || 'Short Bio (Start page)'}</Label>
                  <textarea
                    className="w-full min-h-[100px] bg-secondary border border-input rounded-md p-3 text-sm font-mono"
                    value={data.description || ''}
                    onChange={e => handleBandInfoChange('description', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('content.fullStory') || 'Full Story (Bio page)'}</Label>
                  <textarea
                    className="w-full min-h-[200px] bg-secondary border border-input rounded-md p-3 text-sm font-mono"
                    value={data.biography?.story || ''}
                    onChange={e => handleBioChange('story', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="font-mono font-bold text-lg text-primary">{t('content.newsManager') || 'News Manager'}</h3>
                <Button onClick={handleAddNews} size="sm" className="gap-2"><Plus size={16} /> {t('content.add') || 'Add'}</Button>
              </div>
              {(!data.news || data.news.length === 0) ? (
                <p className="text-muted-foreground text-sm font-mono">{t('content.noNews') || 'No news posts yet.'}</p>
              ) : (
                <div className="space-y-4">
                  {(data.news || []).map((item) => (
                    <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex gap-4 items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">{t('content.date') || 'Date'}</Label>
                          <Input type="date" value={item.date?.split('T')[0] || ''} onChange={e => handleUpdateNews(item.id, 'date', e.target.value)} className="h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('content.linkOptional') || 'Link (optional)'}</Label>
                          <Input value={item.link || ''} onChange={e => handleUpdateNews(item.id, 'link', e.target.value)} className="h-8 text-xs" placeholder="https://..." />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-xs">{t('content.message') || 'Message'}</Label>
                          <textarea className="w-full min-h-[80px] bg-secondary border border-input rounded-md p-2 text-xs font-mono" value={item.text} onChange={e => handleUpdateNews(item.id, 'text', e.target.value)} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-xs">{t('content.detailsOptional') || 'Details (optional)'}</Label>
                          <textarea className="w-full min-h-[60px] bg-secondary border border-input rounded-md p-2 text-xs font-mono" value={item.details || ''} onChange={e => handleUpdateNews(item.id, 'details', e.target.value)} />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveNews(item.id)} className="text-destructive hover:bg-destructive/20">
                        <Trash size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'gigs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="font-mono font-bold text-lg text-primary">{t('content.gigManager') || 'Gig Manager'}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleSyncBandsintown}
                    disabled={syncBandsintownMutation.isPending}
                  >
                    {syncBandsintownMutation.isPending ? <Spinner className="animate-spin" size={16} /> : null}
                    {syncBandsintownMutation.isPending ? (t('content.syncing') || 'Syncing...') : (t('content.syncBandsintown') || 'Sync via Bandsintown')}
                  </Button>
                  <Button onClick={handleAddGig} size="sm" className="gap-2"><Plus size={16} /> {t('gigs.addGig') || 'Add Gig'}</Button>
                </div>
              </div>

              {(!data.gigs || data.gigs.length === 0) ? (
                <p className="text-muted-foreground text-sm font-mono">{t('content.noGigs') || 'No gigs configured. Click Add Gig to start.'}</p>
              ) : (
                <div className="space-y-4">
                  {(data.gigs || []).map((gig, _index) => (
                    <div key={gig.id} className="bg-card border border-border rounded-lg p-4 flex gap-4 items-start group">
                      <div className="mt-2 text-muted-foreground cursor-grab"><ArrowsDownUp size={20} /></div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">{t('content.date') || 'Date'}</Label>
                          <Input type="date" value={gig.date.split('T')[0]} onChange={e => handleUpdateGig(gig.id, 'date', e.target.value)} className="h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('content.venue') || 'Venue / Festival'}</Label>
                          <Input value={gig.venue} onChange={e => handleUpdateGig(gig.id, 'venue', e.target.value)} className="h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('content.location') || 'Location (City, Country)'}</Label>
                          <Input value={gig.location} onChange={e => handleUpdateGig(gig.id, 'location', e.target.value)} className="h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('content.ticketUrl') || 'Ticket URL'}</Label>
                          <Input value={gig.ticketUrl || ''} onChange={e => handleUpdateGig(gig.id, 'ticketUrl', e.target.value)} className="h-8 text-xs" placeholder="https://..." />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('content.status') || 'Status'}</Label>
                          <select
                            className="w-full h-8 bg-secondary border border-input rounded-md px-2 text-xs"
                            value={gig.status || 'confirmed'}
                            onChange={e => handleUpdateGig(gig.id, 'status', e.target.value)}
                          >
                            <option value="confirmed">Available / Confirmed</option>
                            <option value="soldout">Sold Out</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="announced">Announced</option>
                          </select>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveGig(gig.id)} className="text-destructive hover:bg-destructive/20">
                        <Trash size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'releases' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="font-mono font-bold text-lg text-primary">{t('content.releaseManager') || 'Release Manager'}</h3>
                <Button onClick={handleAddRelease} size="sm" className="gap-2"><Plus size={16} /> {t('releases.addRelease') || 'Add Release'}</Button>
              </div>

              {(!data.releases || data.releases.length === 0) ? (
                <p className="text-muted-foreground text-sm font-mono">{t('content.noReleases') || 'No releases configured. Click Add Release to start.'}</p>
              ) : (
                <div className="space-y-4">
                  {(data.releases || []).map((release) => (
                    <div key={release.id} className="bg-card border border-border rounded-lg p-4 flex gap-4 items-start">
                      <div className="mt-2 text-muted-foreground cursor-grab"><ArrowsDownUp size={20} /></div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">{t('content.title') || 'Title'}</Label>
                          <Input value={release.title} onChange={e => handleUpdateRelease(release.id, 'title', e.target.value)} className="h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('content.releaseDate') || 'Release Date'}</Label>
                          <Input type="date" value={release.releaseDate?.split('T')[0] || ''} onChange={e => handleUpdateRelease(release.id, 'releaseDate', e.target.value)} className="h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('content.coverArtworkUrl') || 'Cover Artwork URL'}</Label>
                          <Input value={release.artwork || ''} onChange={e => handleUpdateRelease(release.id, 'artwork', e.target.value)} className="h-8 text-xs" placeholder="https://..." />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('content.spotifyUrl') || 'Spotify URL'}</Label>
                          <Input value={release.streamingLinks?.spotify || ''} onChange={e => handleUpdateRelease(release.id, 'link.spotify', e.target.value)} className="h-8 text-xs" placeholder="https://open.spotify.com/..." />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('content.appleMusicUrl') || 'Apple Music URL'}</Label>
                          <Input value={release.streamingLinks?.appleMusic || ''} onChange={e => handleUpdateRelease(release.id, 'link.appleMusic', e.target.value)} className="h-8 text-xs" placeholder="https://music.apple.com/..." />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveRelease(release.id)} className="text-destructive hover:bg-destructive/20">
                        <Trash size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="font-mono font-bold text-lg text-primary border-b border-border pb-2">{t('contact.defaultTitle') || 'Contact'}</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>{t('content.bookingEmail') || 'Booking Email'}</Label>
                  <Input
                    value={data.contactSettings?.emailForwardTo || ''}
                    onChange={e => onUpdate('contactSettings', { ...data.contactSettings, emailForwardTo: e.target.value })}
                    placeholder="booking@yourband.com"
                  />
                </div>
              </div>

              <h3 className="font-mono font-bold text-lg text-primary border-b border-border pb-2 mt-8">{t('content.seoIdentity') || 'SEO & Identity'}</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>{t('content.metaTitle') || 'Global Meta Title'}</Label>
                  <Input
                    value={data.seo?.title || ''}
                    onChange={e => onUpdate('seo', { ...data.seo, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('content.metaDescription') || 'Global Meta Description'}</Label>
                  <textarea
                    className="w-full min-h-[80px] bg-secondary border border-input rounded-md p-3 text-sm font-mono"
                    value={data.seo?.description || ''}
                    onChange={e => onUpdate('seo', { ...data.seo, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('content.faviconUrl') || 'Favicon URL'}</Label>
                  <Input
                    value={data.seo?.favicon || ''}
                    onChange={e => onUpdate('seo', { ...data.seo, favicon: e.target.value })}
                    placeholder="/favicon.ico or https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('content.ogImageUrl') || 'Global OG Image URL'}</Label>
                  <Input
                    value={data.seo?.ogImage || ''}
                    onChange={e => onUpdate('seo', { ...data.seo, ogImage: e.target.value })}
                    placeholder="https://... image for WhatsApp/Facebook sharing"
                  />
                </div>
              </div>

              <h3 className="font-mono font-bold text-lg text-primary border-b border-border pb-2 mt-8">{t('content.legal') || 'Legal'}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('content.impressum') || 'Impressum (Plain text or markdown)'}</Label>
                  <textarea
                    className="w-full min-h-[150px] bg-secondary border border-input rounded-md p-3 text-sm font-mono"
                    value={data.impressum?.name ? JSON.stringify(data.impressum, null, 2) : ''}
                    onChange={e => {
                      try {
                        const parsed = JSON.parse(e.target.value)
                        onUpdate('impressum', parsed)
                      } catch {
                        // ignore invalid json while typing
                      }
                    }}
                    placeholder="JSON representation for now..."
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
