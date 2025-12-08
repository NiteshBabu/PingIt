'use client'

import { client } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useState } from 'react'

const Page = () => {
	const [copyBtnText, setCopyBtnText] = useState('Copy')
	const { id } = useParams()

	const handleCopy = async () => {
		setCopyBtnText('Copied!')
		await navigator.clipboard.writeText(location.href)
		setTimeout(() => setCopyBtnText('Copy'), 3000)
	}
	return (
		<div className=' h-screen grid grid-row-[auto_1fr_auto] py-5'>
			<div className='flex gap-4 items-center justify-end self-start'>
				<button
					onClick={handleCopy}
					className='bg-emerald-500 px-3 text-sm py-2 rounded-md font-bold cursor-pointer disabled:opacity-70 disabled:pointer-events-none'>
					{copyBtnText}
				</button>
				<p className='font-bold font-mono'>{id}</p>
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
				/>
				<button className='border bg-emerald-500 px-5 py-3 font-bold cursor-pointer mt-auto disabled:opacity-70 disabled:pointer-events-none'>
					Send
				</button>
			</div>
		</div>
	)
}

export default Page
