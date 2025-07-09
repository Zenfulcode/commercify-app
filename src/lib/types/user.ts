export interface CommercifyUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: 'admin' | 'user';
	createdAt: string | null; // ISO date string
	updatedAt: string | null; // ISO date string
}
