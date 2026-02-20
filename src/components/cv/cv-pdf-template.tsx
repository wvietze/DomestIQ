'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CvRenderData } from '@/lib/types/cv'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 12, marginBottom: 16 },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#111827' },
  contactRow: { flexDirection: 'row', gap: 16, marginTop: 6, color: '#6b7280' },
  services: { marginTop: 4, color: '#2563eb', fontSize: 9 },
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', marginBottom: 8, marginTop: 16 },
  entryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  entryTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  entrySubtitle: { color: '#6b7280', fontSize: 9 },
  entryDate: { color: '#9ca3af', fontSize: 8 },
  entryDescription: { color: '#4b5563', fontSize: 9, marginTop: 2, marginBottom: 8 },
  borderLeft: { borderLeftWidth: 2, borderLeftColor: '#bfdbfe', paddingLeft: 10, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: { backgroundColor: '#f3f4f6', borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8 },
  blueChip: { backgroundColor: '#eff6ff', borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8, color: '#1d4ed8' },
  twoCol: { flexDirection: 'row', gap: 24 },
  col: { flex: 1 },
  statement: { color: '#374151', lineHeight: 1.5, fontSize: 10 },
  footer: { textAlign: 'center', marginTop: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', color: '#9ca3af', fontSize: 7 },
})

interface CvPdfTemplateProps {
  data: CvRenderData
}

export function CvPdfTemplate({ data }: CvPdfTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.full_name}</Text>
          <View style={styles.contactRow}>
            {data.phone && <Text>{data.phone}</Text>}
            {data.email && <Text>{data.email}</Text>}
            {(data.suburb || data.city) && <Text>{[data.suburb, data.city].filter(Boolean).join(', ')}</Text>}
          </View>
          {data.services.length > 0 && (
            <Text style={styles.services}>{data.services.join(' | ')}</Text>
          )}
          {data.rating && data.review_count ? (
            <Text style={{ ...styles.contactRow, marginTop: 2 }}>
              Rating: {data.rating.toFixed(1)} ({data.review_count} reviews)
            </Text>
          ) : null}
        </View>

        {/* Personal Statement */}
        {data.personal_statement && (
          <View>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.statement}>{data.personal_statement}</Text>
          </View>
        )}

        {/* Work History */}
        {data.work_history.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {data.work_history.map((w, i) => (
              <View key={i} style={styles.borderLeft}>
                <View style={styles.entryRow}>
                  <View>
                    <Text style={styles.entryTitle}>{w.role}</Text>
                    <Text style={styles.entrySubtitle}>{w.employer}</Text>
                  </View>
                  <Text style={styles.entryDate}>{w.start_date} — {w.end_date || 'Present'}</Text>
                </View>
                {w.description && <Text style={styles.entryDescription}>{w.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((e, i) => (
              <View key={i} style={styles.entryRow}>
                <View>
                  <Text style={styles.entryTitle}>{e.qualification}</Text>
                  <Text style={styles.entrySubtitle}>{e.institution}</Text>
                </View>
                <Text style={styles.entryDate}>{e.year}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills & Languages */}
        <View style={styles.twoCol}>
          {data.skills.length > 0 && (
            <View style={styles.col}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.chipRow}>
                {data.skills.map((s, i) => <Text key={i} style={styles.chip}>{s}</Text>)}
              </View>
            </View>
          )}
          {data.languages.length > 0 && (
            <View style={styles.col}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.chipRow}>
                {data.languages.map((l, i) => <Text key={i} style={styles.chip}>{l}</Text>)}
              </View>
            </View>
          )}
        </View>

        {/* Top Traits */}
        {data.top_traits && Object.keys(data.top_traits).length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Client Feedback</Text>
            <View style={styles.chipRow}>
              {Object.entries(data.top_traits).sort(([, a], [, b]) => b - a).slice(0, 6).map(([trait, count]) => (
                <Text key={trait} style={styles.blueChip}>{trait} ({count})</Text>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated via DomestIQ — domestiq.co.za</Text>
        </View>
      </Page>
    </Document>
  )
}
