import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'

const POKEMON = ['Pikachu', 'Bulbasaur', 'Chameleon', 'Squirtle', 'Onyx']
const USERNAME_KEY = 'ping-it-username'

const generateUsername = () =>
	`${POKEMON[Math.floor(Math.random() * POKEMON.length)] + '-' + nanoid()}`

export default function useUsername() {
	const [username, setUsername] = useState<string | null>(null)

	useEffect(() => {
		let storedUser = localStorage.getItem(USERNAME_KEY)

		if (storedUser) {
			setUsername(storedUser)
			return
		}
		let newUsername = generateUsername()
		localStorage.setItem(USERNAME_KEY, newUsername)
		setUsername(newUsername)
	}, [])

	return username
}
