'use client'

import useUsername from '@/hooks/use-username'
import { client } from '@/lib/client'
import { Message } from '@/lib/realtime'
import { useRealtime } from '@/lib/realtime-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { formatDate } from 'date-fns'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60

	return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface Group {
	username: string
	messages: Message[]
}

const groupMessages = (messages: Message[]) => {
	const groups: Group[] = []
	let current: Group | null = null

	messages.forEach((msg) => {
		if (!current || current.username != msg.sender) {
			current = {
				username: msg.sender,
				messages: [msg],
			}
			groups.push(current)
		} else {
			current.messages.push(msg)
		}
	})

	return groups
}
const Page = () => {
	const [timer, setTimer] = useState<number | null>(null)
	const [copyBtnText, setCopyBtnText] = useState('Copy')
	const [msg, setMsg] = useState('')
	const { id } = useParams()
	const username = useUsername()

	const router = useRouter()

	const handleCopy = async () => {
		setCopyBtnText('Copied!')
		navigator.clipboard.writeText(location.href)

		setTimeout(() => {
			setCopyBtnText('Copy')
		}, 3000)
	}

	const {
		data: messages,
		refetch,
		isPending,
	} = useQuery({
		queryFn: () =>
			client.messages.get({
				query: { roomId: id as string },
			}),
		queryKey: ['messages', id],
	})

	const { mutate: createMessage } = useMutation({
		mutationFn: () => {
			setMsg('')
			return client.messages.post(
				{
					sender: username!,
					message: msg,
				},
				{
					query: { roomId: id as string },
				}
			)
		},
	})

	const { data: ttl } = useQuery({
		queryFn: () =>
			client.room.ttl.get({
				query: {
					roomId: id,
				},
			}),
		queryKey: ['room'],
	})

	const { mutate: destroyRoom } = useMutation({
		mutationFn: () =>
			client.room.delete(null, { query: { roomId: id as string } }),
		onSuccess: () => {
			router.push('/?error=room_destroyed')
		},
	})

	useEffect(() => {
		setTimer(ttl?.data ?? 0)
		const id = setInterval(() => {
			setTimer((old) => {
				if (old && old <= 1) {
					clearInterval(id)
					router.push('/?error=room_expired')
					return 0
				}
				return old && old - 1
			})
		}, 1000)

		return () => clearInterval(id)
	}, [ttl])

	useRealtime({
		channels: [id as string],
		events: ['chat.message', 'chat.destroy'],
		onData: ({ event }) => {
			if (event === 'chat.message') refetch()
			if (event === 'chat.destroy') router.push('/?error=room_destroyed')
		},
	})

	return (
		<div className=' h-screen grid grid-row-[auto_1fr_auto] py-5 font-mono'>
			<div className='flex justify-between items-center self-start flex-wrap'>
				<div className='flex gap-2 items-center'>
					<button
						onClick={() => destroyRoom()}
						className='bg-red-500 px-3 text-sm py-1 rounded-md font-bold cursor-pointer disabled:opacity-70 disabled:pointer-events-none'>
						Destroy Room
					</button>
					<p
						className={`font-bold ${
							timer && timer < 300
								? 'text-red-500 animate-pulse'
								: 'text-amber-400'
						}`}>
						{timer && timer >= 1 ? formatTime(timer) : 'XX:XX'}
					</p>
				</div>
				<p className='text-xs'>{username}</p>
				<div className='flex gap-2 items-center justify-end '>
					<p className=' font-mono'>{id}</p>
					<button
						onClick={handleCopy}
						disabled={copyBtnText === 'Copied!'}
						className='bg-emerald-500 px-3 text-sm py-1 rounded-md font-bold cursor-pointer disabled:opacity-70 disabled:pointer-events-none'>
						{copyBtnText}
					</button>
				</div>
			</div>
			<div className='grid gap-2'>
				{groupMessages(messages?.data ?? []).map((group) => (
					<ul
						key={group.messages[0].id}
						className={`flex flex-col gap-2 ${
							group.username === username ? 'items-end' : 'items-start'
						} `}>
						<li>
							<span
								className={`text-[13px] lowercase px-2 py-1 flex items-center font-bold ${
									group.username === username
										? 'bg-emerald-500 rounded-tl-2xl rounded-bl-2xl'
										: 'bg-indigo-500 rounded-tr-2xl rounded-br-2xl'
								}`}>
								{group.username === username ? 'You' : group.username}
							</span>
						</li>
						{group.messages.map((m) => (
							<li key={m.id} className={`flex flex-col`}>
								<span className='text-base'>{m.message}</span>
								<span
									className={`text-[10px] ${
										m.sender === username ? 'ml-auto' : ''
									}`}>
									{formatDate(m.timestamp, 'h:mm a')}
								</span>
							</li>
						))}
					</ul>
				))}
			</div>
			<div className='self-end flex items-center gap-2 relative'>
				<label htmlFor='message' className='sr-only'>
					Message
				</label>
				<input
					type='text'
					id='message'
					className='border w-full px-4 pr-14 outline-none rounded-full h-[51px]'
					maxLength={100}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && msg.trim()) createMessage()
					}}
					onChange={(e) => setMsg(e.target.value)}
					autoFocus
					value={msg}
				/>
				<button
					className='border bg-emerald-500  font-bold cursor-pointer mt-auto disabled:opacity-70 disabled:pointer-events-none rounded-full absolute right-0 h-[50px] w-[50px] flex items-center justify-center group border-white'
					onClick={() => createMessage()}
					disabled={!msg.trim()}
					title='send'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='25'
						height='25'
						className='group-hover:translate-x-0.5 group-hover:-translate-y-0.5  duration-200'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'>
						<path d='M7 7h10v10' />
						<path d='M7 17 17 7' />
					</svg>
				</button>
			</div>
		</div>
	)
}

export default Page

export const runtime = 'edge'