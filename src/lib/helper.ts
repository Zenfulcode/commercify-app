import type { Price } from './types';

export function formatCurrency(price: Price): string {
	try {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: price.currency
		}).format(price.amount);
	} catch (error) {
		// Fallback formatting
		return `${price.currency} ${price.amount.toFixed(2)}`;
	}
}

export function getStockStatus(stock: number) {
	if (stock === 0) return { label: 'Out of Stock', class: 'bg-red-100 text-red-800' };
	if (stock < 10) return { label: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
	return { label: 'In Stock', class: 'bg-green-100 text-green-800' };
}

export function formatDate(dateString: string) {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function getStatusColor(status: string) {
	switch (status.toLowerCase()) {
		case 'completed':
		case 'paid':
			return 'bg-green-100 text-green-800';
		case 'pending':
		case 'processing':
			return 'bg-yellow-100 text-yellow-800';
		case 'cancelled':
		case 'failed':
			return 'bg-red-100 text-red-800';
		case 'shipped':
			return 'bg-blue-100 text-blue-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
}

export function getOrderStatusColor(status: string) {
	switch (status) {
		case 'completed':
			return 'bg-green-100 text-green-800';
		case 'processing':
			return 'bg-blue-100 text-blue-800';
		case 'pending':
			return 'bg-yellow-100 text-yellow-800';
		case 'cancelled':
			return 'bg-red-100 text-red-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
}
