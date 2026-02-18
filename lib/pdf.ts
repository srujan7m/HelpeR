import pdf from 'pdf-parse'
import PDFDocument from 'pdfkit'
import { MoMResult } from '@/types'

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer)
        return data.text
    } catch (error: any) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`)
    }
}

export async function generateMomPdf(momData: MoMResult): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument()
            const chunks: Buffer[] = []

            doc.on('data', (chunk) => chunks.push(chunk))
            doc.on('end', () => resolve(Buffer.concat(chunks)))
            doc.on('error', reject)

            // Header
            doc.fontSize(20).text('Interview Minutes of Meeting', { align: 'center' })
            doc.moveDown()

            // Summary
            doc.fontSize(16).text('Summary', { underline: true })
            doc.fontSize(12).text(momData.summary)
            doc.moveDown()

            // Key Points
            doc.fontSize(16).text('Key Points', { underline: true })
            momData.keyPoints.forEach((point, index) => {
                doc.fontSize(12).text(`${index + 1}. ${point}`)
            })
            doc.moveDown()

            // Technical Discussion
            doc.fontSize(16).text('Technical Discussion', { underline: true })
            momData.technicalDiscussion.forEach((item, index) => {
                doc.fontSize(12).text(`${index + 1}. ${item}`)
            })
            doc.moveDown()

            // Candidate Strengths
            doc.fontSize(16).text('Candidate Strengths', { underline: true })
            momData.candidateStrengths.forEach((strength, index) => {
                doc.fontSize(12).text(`${index + 1}. ${strength}`)
            })
            doc.moveDown()

            // Candidate Weaknesses
            doc.fontSize(16).text('Areas for Improvement', { underline: true })
            momData.candidateWeaknesses.forEach((weakness, index) => {
                doc.fontSize(12).text(`${index + 1}. ${weakness}`)
            })
            doc.moveDown()

            // Interviewer Notes
            doc.fontSize(16).text('Interviewer Notes', { underline: true })
            momData.interviewerNotes.forEach((note, index) => {
                doc.fontSize(12).text(`${index + 1}. ${note}`)
            })
            doc.moveDown()

            // Recommendation
            doc.fontSize(16).text('Recommendation', { underline: true })
            doc.fontSize(12).text(momData.recommendation)
            doc.moveDown()

            // Next Steps
            doc.fontSize(16).text('Next Steps', { underline: true })
            momData.nextSteps.forEach((step, index) => {
                doc.fontSize(12).text(`${index + 1}. ${step}`)
            })

            doc.end()
        } catch (error) {
            reject(error)
        }
    })
}
