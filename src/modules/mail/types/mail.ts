export interface MailFolder {
  id: string
  displayName: string
  unreadItemCount: number
}

export interface MailAttachment {
  id: string
  name: string
  sizeKb: number
}

export interface MailMessage {
  id: string
  folderId: string
  subject: string
  fromName: string
  fromEmail: string
  bodyPreview: string
  body: string
  receivedAt: string
  isRead: boolean
  isFlagged: boolean
  attachments: MailAttachment[]
}
