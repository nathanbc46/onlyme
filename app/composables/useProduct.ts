interface Product {
    id?: string
    name: string
    price: number
    cost: number
    image?: string | null
    categoryId: string
}

interface Products {
    id: string
    name: string
    price: number
    cost: number
    category: {
        id: string
        name: string
    }
    image?: string
}

export function useProduct() {

    async function getProducts(key?: string) {
        try
        {
            const q = key ? key : ''
            const products = await $fetch<Products[]>('/api/products?k=' + q)
            return products
        } catch (error) {
            throw createError({
                statusCode: 400,
                statusMessage: (error as Error).message
            })
        }
    }

    async function createProduct(data: Product) {
        try
        {
            const product = await $fetch<Products>('/api/products', {
                method: 'POST',
                body: data
            })
            return product
        } catch (error) {
            throw createError({
                statusCode: 400,
                statusMessage: (error as Error).message
            })
        }
    }

    async function deleteProduct(id: string) {
        try
        {
            const product = await $fetch<{data: Products}>(`/api/products/${id}`, {
                method: 'DELETE'
            })
            return product.data
        } catch (error) {
            throw createError({
                statusCode: 400,
                statusMessage: (error as Error).message
            })
        }
    }

    async function updateProduct(id: string, data: Product) {
        try
        {
            const product = await $fetch<{data: Products}>(`/api/products/${id}`, {
                method: 'PUT',
                body: data
            })
            return product.data
        } catch (error) {
            throw createError({
                statusCode: 400,
                statusMessage: (error as Error).message
            })
        }
    }

    return {
        getProducts,
        createProduct,
        deleteProduct,
        updateProduct
    }
}