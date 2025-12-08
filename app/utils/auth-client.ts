import { createAuthClient } from "better-auth/vue"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: import.meta.client ? (process.env.BETTER_AUTH_URL || "http://localhost:3000") : (process.env.NUXT_AUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000"),
    plugins: [
        adminClient()
    ]
})