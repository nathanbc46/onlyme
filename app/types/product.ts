export interface Product {
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

export interface ProductInput {
    id?: string
    name: string
    price: number
    cost: number
    image?: string | null
    categoryId: string
}