/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import type { ComponentType } from 'npm:react@18.3.1'
import { NewModuleNotificationEmail } from './new-module-notification.tsx'
import { ManagerWeeklyDigestEmail } from './manager-weekly-digest.tsx'
import { LearningNudgeEmail } from './learning-nudge.tsx'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'new-module-notification': {
    component: NewModuleNotificationEmail,
    subject: (data) => {
      const count = Array.isArray(data?.modules) ? data.modules.length : 0
      if (count > 1) return `${count} new training modules available`
      const title =
        (Array.isArray(data?.modules) && data.modules[0]?.title) ||
        data?.moduleTitle ||
        'A new module'
      return `New training available: ${title}`
    },
    displayName: 'New Module Notification',
    previewData: {
      siteName: 'Automotive Sales Pro',
      siteUrl: 'https://automotivesalespro.com',
      dealershipName: 'My Auto Group',
      learnUrl: 'https://automotivesalespro.com/learn',
      modules: [
        {
          title: 'Video Walkarounds That Win',
          description:
            'Learn how to record video walkarounds that build trust and close more deals.',
          url: 'https://automotivesalespro.com/learn',
        },
        {
          title: 'Showroom: Meet and Greet',
          description: 'Master the first 10 seconds with L.A.S.T.',
          url: 'https://automotivesalespro.com/learn',
        },
      ],
    },
  },
  'manager-weekly-digest': {
    component: ManagerWeeklyDigestEmail,
    subject: (data) =>
      `Weekly training summary — ${data?.dealershipName || 'your team'}`,
    displayName: 'Manager Weekly Digest',
    previewData: {
      siteName: 'Automotive Sales Pro',
      siteUrl: 'https://automotivesalespro.com',
      dealershipName: 'My Auto Group',
      weekLabel: 'Nov 10 – Nov 16',
      activeReps: 6,
      totalReps: 8,
      totalSessions: 42,
      totalModulesCompleted: 11,
      totalDrillsPlayed: 27,
      topReps: [
        { name: 'Alex Morgan', sessions: 12, modulesCompleted: 3, drillsPlayed: 8 },
        { name: 'Jamie Chen', sessions: 9, modulesCompleted: 2, drillsPlayed: 6 },
        { name: 'Sam Rivera', sessions: 7, modulesCompleted: 2, drillsPlayed: 5 },
      ],
      inactiveReps: ['Chris Kim', 'Taylor Reed'],
      teamUrl: 'https://automotivesalespro.com/team',
    },
  },
  'learning-nudge': {
    component: LearningNudgeEmail,
    subject: (data) =>
      `Pick up where you left off: ${data?.moduleTitle || 'your module'}`,
    displayName: 'Learning Nudge',
    previewData: {
      siteName: 'Automotive Sales Pro',
      siteUrl: 'https://automotivesalespro.com',
      firstName: 'Alex',
      moduleTitle: 'Phone Skills – Module 2: The Modern Caller',
      moduleUrl: 'https://automotivesalespro.com/learn',
      daysSince: 3,
    },
  },
}
