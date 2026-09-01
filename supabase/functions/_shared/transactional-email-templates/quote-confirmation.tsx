import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  vehicleName?: string
  planName?: string
  reviewUrl?: string
  whatsappUrl?: string
}

const Email = ({ name, vehicleName, planName, reviewUrl, whatsappUrl }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu solicitud de cotización JAC fue recibida — Rigoberto Molina</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>RIGOBERTO MOLINA · JAC</Text>
        <Heading style={h1}>Recibimos tu solicitud</Heading>
        <Text style={text}>Hola{name ? ` ${name}` : ''},</Text>
        <Text style={text}>
          Gracias por tu interés. Ya registré tu solicitud de cotización y te
          contactaré personalmente muy pronto con todos los detalles.
        </Text>
        <Container style={summaryBox}>
          <Text style={summaryRow}><strong>Modelo:</strong> {vehicleName || 'Por definir'}</Text>
          <Text style={summaryRow}><strong>Plan de pago:</strong> {planName || 'Por definir'}</Text>
        </Container>
        {whatsappUrl ? (
          <Button style={button} href={whatsappUrl}>Escríbeme por WhatsApp</Button>
        ) : null}
        <Hr style={hr} />
        <Text style={text}>
          ¿Ya eres cliente JAC? Cuéntanos tu experiencia, toma menos de un minuto:
        </Text>
        {reviewUrl ? (
          <Link style={link} href={reviewUrl}>Dejar mi reseña</Link>
        ) : null}
        <Text style={footer}>
          Rigoberto Molina — Vendedor independiente JAC, Caracas, Venezuela.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Tu cotización JAC${d.vehicleName ? ` — ${d.vehicleName}` : ''} fue recibida`,
  displayName: 'Confirmación de cotización al cliente',
  previewData: {
    name: 'María',
    vehicleName: 'Arena Sport Manual',
    planName: 'Compra Directa',
    reviewUrl: 'https://rigobertomolina.com/resena?modelo=arena-sport-manual&plan=compra-directa',
    whatsappUrl: 'https://wa.me/584120000000',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 25px', maxWidth: '560px' }
const brand = { color: '#00B5C8', fontSize: '12px', fontWeight: 'bold' as const, letterSpacing: '2px' }
const h1 = { color: '#1a1a2e', fontSize: '24px', margin: '8px 0' }
const text = { color: '#4a4a55', fontSize: '15px', lineHeight: '1.6' }
const summaryBox = { backgroundColor: '#f4f6f8', borderRadius: '8px', padding: '12px 16px', margin: '16px 0' }
const summaryRow = { color: '#1a1a2e', fontSize: '14px', margin: '4px 0' }
const button = {
  backgroundColor: '#00B5C8', color: '#ffffff', borderRadius: '8px',
  padding: '12px 24px', fontSize: '15px', fontWeight: 'bold' as const,
  textDecoration: 'none', display: 'inline-block', margin: '8px 0',
}
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const link = { color: '#00B5C8', fontSize: '15px', fontWeight: 'bold' as const }
const footer = { color: '#9ca3af', fontSize: '12px', marginTop: '24px' }
