import { useMemo } from 'react'

const POKE_SPRITES = [25, 1, 4, 7, 52, 39, 133, 150, 95, 66, 37, 63, 54] // Pikachu, Bulba, Charmander, Squirtle, Meowth, Eevee, Mewtwo, etc.

export default function PokemonSpriteSkeleton() {
	const spriteId = useMemo(
		() => POKE_SPRITES[Math.floor(Math.random() * POKE_SPRITES.length)],
		[]
	)

	const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png`

	return (
		<div className='flex items-center justify-center gap-3 animate-[wiggle_1s_ease-in-out_infinite]'>
			<img src={spriteUrl} alt='loading pokemon' className='' />
		</div>
	)
}
