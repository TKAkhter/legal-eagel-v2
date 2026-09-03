import { featureFlags } from '@/lib/feature-flags'
import { graphClient } from '@/lib/graph/graph-client'
import { runInMemoryQuery } from '@/lib/api-client/in-memory-query'
import { mailFoldersMock, mailMessagesMock } from '../mock/mail.mock'
import type { MailFolder, MailMessage } from '../types/mail'
import type { PagedResult, QueryParams } from '@/lib/api-client/types'

function simulateLatency() {
  return new Promise((r) => setTimeout(r, 200 + Math.random() * 200))
}

export const mailApi = {
  async listFolders(): Promise<MailFolder[]> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      return mailFoldersMock
    }
    const { data } = await graphClient.get('/me/mailFolders')
    return data.value
  },

  async listMessages(folderId: string, params: QueryParams = {}): Promise<PagedResult<MailMessage>> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const inFolder = mailMessagesMock.filter((m) => m.folderId === folderId)
      return runInMemoryQuery(inFolder, { ...params, sort: params.sort ?? { field: 'receivedAt', direction: 'desc' } })
    }
    const { data } = await graphClient.get(`/me/mailFolders/${folderId}/messages`, { params })
    return data
  },

  async getMessage(id: string): Promise<MailMessage> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const message = mailMessagesMock.find((m) => m.id === id)
      if (!message) throw new Error(`Message ${id} not found`)
      return message
    }
    const { data } = await graphClient.get(`/me/messages/${id}`)
    return data
  },

  async setRead(id: string, isRead: boolean): Promise<void> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const message = mailMessagesMock.find((m) => m.id === id)
      if (message) message.isRead = isRead
      return
    }
    await graphClient.patch(`/me/messages/${id}`, { isRead })
  },

  async toggleFlag(id: string): Promise<void> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const message = mailMessagesMock.find((m) => m.id === id)
      if (message) message.isFlagged = !message.isFlagged
      return
    }
    await graphClient.patch(`/me/messages/${id}`, { flag: { flagStatus: 'flagged' } })
  },

  async sendMessage(payload: { to: string; subject: string; body: string }): Promise<void> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      return
    }
    await graphClient.post('/me/sendMail', {
      message: {
        subject: payload.subject,
        body: { contentType: 'Text', content: payload.body },
        toRecipients: [{ emailAddress: { address: payload.to } }],
      },
    })
  },
}
