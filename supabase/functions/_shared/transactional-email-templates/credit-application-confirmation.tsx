import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Link, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  planName?: string
  vehicleName?: string
  documentCount?: number
  whatsappUrl?: string
}

const Email = ({ name, planName, vehicleName, documentCount, whatsappUrl }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Recibimos tu documentación de crédito</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>RIGOBERTO MOLINA · JAC</Text>
        <Heading style={h1}>Recibimos tu documentación</Heading>
        <Text style={text}>
          {name ? `Hola ${name}, ` : 'Hola, '}
          tu documentación fue enviada al ejecutivo JAC para revisión y aprobación.
        </Text>
        <Container style={box}>
          <Text style={row}><strong>Plan:</strong> {planName || '—'}</Text>
          <Text style={row}><strong>Modelo:</strong> {vehicleName || 'Por definir'}</Text>
          <Text style={row}><strong>Documentos recibidos:</strong> {documentCount ?? 0}</Text>
        </Container>
        <Text style={text}>
          Te contactaremos con el resultado o si hace falta algún recaudo adicional.
        </Text>
        {whatsappUrl ? (
          <Text style={text}>
            ¿Dudas? Escríbeme por <Link style={link} href={whatsappUrl}>WhatsApp</Link>.
          </Text>
        ) : null}
        <Text style={note}>
          Requisitos, aprobación y condiciones sujetos a validación con el asesor.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Recibimos tu documentación de crédito JAC',
  displayName: 'Confirmación de documentación al cliente',
  previewData: {
    name: 'María',
    planName: 'CrediJAC 35x35',
    vehicleName: 'Arena Sport Manual',
    documentCount: 5,
    whatsappUrl: 'https://wa.me/584143200146',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 25px', maxWidth: '560px' }
const brand = { color: '#00B5C8', fontSize: '12px', fontWeight: 'bold' as const, letterSpacing: '2px' }
const h1 = { color: '#1a1a2e', fontSize: '22px', margin: '8px 0' }
const box = { backgroundColor: '#f4f6f8', borderRadius: '8px', padding: '12px 16px', margin: '16px 0' }
const row = { color: '#1a1a2e', fontSize: '14px', margin: '4px 0' }
const text = { color: '#4a4a55', fontSize: '14px', lineHeight: '1.6' }
const note = { color: '#6b7280', fontSize: '12px', lineHeight: '1.5', margin: '14px 0 0' }
const link = { color: '#00B5C8' }
