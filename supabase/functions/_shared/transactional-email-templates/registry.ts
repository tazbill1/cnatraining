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
    subject: (data) =>
      `New training available: ${data?.moduleTitle || 'A new module'}`,
    displayName: 'New Module Notification',
    previewData: {
      siteName: 'Automotive Sales Pro',
      siteUrl: 'https://automotivesalespro.com',
      moduleTitle: 'Video Walkarounds That Win',
      moduleDescription:
        'Learn how to record video walkarounds that build trust and close more deals.',
      moduleUrl: 'https://automotivesalespro.com/learn',
      dealershipName: 'My Auto Group',
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
