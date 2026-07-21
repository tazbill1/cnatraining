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

interface RepRow {
  name: string
  sessions: number
  modulesCompleted: number
  drillsPlayed: number
}

interface Props {
  siteName?: string
  siteUrl?: string
  dealershipName?: string
  weekLabel?: string
  activeReps?: number
  totalReps?: number
  totalSessions?: number
  totalModulesCompleted?: number
  totalDrillsPlayed?: number
  topReps?: RepRow[]
  inactiveReps?: string[]
  teamUrl?: string
}

export const ManagerWeeklyDigestEmail = ({
  siteName = 'Sales Training',
  siteUrl = '#',
  dealershipName = 'Your team',
  weekLabel = 'this past week',
  activeReps = 0,
  totalReps = 0,
  totalSessions = 0,
  totalModulesCompleted = 0,
  totalDrillsPlayed = 0,
  topReps = [],
  inactiveReps = [],
  teamUrl = '#',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {dealershipName} weekly training summary — {activeReps}/{totalReps} reps
      active
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Weekly training summary</Heading>
        <Text style={muted}>
          {dealershipName} · {weekLabel}
        </Text>

        <Section style={statsBox}>
          <Text style={statLine}>
            <strong>{activeReps}</strong> of {totalReps} reps trained this week
          </Text>
          <Text style={statLine}>
            <strong>{totalSessions}</strong> roleplay sessions completed
          </Text>
          <Text style={statLine}>
            <strong>{totalModulesCompleted}</strong> modules finished
          </Text>
          <Text style={statLine}>
            <strong>{totalDrillsPlayed}</strong> drill plays
          </Text>
        </Section>

        {topReps.length > 0 && (
          <>
            <Heading as="h2" style={h2}>
              Top performers
            </Heading>
            {topReps.map((rep, i) => (
              <Text key={i} style={text}>
                <strong>{rep.name}</strong> — {rep.sessions} session
                {rep.sessions === 1 ? '' : 's'}, {rep.modulesCompleted} module
                {rep.modulesCompleted === 1 ? '' : 's'}, {rep.drillsPlayed}{' '}
                drill{rep.drillsPlayed === 1 ? '' : 's'}
              </Text>
            ))}
          </>
        )}

        {inactiveReps.length > 0 && (
          <>
            <Heading as="h2" style={h2}>
              Reps who didn't train this week
            </Heading>
            <Text style={text}>{inactiveReps.join(', ')}</Text>
            <Text style={muted}>Consider a quick check-in to unblock them.</Text>
          </>
        )}

        <Button style={button} href={teamUrl}>
          Open team dashboard
        </Button>

        <Hr style={hr} />
        <Text style={footer}>
          You're getting this because you manage a{' '}
          <Link href={siteUrl} style={link}>
            {siteName}
          </Link>{' '}
          team.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ManagerWeeklyDigestEmail

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
  margin: '0 0 4px',
}
const h2 = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: 'hsl(222, 47%, 11%)',
  margin: '24px 0 8px',
}
const text = {
  fontSize: '14px',
  color: 'hsl(215, 16%, 30%)',
  lineHeight: '1.6',
  margin: '0 0 8px',
}
const muted = {
  fontSize: '13px',
  color: '#777777',
  margin: '0 0 16px',
}
const statsBox = {
  backgroundColor: '#f6f8fa',
  borderRadius: '12px',
  padding: '16px 18px',
  margin: '16px 0 8px',
}
const statLine = {
  fontSize: '14px',
  color: 'hsl(215, 16%, 20%)',
  margin: '0 0 6px',
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
  margin: '20px 0',
}
const hr = { borderColor: '#eaeaea', margin: '28px 0 16px' }
const footer = {
  fontSize: '12px',
  color: '#777777',
  lineHeight: '1.5',
  margin: 0,
}
