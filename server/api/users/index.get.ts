import { auth } from "~/utils/auth"; // path to your auth file

export default defineEventHandler(async (event) => {
    const user = await getCurrentUser(event)
    if (!user) {
        return
    }

    try {
        const users = await auth.api.listUsers({
            query: {
                limit: 100,
                offset: 0,
                sortBy: "name",
                sortDirection: "desc"
            },
            headers: {
                cookie: getHeader(event, 'cookie') || ''
            }
        })
        return users
    } catch (error) {
        console.log(error)
    }

})