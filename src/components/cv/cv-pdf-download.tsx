'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { CvPdfTemplate } from './cv-pdf-template'
import { Button } from '@/components/ui/button'
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
        <Button disabled={pdfLoading} className="gap-2 bg-[#005d42] hover:bg-[#047857] text-white">
          {pdfLoading ? <WaveBars size="sm" /> : <span className="material-symbols-outlined text-base">download</span>}
          Download PDF
        </Button>
      )}
    </PDFDownloadLink>
  )
}
