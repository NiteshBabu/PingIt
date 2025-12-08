'use client'

import useUsername from '@/hooks/use-username'
import { client } from '@/lib/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export default function Home() {
	const username = useUsername()
	const router = useRouter()

	const { refetch, isFetching } = useQuery({
		queryFn: async () => {
			const res = await client.room.create.get()
			if (res.status === 200) {
				router.push(`/room/${res.data?.roomId}`)
			}
			return null
		},
		enabled: false,
		queryKey: ['room'],
	})
	return (
		<div className='h-screen grid gap-10 place-content-center font-mono'>
			<h1 className='text-5xl font-bold text-center'>PingIt</h1>
			<div className='flex flex-col gap-5 w-2xl shadow shadow-white  h-[300px] '>
				<p className='text-center font-bold my-5 flex flex-col gap-1 justify-center'>
					Welcome,
					<span className='text-center text-xl text-lime-400'>{username}</span>
				</p>
				<button
					className='bg-emerald-500 px-5 py-3 font-bold cursor-pointer mt-auto disabled:opacity-70 disabled:pointer-events-none'
					disabled={isFetching}
					onClick={() => refetch()}>
					Create Room
				</button>
			</div>
		</div>
	)
}
