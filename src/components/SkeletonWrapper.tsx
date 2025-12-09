import { ReactNode } from 'react'

const SkeletonWrapper = ({
	children,
	isFetching,
}: {
	children: ReactNode
	isFetching: boolean
}) => {
	if (!isFetching) return children

	return (
		<div className='animate-pulse bg-gray-500'>
			<div className='opacity-0 pointer-events-none'>{children}</div>
		</div>
	)
}

export default SkeletonWrapper
