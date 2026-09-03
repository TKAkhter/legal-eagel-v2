export interface FaqEntry {
  id: string
  question: string
  answer: string
  category: string
}

export const faqEntries: FaqEntry[] = [
  {
    id: 'faq-1',
    category: 'Getting started',
    question: 'How do I reset my password?',
    answer: 'Go to Settings → Security and use the "Update password" form. If you signed in with Microsoft SSO, your password is managed by your organization instead.',
  },
  {
    id: 'faq-2',
    category: 'Getting started',
    question: 'How do I change the app language?',
    answer: 'Use the language switcher in the top bar (shows your current language code, e.g. EN). English and Arabic are supported, with automatic right-to-left layout for Arabic.',
  },
  {
    id: 'faq-3',
    category: 'Permissions',
    question: 'Why can\'t I see a menu item other people have?',
    answer: 'Menu items and pages are shown based on your assigned role\'s permissions. Ask an administrator to review your access on the Permissions page.',
  },
  {
    id: 'faq-4',
    category: 'Permissions',
    question: 'How do I give someone access to Billings?',
    answer: 'An administrator can go to Permissions, select the relevant role, and enable the Billings permissions, then save.',
  },
  {
    id: 'faq-5',
    category: 'Data & filters',
    question: 'Can I save a filter so I don\'t have to set it up again?',
    answer: 'Yes — expand the filter panel on any list page, set your filters, and click "Save as preset." Saved presets appear as chips you can reapply anytime.',
  },
  {
    id: 'faq-6',
    category: 'Data & filters',
    question: 'How do I export data to a spreadsheet?',
    answer: 'Use the Export button in the toolbar above any data table. Availability depends on your permissions for that module.',
  },
  {
    id: 'faq-7',
    category: 'Mail & Files',
    question: 'Why can\'t I see the Mail or Files section?',
    answer: 'Mail and File Manager require both a permission grant and a connected Microsoft account. Contact an administrator if you believe you should have access.',
  },
]
