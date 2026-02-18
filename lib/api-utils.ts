import { NextResponse, NextRequest } from 'next/server'
import { ZodSchema } from 'zod'
import { ApiResponse, ApiError } from '@/types'

export function apiResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
        success: true,
        data,
        message,
    })
}

export function apiError(error: string, status = 500, details?: any): NextResponse<ApiError> {
    return NextResponse.json(
        {
            success: false,
            error,
            details,
        },
        { status }
    )
}

export function withErrorHandler(
    handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
    return async (req: NextRequest, context?: any): Promise<NextResponse> => {
        try {
            return await handler(req, context)
        } catch (error: any) {
            console.error('API Error:', error)

            if (error.message === 'Unauthorized') {
                return apiError('Unauthorized', 401)
            }

            if (error.message === 'Forbidden') {
                return apiError('Forbidden', 403)
            }

            return apiError(error.message || 'Internal server error', 500)
        }
    }
}

export async function validateRequest<T>(schema: ZodSchema<T>, data: any): Promise<T> {
    try {
        return schema.parse(data)
    } catch (error: any) {
        throw new Error(`Validation failed: ${error.message}`)
    }
}
