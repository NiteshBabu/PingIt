import { Elysia } from 'elysia'
import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'

const ROOM_TTL_SECONDS = 600

const room = new Elysia({ prefix: '/room' })
	.get('/create', () => {
		const roomId = nanoid()

		redis.hset(`meta:${roomId}`, {
			connected: [],
			createdAt: Date.now(),
		})
		redis.expire(`meta:${roomId}`, ROOM_TTL_SECONDS)
		return { roomId }
	})

const app = new Elysia({ prefix: 'api' }).use(room)

export type app = typeof app

export const GET = app.fetch
export const POST = app.fetch
