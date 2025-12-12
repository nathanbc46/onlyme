export interface Order {
  id?: string
  orderNumber: string
  totalAmount: number | string
  totalCost: number | string | null
  status: string
  remark?: string | null
  createdAt?: string
  customer: {
    id: string
    name: string
  }
  orderItems: OrderItem[]
}

export interface OrderItem {
  id: string
  quantity: number | string
  price: number | string
  remark?: string | null
  product: {
    id: string
    name: string
    image?: string | null
    cost: number | string | null
  }
}