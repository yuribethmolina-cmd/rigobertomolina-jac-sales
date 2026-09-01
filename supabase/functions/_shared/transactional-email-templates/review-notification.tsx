import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  customerName?: string
  vehicleName?: string
  rating?: number
  message?: string
  hasPhoto?: boolean
  createdAt?: string
}

const stars = (n?: number) => {
  const r = Math.max(0, Math.min(5, Math.round(n || 0)))
  return '★'.repeat(r) + '☆'.repeat(5 - r)
}

const Email = ({ customerName, vehicleName, rating, message, hasPhoto, createdAt }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Nueva reseña{customerName ? ` de ${customerName}` : ''}{vehicleName ? ` — ${vehicleName}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>RIGOBERTO MOLINA · JAC</Text>
        <Heading style={h1}>Nueva reseña publicada</Heading>
        <Container style={box}>
          <Text style={row}><strong>Cliente:</strong> {customerName || '—'}</Text>
          <Text style={row}><strong>Modelo:</strong> {vehicleName || '—'}</Text>
          <Text style={row}><strong>Calificación:</strong> {stars(rating)} ({rating || 0}/5)</Text>
          <Text style={row}><strong>Foto adjunta:</strong> {hasPhoto ? 'Sí' : 'No'}</Text>
          {createdAt ? <Text style={row}><strong>Fecha:</strong> {createdAt}</Text> : null}
          <Hr style={hr} />
          <Text style={row}><strong>Reseña:</strong></Text>
          <Text style={reviewText}>{message || '—'}</Text>
        </Container>
        <Text style={text}>
          Las reseñas nuevas quedan pendientes de aprobación. Modérala desde tu panel:{' '}
          <Link style={link} href="https://rigobertomolina.com/resenas/moderar">rigobertomolina.com/resenas/moderar</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Nueva reseña: ${d.customerName || 'cliente'}${d.vehicleName ? ` — ${d.vehicleName}` : ''} (${d.rating || 0}/5)`,
  displayName: 'Notificación de reseña a Rigoberto',
  to: 'rigobertomolina6@gmail.com',
  previewData: {
    customerName: 'María Pérez',
    vehicleName: 'Arena Sport Manual',
    rating: 5,
    message: 'Compré con Pago Fácil. Excelente atención y entrega rápida.',
    hasPhoto: true,
    createdAt: '01/09/2026, 14:30',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 25px', maxWidth: '560px' }
const brand = { color: '#00B5C8', fontSize: '12px', fontWeight: 'bold' as const, letterSpacing: '2px' }
const h1 = { color: '#1a1a2e', fontSize: '22px', margin: '8px 0' }
const box = { backgroundColor: '#f4f6f8', borderRadius: '8px', padding: '12px 16px', margin: '16px 0' }
const row = { color: '#1a1a2e', fontSize: '14px', margin: '4px 0' }
const reviewText = { color: '#1a1a2e', fontSize: '14px', lineHeight: '1.6', margin: '4px 0' }
const hr = { borderColor: '#e5e7eb', margin: '10px 0' }
const text = { color: '#4a4a55', fontSize: '14px', lineHeight: '1.6' }
const link = { color: '#00B5C8' }
