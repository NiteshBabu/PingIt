import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'

const POKEMON = ['Pikachu', 'Bulbasaur', 'Chameleon', 'Squirtle', 'Onyx']
const USERNAME_KEY = 'ping-it-username'

const generateUsername = () =>
	`${POKEMON[Math.floor(Math.random() * POKEMON.length)] + '-' + nanoid()}`

export default function useUsername() {
	const [username, setUsername] = useState<string | null>(null)

	useEffect(() => {
		const storedUser = localStorage.getItem(USERNAME_KEY)
		if (storedUser) {
			setUsername(storedUser)
			return
		}
		const newName = generateUsername()
		setUsername(newName)
		localStorage.setItem(USERNAME_KEY, newName)
	}, [username])

	return username
}
