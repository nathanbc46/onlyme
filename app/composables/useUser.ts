import type { User } from 'better-auth'

export function useUser() {
    const user = useState<User | null>('user', () => null)

    async function getCurrentUser() {
        try {
            const session = await authClient.getSession({
                fetchOptions: {
                    headers: useRequestHeaders(['cookie'])
                }
            })
            if (session.error || !session.data) {
                user.value = null
                return
            } else {
                user.value = session.data.user
            }
        } catch (error) {
            console.error(error)
            user.value = null
        }
    }

    async function signOut() {
        await authClient.signOut()
        user.value = null
    }

    async function signin(email: string, password: string, rememberMe?: boolean) {
        const { data, error } = await authClient.signIn.email({
            email,
            password,
            rememberMe
        })
        if (error) {
            throw new Error(error.message)
        }
        await getCurrentUser()
        return data
    }

    async function updateUser(name: string, avatarUrl?: string) {
        if (!user.value) {
            return
        }


        if (user.value) {
            try {
                const { data, error } = await authClient.updateUser({
                    name,
                    image: avatarUrl
                })
                if (error) {
                    throw new Error(error.message)
                }
                await getCurrentUser()
                return data
            } catch (error) {
                console.error(error)
            }

        }
    }

    async function changePassword(currentPassword: string, newPassword: string) {
        if (!user.value) {
            return
        }
        try {
            const { data, error } = await authClient.changePassword({
                currentPassword,
                newPassword
            })
            if (error) {
                throw new Error(error.message)
            }
            await getCurrentUser()
            return data
        } catch (error) {
            console.error(error);
        }
    }

    async function listUsers() {
        if (!user.value) {
            return []
        }

        const pageSize = 10;
        const currentPage = 1;

        try {
            const users = await authClient.admin.listUsers({
                query: {
                    limit: pageSize,
                    offset: (currentPage - 1) * pageSize
                }
            });
            if (users.error) {
                throw new Error(users.error.message)
            }
            return users
        } catch (error) {
            console.error(error);
        }
    }



    return { user, getCurrentUser, signOut, signin, updateUser, changePassword, listUsers }
}