import { Elysia, t } from 'elysia'
import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'
import { authMiddleware } from './auth'

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
	.use(authMiddleware)
	.get('/ttl', async ({ auth }) => {
		const { roomId } = auth

		const ttl = await redis.ttl(`meta:${roomId}`)
		return ttl <= 0 ? 0 : ttl
	})
	.delete(
		'/',
		async ({ auth }) => {
			console.log(auth)
			const { roomId } = auth


			Promise.all([redis.del(`meta:${roomId}`)])
		},
		{
			query: t.Object({
				roomId: t.String(),
			}),
		}
	)

const messages = new Elysia({ prefix: '/messages' }).post(
	'/',
	async ({ body }) => {
		const { message, sender, roomId } = body

		const _message = {
			id: nanoid(),
			message,
			sender,
			timestamp: Date.now(),
			roomId,
		}

		await redis.rpush(`messages:${roomId}`, _message)
	},
	{
		roomId: t.String(),
		body: t.Object({
			message: t.String(),
			sender: t.String(),
			roomId: t.String(),
		}),
	}
)

const app = new Elysia({ prefix: 'api' }).use(room).use(messages)

export type app = typeof app

export const GET = app.fetch
export const POST = app.fetch
export const DELETE = app.fetch
