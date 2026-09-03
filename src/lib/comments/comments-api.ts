import { featureFlags } from '@/lib/feature-flags'
import { httpClient } from '@/lib/api-client/http-client'
import { useAuthStore } from '@/lib/store/auth-store'
import * as mock from './comments-store'
import type { Comment } from './comments-store'

function simulateLatency() {
  return new Promise((r) => setTimeout(r, 150 + Math.random() * 150))
}

export const commentsApi = {
  async list(module: string, entityId: string): Promise<Comment[]> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      return mock.getComments(module, entityId)
    }
    const { data } = await httpClient.get<Comment[]>('/comments', { params: { module, entityId } })
    return data
  },

  async add(module: string, entityId: string, body: string): Promise<Comment> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const author = useAuthStore.getState().user
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        authorName: author?.name ?? 'You',
        body,
        createdAt: new Date().toISOString(),
      }
      mock.addComment(module, entityId, comment)
      return comment
    }
    const { data } = await httpClient.post<Comment>('/comments', { module, entityId, body })
    return data
  },
}
