export function useDashboard() {

    async function getSalesToday() {
        try {
            const sales = await $fetch('/api/dashboard/sales-today');
            return sales;
        } catch (error) {
            console.error('Error fetching sales:', error);
            throw error;
        }
    }

    return {
        getSalesToday
    }
}