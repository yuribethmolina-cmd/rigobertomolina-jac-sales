import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  phone?: string
  email?: string
  city?: string
  vehicleName?: string
  planName?: string
  message?: string
}

const Email = ({ name, phone, email, city, vehicleName, planName, message }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Nueva solicitud de cotización{vehicleName ? ` — ${vehicleName}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>RIGOBERTO MOLINA · JAC</Text>
        <Heading style={h1}>Nueva cotización solicitada</Heading>
        <Container style={box}>
          <Text style={row}><strong>Nombre:</strong> {name || '—'}</Text>
          <Text style={row}><strong>Teléfono:</strong> {phone || '—'}</Text>
          <Text style={row}><strong>Correo:</strong> {email || '—'}</Text>
          <Text style={row}><strong>Ciudad:</strong> {city || '—'}</Text>
          <Hr style={hr} />
          <Text style={row}><strong>Modelo:</strong> {vehicleName || '—'}</Text>
          <Text style={row}><strong>Plan:</strong> {planName || '—'}</Text>
          {message ? <Text style={row}><strong>Mensaje:</strong> {message}</Text> : null}
        </Container>
        <Text style={text}>
          También la tienes en tu panel:{' '}
          <Link style={link} href="https://rigobertomolina.com/estadisticas">rigobertomolina.com/estadisticas</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Nueva cotización: ${d.vehicleName || 'modelo'} — ${d.name || 'cliente'}`,
  displayName: 'Notificación de cotización a Rigoberto',
  to: 'rigobertomolina6@gmail.com',
  previewData: {
    name: 'María Pérez',
    phone: '+58 412 1234567',
    email: 'maria@ejemplo.com',
    city: 'Caracas',
    vehicleName: 'Arena Sport Manual',
    planName: 'Compra Directa',
    message: 'Tengo inicial disponible.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 25px', maxWidth: '560px' }
const brand = { color: '#00B5C8', fontSize: '12px', fontWeight: 'bold' as const, letterSpacing: '2px' }
const h1 = { color: '#1a1a2e', fontSize: '22px', margin: '8px 0' }
const box = { backgroundColor: '#f4f6f8', borderRadius: '8px', padding: '12px 16px', margin: '16px 0' }
const row = { color: '#1a1a2e', fontSize: '14px', margin: '4px 0' }
const hr = { borderColor: '#e5e7eb', margin: '10px 0' }
const text = { color: '#4a4a55', fontSize: '14px', lineHeight: '1.6' }
const link = { color: '#00B5C8' }
