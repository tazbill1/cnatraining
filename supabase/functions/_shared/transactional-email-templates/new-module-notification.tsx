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
  moduleTitle?: string
  moduleDescription?: string
  moduleUrl?: string
  dealershipName?: string
}

export const NewModuleNotificationEmail = ({
  siteName = 'Sales Training',
  siteUrl = '#',
  moduleTitle = 'A new training module',
  moduleDescription = '',
  moduleUrl = '#',
  dealershipName,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New training available: {moduleTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New training is ready for you</Heading>
        <Text style={text}>
          {dealershipName ? `${dealershipName} just` : 'We just'} added a new
          module to your training:
        </Text>
        <Heading as="h2" style={h2}>
          {moduleTitle}
        </Heading>
        {moduleDescription ? (
          <Text style={text}>{moduleDescription}</Text>
        ) : null}
        <Button style={button} href={moduleUrl}>
          Start this module
        </Button>
        <Text style={text}>
          Or copy and paste this link into your browser:
          <br />
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
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: 'hsl(222, 47%, 11%)',
  margin: '0 0 12px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(215, 16%, 30%)',
  lineHeight: '1.6',
  margin: '0 0 18px',
}
const link = {
  color: 'hsl(217, 91%, 45%)',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
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
