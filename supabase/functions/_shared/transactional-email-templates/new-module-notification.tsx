/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ModuleItem {
  title: string
  description?: string
  url: string
}

interface Props {
  siteName?: string
  siteUrl?: string
  dealershipName?: string
  learnUrl?: string
  modules?: ModuleItem[]
  // Back-compat single-module fields
  moduleTitle?: string
  moduleDescription?: string
  moduleUrl?: string
}

export const NewModuleNotificationEmail = ({
  siteName = 'Sales Training',
  siteUrl = '#',
  dealershipName,
  learnUrl,
  modules,
  moduleTitle,
  moduleDescription,
  moduleUrl,
}: Props) => {
  const list: ModuleItem[] =
    modules && modules.length > 0
      ? modules
      : moduleTitle
      ? [{ title: moduleTitle, description: moduleDescription, url: moduleUrl || '#' }]
      : []
  const isMulti = list.length > 1
  const ctaHref = learnUrl || (list[0]?.url ?? '#')
  const previewText = isMulti
    ? `${list.length} new training modules are ready`
    : `New training available: ${list[0]?.title ?? ''}`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isMulti ? 'New training is ready for you' : 'New training is ready for you'}
          </Heading>
          <Text style={text}>
            {dealershipName ? `${dealershipName} just` : 'We just'} added{' '}
            {isMulti ? `${list.length} new modules` : 'a new module'} to your training:
          </Text>

          {list.map((m, i) => (
            <Section key={i} style={moduleBlock}>
              <Heading as="h2" style={h2}>
                {m.title}
              </Heading>
              {m.description ? <Text style={text}>{m.description}</Text> : null}
              <Link href={m.url} style={link}>
                Open module →
              </Link>
            </Section>
          ))}

          <Button style={button} href={ctaHref}>
            {isMulti ? 'View all training' : 'Start this module'}
          </Button>

          <Hr style={hr} />
          <Text style={footer}>
            You're receiving this because you have a{' '}
            <Link href={siteUrl} style={link}>
              {siteName}
            </Link>{' '}
            training account.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default NewModuleNotificationEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
}
const container = { padding: '20px 25px', maxWidth: '560px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: 'hsl(222, 47%, 11%)',
  margin: '0 0 20px',
}
const h2 = {
  fontSize: '17px',
  fontWeight: 'bold' as const,
  color: 'hsl(222, 47%, 11%)',
  margin: '0 0 8px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(215, 16%, 30%)',
  lineHeight: '1.6',
  margin: '0 0 10px',
}
const moduleBlock = {
  borderLeft: '3px solid hsl(217, 91%, 60%)',
  padding: '4px 0 4px 14px',
  margin: '0 0 18px',
}
const link = {
  color: 'hsl(217, 91%, 45%)',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  fontSize: '14px',
}
const button = {
  backgroundColor: 'hsl(217, 91%, 60%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '8px 0 20px',
}
const hr = { borderColor: '#eaeaea', margin: '28px 0 16px' }
const footer = {
  fontSize: '12px',
  color: '#777777',
  lineHeight: '1.5',
  margin: 0,
}
