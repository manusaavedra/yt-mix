import { BsTrash } from "react-icons/bs"
import useInput from "../app/hooks/input"
import { useFavorites, useVideos } from "../app/store"

export default function ListFavorites({ onAddToFirstPlayer, onAddToSecondPlayer }) {
    const searchInput = useInput()
    const { favorites, removeFavorite, findByVideoTitle } = useFavorites()
    const { toFirstPlayer, toSecondPlayer } = useVideos()

    const handleAddToFirstPlayer = (item) => {
        if (onAddToFirstPlayer) {
            onAddToFirstPlayer(item)
            return
        }

        toFirstPlayer(item)
    }

    const handleAddToSecondPlayer = (item) => {
        if (onAddToSecondPlayer) {
            onAddToSecondPlayer(item)
            return
        }

        toSecondPlayer(item)
    }

    return (
        <div>
            <div className="sticky left-0 top-[52px] z-30 mb-4 flex flex-col gap-3 bg-neutral-900 pb-2 pt-4">
                <div>
                    <h4 className="mb-2 font-semibold">Favoritos</h4>
                    <input className="w-full !py-1" onChange={searchInput.onChange} value={searchInput.value} type="text" placeholder="Buscar favorito" />
                </div>
            </div>
            <ul>
                {
                    favorites.length === 0 && (
                        <li>No hay favoritos aún</li>
                    )
                }
                {
                    findByVideoTitle(searchInput.value).map((fav) => (
                        <li className="group relative flex items-center gap-2 border-b border-gray-800 py-4 px-1" key={fav.id.videoId}>
                            <div className="absolute left-2 top-3 block md:hidden md:group-hover:block">
                                <button
                                    className="bg-gray-700 text-white p-2 font-semibold rounded-md"
                                    onClick={() => removeFavorite(fav)}
                                >
                                    <BsTrash />
                                </button>
                            </div>
                            <picture className="w-[38px]">
                                <img src={fav.snippet.thumbnails.medium.url} alt={fav.snippet.title} />
                            </picture>
                            <p className="w-full overflow-hidden pr-16 text-xs text-ellipsis whitespace-nowrap md:w-[180px]">{fav.snippet.title}</p>
                            <div className="absolute top-4 right-2 flex gap-4 items-center">
                                <div className="flex items-center gap-2 md:hidden md:group-hover:flex">
                                    <button
                                        className="bg-red-500 font-bold text-white px-2"
                                        onClick={() => handleAddToFirstPlayer(fav)}
                                    >
                                        1
                                    </button>
                                    <button
                                        className="bg-blue-500 font-bold text-white px-2"
                                        onClick={() => handleAddToSecondPlayer(fav)}
                                    >
                                        2
                                    </button>
                                </div>
                            </div>
                        </li>
                    )).reverse()
                }
            </ul>
        </div>
    )
}
