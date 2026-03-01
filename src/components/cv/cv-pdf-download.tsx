'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { CvPdfTemplate } from './cv-pdf-template'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { WaveBars } from '@/components/loading'
import type { CvRenderData } from '@/lib/types/cv'

interface CvPdfDownloadProps {
  data: CvRenderData
  fileName: string
}

export function CvPdfDownload({ data, fileName }: CvPdfDownloadProps) {
  return (
    <PDFDownloadLink
      document={<CvPdfTemplate data={data} />}
      fileName={fileName}
    >
      {({ loading: pdfLoading }) => (
        <Button disabled={pdfLoading} className="gap-2">
          {pdfLoading ? <WaveBars size="sm" /> : <Download className="w-4 h-4" />}
          Download PDF
        </Button>
      )}
    </PDFDownloadLink>
  )
}
