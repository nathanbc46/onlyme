interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string | null | undefined;
}

export function useCustomer() {
    async function getCustomers() {
        try {
            const customers = await $fetch<Customer[]>('/api/customers');
            return customers;
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    }

    async function createCustomer(data: { name: string; email?: string; phone?: string }) {
        try {
            const customer = await $fetch<Customer>('/api/customers', {
                method: 'POST',
                body: data
            });
            return customer
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    return {
        getCustomers,
        createCustomer
    }
}