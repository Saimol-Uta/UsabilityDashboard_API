import axios from 'axios'

/**
 * Extracts a user-friendly error message from an API error response.
 * Checks for `message`, `errors`, and `title` fields in the response body.
 */
export function extractErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data

    if (data) {
      // Common ASP.NET Core patterns
      if (typeof data === 'string') return data
      if (typeof data.message === 'string' && data.message) return data.message
      if (typeof data.title === 'string' && data.title) return data.title

      // Validation errors object { errors: { field: ["msg1"] } }
      if (data.errors && typeof data.errors === 'object') {
        const messages = Object.values(data.errors)
          .flat()
          .filter((m): m is string => typeof m === 'string')
        if (messages.length > 0) return messages.join('. ')
      }

      // Array of error strings
      if (Array.isArray(data)) {
        const msgs = data.filter((m): m is string => typeof m === 'string')
        if (msgs.length > 0) return msgs.join('. ')
      }
    }

    // HTTP status fallback
    if (error.response?.status === 404) return 'Recurso no encontrado'
    if (error.response?.status === 409) return 'Conflicto: el recurso ya existe o fue modificado'
    if (error.response?.status === 400) return 'Datos inválidos. Revisa los campos del formulario'
    if (error.response?.status === 500) return 'Error interno del servidor'
  }

  if (error instanceof Error) return error.message

  return fallback
}
