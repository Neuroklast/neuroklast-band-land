import { describe, expect, it } from 'vitest'
import { githubArtifactUrl, mergePublicReleaseDownloads, parseNeurokoreGitHubReleases, parsePluginGitHubReleases, pluginGithubArtifactUrl } from '@/lib/plugins/github-releases'
import type { PublicRelease } from '@/lib/plugins/releases'

function release(version = '0.9.0-beta.1', id = 123) {
  const tag = `neurokore-v${version}`
  const names = [`NEUROKORE-${version}-Setup.exe`, `NEUROKORE-${version}-win64.zip`]
  return { id, tag_name: tag, draft: false, prerelease: version.includes('-'), published_at: '2026-10-26T12:00:00Z', body: 'Release notes',
    assets: names.flatMap(name => [name, `${name}.sha256`]).map(name => ({ name, size: 200000, state: 'uploaded', digest: `sha256:${'a'.repeat(64)}`,
      browser_download_url: `https://github.com/Neuroklast/vst-releases/releases/download/${tag}/${name}` })) }
}

describe('automatic NEUROKORE website releases', () => {
  it('maps complete public installers and bundles with checksums and notes', () => {
    const [mapped] = parseNeurokoreGitHubReleases([release()])
    expect(mapped.version).toBe('0.9.0-beta.1')
    expect(mapped.channel).toBe('beta')
    expect(mapped.source).toBe('github')
    expect(mapped.release_notes).toBe('Release notes')
    expect(mapped.artifacts.map(item => item.package_type)).toEqual(['installer', 'bundle'])
    expect(mapped.artifacts[0].sha256).toBe('a'.repeat(64))
    expect(mapped.artifacts[0].signing_status).toBe('unverified')
    expect(githubArtifactUrl(mapped, 'windows-x64', 'bundle')).toContain('-win64.zip')
    expect(githubArtifactUrl(mapped, 'macos-arm64')).toBeNull()
  })

  it('rejects drafts, incomplete installers, foreign URLs, duplicate assets and absent digests', () => {
    for (const mutate of [
      (item: ReturnType<typeof release>) => { item.draft = true },
      (item: ReturnType<typeof release>) => { item.assets.splice(1, 1) },
      (item: ReturnType<typeof release>) => { item.assets[0].browser_download_url = 'https://example.invalid/setup.exe' },
      (item: ReturnType<typeof release>) => { item.assets.push({ ...item.assets[0] }) },
      (item: ReturnType<typeof release>) => { item.assets[0].digest = '' },
      (item: ReturnType<typeof release>) => { item.tag_name = 'neurokore-v0.9.0-beta.1/other' },
    ]) {
      const item = release()
      mutate(item)
      expect(parseNeurokoreGitHubReleases([item])).toEqual([])
    }
  })


  it('accepts product-scoped NeuroSub binaries and rejects other plugin artifacts', () => {
    const version = '0.2.0-beta.1'
    const tag = 'neurosub-v' + version
    const names = ['NEUROSUB-' + version + '-Setup.exe', 'NEUROSUB-' + version + '-win64.zip']
    const valid = { ...release(), tag_name: tag, assets: names.flatMap(name => [name, name + '.sha256'])
      .map(name => ({ name, size: 150000, state: 'uploaded', digest: 'sha256:' + 'b'.repeat(64),
        browser_download_url: 'https://github.com/Neuroklast/vst-releases/releases/download/' + tag + '/' + name })) }
    expect(parseNeurokoreGitHubReleases([valid])).toEqual([])
    expect(parsePluginGitHubReleases([valid], 'neurometer')).toEqual([])
    const [sub] = parsePluginGitHubReleases([valid], 'neurosub')
    expect(sub.version).toBe(version)
    expect(sub.artifacts.map(asset => asset.package_type)).toEqual(['installer', 'bundle'])
    expect(pluginGithubArtifactUrl('neurosub', sub, 'windows-x64', 'installer')).toContain('/' + names[0])
    expect(pluginGithubArtifactUrl('neurosub', sub, 'windows-x64', 'bundle')).toContain('/' + names[1])
    expect(pluginGithubArtifactUrl('neurokore', sub, 'windows-x64', 'installer')).toBeNull()
    const foreign = { ...valid, assets: valid.assets.map(asset => ({ ...asset,
      browser_download_url: asset.browser_download_url.replace(tag, 'neurokore-v' + version) })) }
    expect(parsePluginGitHubReleases([foreign], 'neurosub')).toEqual([])
  })

  it('uses distinct product tags and refuses cross-plugin releases', () => {
    const version = '0.9.0-beta.1'
    const meterTag = 'neurometer-v' + version
    const meter = { ...release(), tag_name: meterTag, assets: release().assets.map(asset => ({
      ...asset, name: asset.name.replace('NEUROKORE', 'NEUROMETER'),
      browser_download_url: asset.browser_download_url.replace('neurokore-v', 'neurometer-v').replace('NEUROKORE', 'NEUROMETER'),
    })) }
    expect(parseNeurokoreGitHubReleases([meter])).toEqual([])
    const [mapped] = parsePluginGitHubReleases([meter, release()], 'neurometer')
    expect(mapped.version).toBe(version)
    expect(pluginGithubArtifactUrl('neurometer', mapped, 'windows-x64', 'installer')).toContain('neurometer-v' + version)
    expect(pluginGithubArtifactUrl('neurokore', mapped, 'windows-x64', 'installer')).toBeNull()
  })

  it('keeps channels separate and prefers versions instead of GitHub publication order', () => {
    const versions = parseNeurokoreGitHubReleases([release('0.9.0-beta.2'), release('0.9.0-beta.12', 124), release('0.8.0', 125)])
    expect(versions.find(item => item.channel === 'beta')?.version).toBe('0.9.0-beta.12')
    expect(versions.find(item => item.channel === 'stable')?.version).toBe('0.8.0')
  })

  it('retains R2 macOS downloads while replacing only outdated Windows slots', () => {
    const [github] = parseNeurokoreGitHubReleases([release()])
    const cms: PublicRelease = { ...github, id: 'cms', source: undefined, version: '0.8.0-beta', published_at: '2026-10-27T00:00:00Z',
      artifacts: [github.artifacts[0], { ...github.artifacts[0], platform: 'macos-arm64', architecture: 'arm64' }] }
    const result = mergePublicReleaseDownloads([cms], [github])
    expect(result).toHaveLength(2)
    expect(result[0].version).toBe('0.9.0-beta.1')
    expect(result[1].version).toBe('0.8.0-beta')
    expect(result[1].artifacts.map(item => item.platform)).toEqual(['macos-arm64'])
    expect(githubArtifactUrl(result[1], 'macos-arm64')).toBeNull()
  })

  it('preserves CMS artifacts when the same version is explicitly maintained there', () => {
    const [github] = parseNeurokoreGitHubReleases([release()])
    const cms = { ...github, source: undefined, id: 'cms', artifacts: [github.artifacts[0]] }
    const result = mergePublicReleaseDownloads([cms], [github])
    expect(result[0].id).toBe('cms')
    expect(result[0].artifacts[0].package_type).toBe('installer')
    expect(result[1].artifacts[0].package_type).toBe('bundle')
  })

  it('recognizes numbered betas after legacy CMS versions without a beta suffix', () => {
    const [github] = parseNeurokoreGitHubReleases([release('0.8.0-beta.1')])
    const cms = { ...github, source: undefined, id: 'cms', version: '0.8.0' }
    expect(mergePublicReleaseDownloads([cms], [github])[0].source).toBe('github')
  })
})
