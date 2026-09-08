import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface DocLink {
  label?: string
  name?: string
  url?: string
}

interface Props {
  name?: string
  idNumber?: string
  phone?: string
  email?: string
  occupation?: string
  monthlyIncome?: string
  vehicleName?: string
  planName?: string
  message?: string
  documents?: DocLink[]
}

const Email = ({
  name, idNumber, phone, email, occupation, monthlyIncome,
  vehicleName, planName, message, documents = [],
}: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Nueva documentación de crédito{name ? ` — ${name}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>RIGOBERTO MOLINA · JAC</Text>
        <Heading style={h1}>Documentación de crédito recibida</Heading>
        <Container style={box}>
          <Text style={row}><strong>Nombre:</strong> {name || '—'}</Text>
          <Text style={row}><strong>Cédula / RIF:</strong> {idNumber || '—'}</Text>
          <Text style={row}><strong>Teléfono:</strong> {phone || '—'}</Text>
          <Text style={row}><strong>Correo:</strong> {email || '—'}</Text>
          <Text style={row}><strong>Ocupación:</strong> {occupation || '—'}</Text>
          <Text style={row}><strong>Ingresos:</strong> {monthlyIncome || '—'}</Text>
          <Hr style={hr} />
          <Text style={row}><strong>Modelo:</strong> {vehicleName || '—'}</Text>
          <Text style={row}><strong>Plan:</strong> {planName || '—'}</Text>
          {message ? <Text style={row}><strong>Comentarios:</strong> {message}</Text> : null}
        </Container>

        <Heading style={h2}>Documentos adjuntos</Heading>
        {documents.length === 0 ? (
          <Text style={text}>El cliente no adjuntó documentos.</Text>
        ) : (
          documents.map((doc, i) => (
            <Text key={i} style={row}>
              {doc.label ? `${doc.label}: ` : ''}
              {doc.url
                ? <Link style={link} href={doc.url}>{doc.name || 'Ver documento'}</Link>
                : (doc.name || '—')}
            </Text>
          ))
        )}
        <Text style={note}>
          Los enlaces de descarga son privados y caducan en 7 días.
        </Text>
        <Text style={text}>
          Panel de solicitudes:{' '}
          <Link style={link} href="https://rigobertomolina.com/estadisticas">rigobertomolina.com/estadisticas</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Documentación de crédito: ${d.name || 'cliente'} — ${d.planName || 'plan'}`,
  displayName: 'Documentación de crédito para el ejecutivo',
  to: 'rigobertomolina6@gmail.com',
  previewData: {
    name: 'María Pérez',
    idNumber: 'V-12345678',
    phone: '+58 412 1234567',
    email: 'maria@ejemplo.com',
    occupation: 'Comerciante',
    monthlyIncome: '1200 USD',
    vehicleName: 'Arena Sport Manual',
    planName: 'CrediJAC 35x35',
    message: 'Tengo la inicial lista.',
    documents: [{ label: 'Cédula de identidad vigente', name: 'cedula.pdf', url: 'https://ejemplo.com' }],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 25px', maxWidth: '560px' }
const brand = { color: '#00B5C8', fontSize: '12px', fontWeight: 'bold' as const, letterSpacing: '2px' }
const h1 = { color: '#1a1a2e', fontSize: '22px', margin: '8px 0' }
const h2 = { color: '#1a1a2e', fontSize: '16px', margin: '18px 0 6px' }
const box = { backgroundColor: '#f4f6f8', borderRadius: '8px', padding: '12px 16px', margin: '16px 0' }
const row = { color: '#1a1a2e', fontSize: '14px', margin: '4px 0' }
const hr = { borderColor: '#e5e7eb', margin: '10px 0' }
const text = { color: '#4a4a55', fontSize: '14px', lineHeight: '1.6' }
const note = { color: '#6b7280', fontSize: '12px', lineHeight: '1.5', margin: '10px 0' }
const link = { color: '#00B5C8' }
