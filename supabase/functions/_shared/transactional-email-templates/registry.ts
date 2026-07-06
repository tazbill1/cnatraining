/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import type { ComponentType } from 'npm:react@18.3.1'
import { NewModuleNotificationEmail } from './new-module-notification.tsx'

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
      siteName: 'cnatraining',
      siteUrl: 'https://cnatraining.lovable.app',
      moduleTitle: 'Video Walkarounds That Win',
      moduleDescription:
        'Learn how to record video walkarounds that build trust and close more deals.',
      moduleUrl: 'https://cnatraining.lovable.app/learn',
      dealershipName: 'My Auto Group',
    },
  },
}
