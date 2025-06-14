export interface PaginatedData<T> {
	items: T[]; // Array of items in the current page
	pagination: {
		currentPage: number; // Current page number
		totalPages: number; // Total number of pages
		totalItems: number; // Total number of items across all pages
		itemsPerPage: number; // Number of items per page
	};
}
