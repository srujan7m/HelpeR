import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIScoreResult, MoMResult } from '@/types'

let genAI: GoogleGenerativeAI | null = null

function getGenAI() {
    if (!genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
    }
    return genAI
}

export async function screenResume(
    translatedText: string,
    jobDescription: string,
    keywords: string[] = []
): Promise<AIScoreResult> {
    const prompt = `You are an expert HR recruiter. Analyze the following resume against the job description and specific keywords. Provide a detailed evaluation.

Job Description:
${jobDescription}

Keywords to Look For:
${keywords.length > 0 ? keywords.join(', ') : 'None specified'}

Resume:
${translatedText}

Provide a JSON response with the following structure:
{
  "overallScore": <number 0-100>,
  "technicalSkills": <number 0-100>,
  "experience": <number 0-100>,
  "education": <number 0-100>,
  "culturalFit": <number 0-100>,
  "keywordMatch": <number 0-100>,
  "summary": "<brief summary>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "concerns": ["<concern 1>", "<concern 2>", ...],
  "recommendation": "<STRONG_YES|YES|MAYBE|NO|STRONG_NO>"
}`

    const model = getGenAI().getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
        },
    })

    const result = await model.generateContent([
        { text: 'You are an expert HR recruiter.' },
        { text: prompt },
    ])

    const response = result.response
    const content = response.text()

    if (!content) {
        throw new Error('No response from Gemini AI')
    }

    return JSON.parse(content) as AIScoreResult
}

export async function generateMoM(
    transcript: string,
    jobDescription: string,
    resumeSummary: string
): Promise<MoMResult> {
    const prompt = `You are an expert interview analyst. Generate a comprehensive Minutes of Meeting (MoM) from the following interview transcript.

Job Description:
${jobDescription}

Resume Summary:
${resumeSummary}

Interview Transcript:
${transcript}

Provide a JSON response with the following structure:
{
  "summary": "<overall interview summary>",
  "keyPoints": ["<point 1>", "<point 2>", ...],
  "technicalDiscussion": ["<discussion 1>", "<discussion 2>", ...],
  "candidateStrengths": ["<strength 1>", "<strength 2>", ...],
  "candidateWeaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "interviewerNotes": ["<note 1>", "<note 2>", ...],
  "recommendation": "<detailed recommendation>",
  "nextSteps": ["<step 1>", "<step 2>", ...]
}`

    const model = getGenAI().getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
        },
    })

    const result = await model.generateContent([
        { text: 'You are an expert interview analyst.' },
        { text: prompt },
    ])

    const response = result.response
    const content = response.text()

    if (!content) {
        throw new Error('No response from Gemini AI')
    }

    return JSON.parse(content) as MoMResult
}
