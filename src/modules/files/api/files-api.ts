import { featureFlags } from '@/lib/feature-flags'
import { graphClient } from '@/lib/graph/graph-client'
import { runInMemoryQuery } from '@/lib/api-client/in-memory-query'
import { driveItemsMock } from '../mock/files.mock'
import type { DriveItem } from '../types/drive-item'
import type { PagedResult, QueryParams } from '@/lib/api-client/types'

function simulateLatency() {
  return new Promise((r) => setTimeout(r, 200 + Math.random() * 200))
}

export const filesApi = {
  async listItems(folderId: string | null, params: QueryParams = {}): Promise<PagedResult<DriveItem>> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const inFolder = driveItemsMock.filter((item) => item.parentId === folderId)
      // Folders first, then files, each alphabetically — unless the user picked a column sort.
      const sorted = params.sort
        ? inFolder
        : [...inFolder].sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1))
      return runInMemoryQuery(sorted, params)
    }
    const { data } = await graphClient.get(`/me/drive/items/${folderId ?? 'root'}/children`, { params })
    return data
  },

  /** Breadcrumb trail from root down to (and including) the given folder. */
  async getPath(folderId: string | null): Promise<DriveItem[]> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const trail: DriveItem[] = []
      let currentId = folderId
      while (currentId) {
        const item = driveItemsMock.find((i) => i.id === currentId)
        if (!item) break
        trail.unshift(item)
        currentId = item.parentId
      }
      return trail
    }
    const { data } = await graphClient.get(`/me/drive/items/${folderId}`)
    return data.path
  },

  async upload(folderId: string | null, files: File[]): Promise<void> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      files.forEach((file) => {
        driveItemsMock.push({
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          parentId: folderId,
          name: file.name,
          type: 'file',
          sizeKb: Math.round(file.size / 1024),
          modifiedAt: new Date().toISOString(),
        })
      })
      return
    }
    // Real Graph upload uses a resumable upload session per file — omitted here.
    throw new Error('Real file upload not wired up yet.')
  },

  async createFolder(parentId: string | null, name: string): Promise<void> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      driveItemsMock.push({
        id: `folder-${Date.now()}`,
        parentId,
        name,
        type: 'folder',
        sizeKb: null,
        modifiedAt: new Date().toISOString(),
      })
      return
    }
    await graphClient.post(`/me/drive/items/${parentId ?? 'root'}/children`, { name, folder: {} })
  },

  async rename(id: string, newName: string): Promise<void> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const item = driveItemsMock.find((i) => i.id === id)
      if (item) item.name = newName
      return
    }
    await graphClient.patch(`/me/drive/items/${id}`, { name: newName })
  },

  async remove(id: string): Promise<void> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const idx = driveItemsMock.findIndex((i) => i.id === id)
      if (idx !== -1) driveItemsMock.splice(idx, 1)
      return
    }
    await graphClient.delete(`/me/drive/items/${id}`)
  },
}
