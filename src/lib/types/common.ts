export interface PaginatedData<T> {
	items: T[]; // Array of items in the current page
	pagination: {
		currentPage: number; // Current page number
		totalPages: number; // Total number of pages
		totalItems: number; // Total number of items across all pages
		itemsPerPage: number; // Number of items per page
	};
}

export interface Price {
	currency: string; // Currency code (e.g., 'USD', 'EUR')
	amount: number; // Amount in the smallest unit (e.g., cents for USD)
}
