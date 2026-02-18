type LogLevel = 'info' | 'warn' | 'error'

interface LogContext {
    [key: string]: any
}

function log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const logData = {
        timestamp,
        level,
        message,
        ...context,
    }

    const logString = JSON.stringify(logData)

    switch (level) {
        case 'error':
            console.error(logString)
            break
        case 'warn':
            console.warn(logString)
            break
        default:
            console.log(logString)
    }
}

export const logger = {
    info: (message: string, context?: LogContext) => log('info', message, context),
    warn: (message: string, context?: LogContext) => log('warn', message, context),
    error: (message: string, context?: LogContext) => log('error', message, context),
}
