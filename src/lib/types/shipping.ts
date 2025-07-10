export interface ShippingOption {
	methodId: number;
	name: string;
	description: string;
	cost: number;
	estimatedDelivery: number;
	freeShipping: boolean;
}
