import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SiteConfig } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface SystemSettingsProps {
  data: SiteConfig
  onUpdate: (key: keyof SiteConfig, value: unknown) => void
}

export function SystemSettings({ data, onUpdate }: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState<'integrations' | 'general'>('integrations')
  const { t } = useLocale()

  const handleIntegrationChange = (field: string, value: string) => {
    const currentIntegrations = (data.configOverrides?.integrations as Record<string, string>) || {}
    onUpdate('configOverrides', {
      ...data.configOverrides,
      integrations: { ...currentIntegrations, [field]: value }
    })
  }

  const handleGeneralChange = (field: string, value: unknown) => {
    const currentGeneral = (data.configOverrides?.generalSettings as Record<string, unknown>) || {}
    onUpdate('configOverrides', {
      ...data.configOverrides,
      generalSettings: { ...currentGeneral, [field]: value }
    })
  }

  const integrations = (data.configOverrides?.integrations as Record<string, string>) || {}
  const generalSettings = (data.configOverrides?.generalSettings as Record<string, unknown>) || {}

  const tabs = [
    { id: 'integrations', label: 'Integrations & APIs' },
    { id: 'general', label: 'General Settings' },
  ] as const

  return (
    <div className="flex flex-col h-full bg-background">
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

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8">

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h3 className="font-mono font-bold text-lg text-primary border-b border-border pb-2">{t('systemSettings.integrationsTitle')}</h3>
              <p className="text-xs text-muted-foreground font-mono">
                {t('systemSettings.integrationsDesc')}
              </p>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>{t('systemSettings.bandsintownAppId')}</Label>
                  <Input
                    value={integrations.bandsintownAppId || ''}
                    onChange={e => handleIntegrationChange('bandsintownAppId', e.target.value)}
                    placeholder="Enter your Bandsintown App ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('systemSettings.spotifyClientId')}</Label>
                  <Input
                    value={integrations.spotifyClientId || ''}
                    onChange={e => handleIntegrationChange('spotifyClientId', e.target.value)}
                    placeholder="Enter your Spotify Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('systemSettings.youtubeApiKey')}</Label>
                  <Input
                    value={integrations.youtubeApiKey || ''}
                    onChange={e => handleIntegrationChange('youtubeApiKey', e.target.value)}
                    placeholder="Enter your YouTube API Key"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="font-mono font-bold text-lg text-primary border-b border-border pb-2">{t('systemSettings.generalTitle')}</h3>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>{t('systemSettings.googleAnalyticsId')}</Label>
                  <Input
                    value={(generalSettings.googleAnalyticsId as string) || ''}
                    onChange={e => handleGeneralChange('googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <Label>{t('systemSettings.facebookPixelId')}</Label>
                  <Input
                    value={(generalSettings.facebookPixelId as string) || ''}
                    onChange={e => handleGeneralChange('facebookPixelId', e.target.value)}
                    placeholder="123456789012345"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">{t('systemSettings.maintenanceMode')}</Label>
                    <p className="text-xs text-muted-foreground">{t('systemSettings.maintenanceDesc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!generalSettings.maintenanceMode}
                      onChange={e => handleGeneralChange('maintenanceMode', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-status-neutral-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">{t('systemSettings.cookieConsent')}</Label>
                    <p className="text-xs text-muted-foreground">{t('systemSettings.cookieConsentDesc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={generalSettings.cookieConsentRequired !== false} // Default true
                      onChange={e => handleGeneralChange('cookieConsentRequired', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-status-neutral-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
