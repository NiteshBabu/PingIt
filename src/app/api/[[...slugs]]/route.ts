import { Elysia } from 'elysia'
import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'
import { authMiddleware } from './auth'
import z from 'zod'
import { Message, realtime } from '@/lib/realtime'

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
			const { roomId } = auth

			Promise.all([
				redis.del(`meta:${roomId}`),
				redis.del(`messages:${roomId}`),
				redis.del(roomId),
			])
			await realtime.channel(roomId).emit('chat.destroy', {
				isDestroyed: true,
			})
		},
		{
			query: z.object({
				roomId: z.string(),
			}),
		}
	)

const messages = new Elysia({ prefix: '/messages' })
	.use(authMiddleware)
	.post(
		'/',
		async ({ body, auth }) => {
			const { message, sender } = body
			const { roomId } = auth

			const room = redis.exists(`meta:${roomId}`)

			if (!room) throw new Error("Room doesn't esists")

			const _message: Message = {
				id: nanoid(),
				message,
				sender,
				timestamp: Date.now(),
				roomId,
			}

			await redis.rpush(`messages:${roomId}`, _message)
			await realtime.channel(roomId).emit('chat.message', _message)

			// cleanup
			const remainingTime = await redis.ttl(`meta:${roomId}`)
			await redis.expire(`messages:${roomId}`, remainingTime)
			await redis.expire(roomId, remainingTime)
		},
		{
			body: z.object({
				message: z.string().min(1).max(100),
				sender: z.string(),
			}),
			query: z.object({
				roomId: z.string(),
			}),
		}
	)
	.get(
		'/',
		async ({ auth }) => {
			const { roomId } = auth
			const messages = await redis.lrange<Message>(`messages:${roomId}`, 0, -1)

			return messages.map((m) => ({
				...m,
				token: m.token === auth.token ? auth.token : undefined,
			}))
		},
		{
			query: z.object({ roomId: z.string() }),
		}
	)

const app = new Elysia({ prefix: 'api' }).use(room).use(messages)

export type app = typeof app

export const GET = app.fetch
export const POST = app.fetch
export const DELETE = app.fetch
