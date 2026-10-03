import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  phone?: string
  city?: string
  modelInterest?: string
  purchaseMethod?: string
  initialBudget?: string
  monthlyBudget?: string
  leadScore?: string
  summary?: string
}

const SCORE: Record<string, string> = { hot: 'Caliente', warm: 'Tibio', cold: 'Frío' }

const Email = (p: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Nuevo lead del asesor{p.modelInterest ? ` — ${p.modelInterest}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>RIGOBERTO MOLINA · JAC</Text>
        <Heading style={h1}>Nuevo lead del Asesor JAC</Heading>
        <Container style={box}>
          <Text style={row}><strong>Interés:</strong> {SCORE[p.leadScore ?? ''] ?? '—'}</Text>
          <Text style={row}><strong>Nombre:</strong> {p.name || '—'}</Text>
          <Text style={row}><strong>WhatsApp:</strong> {p.phone || '—'}</Text>
          <Text style={row}><strong>Ciudad:</strong> {p.city || '—'}</Text>
          <Hr style={hr} />
          <Text style={row}><strong>Modelo:</strong> {p.modelInterest || '—'}</Text>
          <Text style={row}><strong>Forma de compra:</strong> {p.purchaseMethod || '—'}</Text>
          <Text style={row}><strong>Inicial:</strong> {p.initialBudget || '—'}</Text>
          <Text style={row}><strong>Pago mensual:</strong> {p.monthlyBudget || '—'}</Text>
          {p.summary ? (
            <>
              <Hr style={hr} />
              <Text style={row}><strong>Conversación:</strong></Text>
              <Text style={pre}>{p.summary}</Text>
            </>
          ) : null}
        </Container>
        <Text style={text}>
          Si el cliente abrió WhatsApp, su mensaje debería llegarte en breve. También lo tienes en tu panel:{' '}
          <Link style={link} href="https://rigobertomolina.com/estadisticas">rigobertomolina.com/estadisticas</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Nuevo lead del asesor: ${d.modelInterest || 'sin modelo'}${d.name ? ` — ${d.name}` : ''}`,
  displayName: 'Notificación de lead del asesor a Rigoberto',
  to: 'rigobertomolina6@gmail.com',
  previewData: {
    name: 'María Pérez',
    phone: '0414 000 0000',
    city: 'Caracas',
    modelInterest: 'Arena Sport Manual',
    leadScore: 'hot',
    summary: 'Cliente: ¿Cuánto es la cuota del Arena?\nAsesor: En Pago Fácil son 12 cuotas de US$ 1.272,60.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px' }
const brand = { fontSize: '12px', letterSpacing: '2px', color: '#00B5C8', fontWeight: 'bold' as const }
const h1 = { fontSize: '22px', color: '#0f172a', margin: '8px 0 16px' }
const box = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }
const row = { fontSize: '14px', color: '#0f172a', margin: '4px 0' }
const pre = { fontSize: '13px', color: '#334155', whiteSpace: 'pre-wrap' as const, margin: '4px 0' }
const hr = { borderColor: '#e2e8f0', margin: '10px 0' }
const text = { fontSize: '13px', color: '#475569', marginTop: '16px' }
const link = { color: '#00B5C8' }
