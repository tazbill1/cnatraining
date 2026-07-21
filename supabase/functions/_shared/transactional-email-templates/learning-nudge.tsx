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
  Text,
} from 'npm:@react-email/components@0.0.22'

interface Props {
  siteName?: string
  siteUrl?: string
  firstName?: string
  moduleTitle?: string
  moduleUrl?: string
  daysSince?: number
}

export const LearningNudgeEmail = ({
  siteName = 'Sales Training',
  siteUrl = '#',
  firstName = '',
  moduleTitle = 'Your training module',
  moduleUrl = '#',
  daysSince = 3,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Pick up where you left off: {moduleTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Pick up where you left off</Heading>
        <Text style={text}>
          {firstName ? `Hey ${firstName},` : 'Hey,'} you started this{' '}
          {daysSince} day{daysSince === 1 ? '' : 's'} ago but didn't finish yet:
        </Text>
        <Heading as="h2" style={h2}>
          {moduleTitle}
        </Heading>
        <Text style={text}>
          It only takes a few minutes to wrap up — and it counts toward your
          category certificate.
        </Text>
        <Button style={button} href={moduleUrl}>
          Finish the module
        </Button>
        <Text style={muted}>
          Or paste this link:{' '}
          <Link href={moduleUrl} style={link}>
            {moduleUrl}
          </Link>
        </Text>
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

export default LearningNudgeEmail

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
  margin: '0 0 16px',
}
const h2 = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: 'hsl(222, 47%, 11%)',
  margin: '0 0 12px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(215, 16%, 30%)',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const muted = {
  fontSize: '13px',
  color: '#777777',
  margin: '12px 0 0',
  wordBreak: 'break-all' as const,
}
const link = {
  color: 'hsl(217, 91%, 45%)',
  textDecoration: 'underline',
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
  margin: '8px 0 8px',
}
const hr = { borderColor: '#eaeaea', margin: '28px 0 16px' }
const footer = {
  fontSize: '12px',
  color: '#777777',
  lineHeight: '1.5',
  margin: 0,
}
