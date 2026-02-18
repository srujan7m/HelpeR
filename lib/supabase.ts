import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function getSupabase() {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase environment variables are not configured')
        }

        supabaseInstance = createClient(supabaseUrl, supabaseKey)
    }
    return supabaseInstance
}

export async function uploadResume(file: File, applicationId: string): Promise<string> {
    const fileName = `resumes/${applicationId}-${Date.now()}.pdf`

    const { data, error } = await getSupabase().storage
        .from('helper-files')
        .upload(fileName, file, {
            contentType: 'application/pdf',
            upsert: false,
        })

    if (error) {
        throw new Error(`Failed to upload resume: ${error.message}`)
    }

    return getPublicUrl(data.path)
}

export async function uploadMomPdf(buffer: Buffer, interviewId: string): Promise<string> {
    const fileName = `mom/${interviewId}-${Date.now()}.pdf`

    const { data, error } = await getSupabase().storage
        .from('helper-files')
        .upload(fileName, buffer, {
            contentType: 'application/pdf',
            upsert: false,
        })

    if (error) {
        throw new Error(`Failed to upload MoM PDF: ${error.message}`)
    }

    return getPublicUrl(data.path)
}

export function getPublicUrl(path: string): string {
    const { data } = getSupabase().storage.from('helper-files').getPublicUrl(path)
    return data.publicUrl
}
