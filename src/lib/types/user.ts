export interface CommercifyUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: 'admin' | 'user';
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
}
