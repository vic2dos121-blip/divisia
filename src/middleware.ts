export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    /*
     * Protege todas las rutas excepto:
     * - /login (página de acceso)
     * - /api/auth/* (endpoints de NextAuth)
     * - archivos estáticos (_next, favicon, etc.)
     */
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
