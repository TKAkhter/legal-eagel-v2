import type { MailFolder, MailMessage } from '../types/mail'

export const mailFoldersMock: MailFolder[] = [
  { id: 'inbox', displayName: 'Inbox', unreadItemCount: 4 },
  { id: 'sent', displayName: 'Sent Items', unreadItemCount: 0 },
  { id: 'drafts', displayName: 'Drafts', unreadItemCount: 0 },
  { id: 'deleted', displayName: 'Deleted Items', unreadItemCount: 0 },
]

const senders = [
  { name: 'Sara Khan', email: 'sara.khan@example.com' },
  { name: 'Acme Corp Billing', email: 'billing@acme.example.com' },
  { name: 'Omar Siddiqui', email: 'omar.siddiqui@example.com' },
  { name: 'Globex Legal', email: 'legal@globex.example.com' },
]

const subjects = [
  'Re: Contract review — Q3 renewal',
  'Invoice #INV-2041 is due',
  'Matter update: Trademark Filing #1004',
  'Meeting notes — client onboarding',
  'Action needed: signature required',
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const mailMessagesMock: MailMessage[] = Array.from({ length: 22 }, (_, i) => {
  const sender = randomFrom(senders)
  return {
    id: `msg-${i + 1}`,
    folderId: i % 7 === 0 ? 'sent' : 'inbox',
    subject: randomFrom(subjects),
    fromName: sender.name,
    fromEmail: sender.email,
    bodyPreview: 'Just following up on the items we discussed — let me know if you need anything else from our side before...',
    body: 'Just following up on the items we discussed — let me know if you need anything else from our side before we move forward. Happy to hop on a call this week if that helps.\n\nBest,\n' + sender.name,
    receivedAt: new Date(Date.now() - i * 3_600_000).toISOString(),
    isRead: i > 3,
    isFlagged: i % 5 === 0,
    attachments: i % 4 === 0 ? [{ id: `att-${i}`, name: 'document.pdf', sizeKb: 240 }] : [],
  }
})
