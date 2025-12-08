'use client'

import { client } from '@/lib/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60

	return `${mins}:${secs.toString().padStart(2, '0')}`
}

const Page = () => {
	const [timer, setTimer] = useState<number | null>(null)
	const [copyBtnText, setCopyBtnText] = useState('Copy')
	const [msg, setMsg] = useState('')
	const { id } = useParams()

	const router = useRouter()

	const handleCopy = async () => {
		setCopyBtnText('Copied!')
		await navigator.clipboard.writeText(location.href)
		setTimeout(() => setCopyBtnText('Copy'), 3000)
	}

	const { mutate: createMessage } = useMutation({
		mutationFn: () =>
			client.messages.post({
				sender: 'token',
				message: msg,
				roomId: id as string,
			}),
		onSuccess: () => {
			setMsg('')
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
			router.push("/?error=room_destroyed")
		}
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

	return (
		<div className=' h-screen grid grid-row-[auto_1fr_auto] py-5 font-mono'>
			<div className='flex justify-between items-center self-start'>
				<div className='flex gap-4 items-center'>
					<button
						onClick={() => destroyRoom()}
						className='bg-red-500 px-3 text-sm py-2 rounded-md font-bold cursor-pointer disabled:opacity-70 disabled:pointer-events-none'>
						Destroy Room
					</button>
					<p
						className={`font-bold ${
							timer && timer < 300 ? 'text-red-500' : 'text-amber-400'
						}`}>
						{timer && timer >= 1 ? formatTime(timer) : 'XX:XX'}
					</p>
				</div>
				<div className='flex gap-4 items-center justify-end '>
					<button
						onClick={handleCopy}
						className='bg-emerald-500 px-3 text-sm py-2 rounded-md font-bold cursor-pointer disabled:opacity-70 disabled:pointer-events-none'>
						{copyBtnText}
					</button>
					<p className='font-bold font-mono'>{id}</p>
				</div>
			</div>
			<div className=''>Message</div>
			<div className='self-end flex'>
				<label htmlFor='message' className='sr-only'>
					Message
				</label>
				<input
					type='text'
					id='message'
					className='border w-full p-1 outline-none'
					onChange={(e) => setMsg(e.target.value)}
					autoFocus
					value={msg}
				/>
				<button
					className='border bg-emerald-500 px-5 py-3 font-bold cursor-pointer mt-auto disabled:opacity-70 disabled:pointer-events-none'
					onClick={() => createMessage()}>
					Send
				</button>
			</div>
		</div>
	)
}

export default Page
