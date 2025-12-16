import type { ProductInput, Product } from '~/types/product'


export function useProduct() {

    async function getProducts(k: string = '', active: string = '') {
        try
        {
            const q = k ? k : ''
            const products = await $fetch<Product[]>('/api/products?k=' + q + '&active=' + active)
            return products
        } catch (error) {
            throw createError({
                statusCode: 400,
                statusMessage: (error as Error).message
            })
        }
    }

    async function createProduct(data: ProductInput) {
        try
        {
            const product = await $fetch<Product>('/api/products', {
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
            const product = await $fetch<{data: Product}>(`/api/products/${id}`, {
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

    async function updateProduct(id: string, data: ProductInput) {
        try
        {
            const product = await $fetch<{data: Product}>(`/api/products/${id}`, {
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

    async function activeProduct(id: string, active: boolean) {
        try
        {
            const product = await $fetch<{ data: Product }>('/api/products/active', {
                method: 'PATCH',
                body: { id, active }
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
        updateProduct,
        activeProduct
    }
}