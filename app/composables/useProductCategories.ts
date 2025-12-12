import type { ProductCategory } from '~/types/product-category'

export function useProductCategories() {
    async function createProductCategory(data: ProductCategory) {
        try
        {
            const productCategory = await $fetch('/api/product-categories', {
                method: 'POST',
                body: data
            })
            return productCategory
        } catch (error) {
            throw createError({
                statusCode: 400,
                statusMessage: (error as Error).message
            })
        }
    }

    async function getProductCategories(key?: string) {
        try
        {
            const q = key ? key : ''
            const productCategories = await $fetch<{ id: string; name: string }[]>('/api/product-categories?k=' + q)
            return productCategories
        } catch (error) {
            throw createError({
                statusCode: 400,
                statusMessage: (error as Error).message
            })
        }
    }

    async function updateProductCategory(id: string, data: ProductCategory) {
        try
        {
        const productCategory = await $fetch<{data : ProductCategory}>(`/api/product-categories/${id}`, {
                method: 'PUT',
                body: data
            })
            return productCategory.data
        } catch (error) {
            throw createError({
                statusCode: 400,
                statusMessage: (error as Error).message
            })
        }
    }

    async function deleteProductCategory(id: string) {
        try
        {
            const productCategory = await $fetch<{data : ProductCategory}>(`/api/product-categories/${id}`, {
                method: 'DELETE'
            })
            return productCategory.data
        } catch (error) {
            throw createError({
                statusCode: 400,
                statusMessage: (error as Error).message
            })
        }
    }

    return {
        createProductCategory,
        getProductCategories,
        updateProductCategory,
        deleteProductCategory
    }
}