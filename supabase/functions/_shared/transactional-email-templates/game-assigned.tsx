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
  gameTitle?: string
  gameDescription?: string
  gameUrl?: string
  dueDateLabel?: string
  assignedByName?: string
  isReminder?: boolean
}

interface GameAssignedEmailProps extends Props {
  assignedByName?: string
}

export const GameAssignedEmail = ({
  siteName = 'Automotive Sales Pro',
  siteUrl = '#',
  firstName = '',
  gameTitle = 'A training game',
  gameDescription = '',
  gameUrl = '#',
  dueDateLabel = '',
  assignedByName = '',
  isReminder = false,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {isReminder ? `Reminder: ${gameTitle} is due ${dueDateLabel}` : `You've been assigned: ${gameTitle}`}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {isReminder ? 'Your game is due soon' : 'New game assigned to you'}
        </Heading>
        <Text style={text}>
          {firstName ? `Hi ${firstName},` : 'Hi,'}{' '}
          {isReminder
            ? "just a heads-up — you haven't played this game yet:"
            : `${assignedByName || 'Your manager'} assigned you this training game:`}
        </Text>
        <Heading as="h2" style={h2}>
          {gameTitle}
        </Heading>
        {gameDescription ? <Text style={text}>{gameDescription}</Text> : null}
        {dueDateLabel ? (
          <Text style={due}>Due {dueDateLabel}</Text>
        ) : null}
        <Button style={button} href={gameUrl}>
          {isReminder ? 'Play it now' : 'Start playing'}
        </Button>
        <Text style={muted}>
          Or paste this link:{' '}
          <Link href={gameUrl} style={link}>
            {gameUrl}
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

export default GameAssignedEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
}
const container = { padding: '20px 25px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(222, 47%, 11%)', margin: '0 0 16px' }
const h2 = { fontSize: '18px', fontWeight: 'bold' as const, color: 'hsl(222, 47%, 11%)', margin: '0 0 12px' }
const text = { fontSize: '15px', color: 'hsl(215, 16%, 30%)', lineHeight: '1.6', margin: '0 0 16px' }
const due = { fontSize: '15px', fontWeight: 'bold' as const, color: 'hsl(25, 95%, 40%)', margin: '0 0 16px' }
const muted = { fontSize: '13px', color: '#777777', margin: '12px 0 0', wordBreak: 'break-all' as const }
const link = { color: 'hsl(217, 91%, 45%)', textDecoration: 'underline' }
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
const footer = { fontSize: '12px', color: '#777777', lineHeight: '1.5', margin: 0 }
