export type CreateDiscount = {
	description: string;
	code: string;
	type: 'percentage' | 'fixed'; // 'percentage' or 'fixed'
	method: 'cart' | 'product'; // 'cart' or 'product'
	value: number /* float64 */;
	minimumOrderAmount: number /* float64 */;
	usageLimit?: number /* int */;
	startDate: string; // ISO date string
	expiresAt: string | null; // ISO date string
	isActive: boolean;
	productIds?: number /* uint */[];
	categoryIds?: number /* uint */[];
};

export type Discount = {
	id: number;
	description?: string;
	code: string;
	type: string;
	method: string;
	value: number /* float64 */;
	minOrderValue: number /* float64 */;
	maxDiscountValue: number /* float64 */;
	productIds?: number /* uint */[];
	categoryIds?: number /* uint */[];
	startDate: string;
	expiresAt: string;
	usageLimit: number /* int */;
	currentUsage: number /* int */;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};
