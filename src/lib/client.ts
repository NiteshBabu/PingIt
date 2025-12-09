import { treaty } from '@elysiajs/eden'
import type { app } from '../app/api/[[...slugs]]/route'

// this require .api to enter /api prefix
export const client = treaty<app>(
	process.env.NODE_ENV === 'production'
		? process.env.NEXT_PUBLIC_BASE_URL!
		: 'localhost:3000'
).api
