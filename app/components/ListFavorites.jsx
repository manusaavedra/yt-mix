import { BsTrash } from "react-icons/bs"
import useInput from "../hooks/input"
import { useFavorites, useVideos } from "../store"

export default function ListFavorites() {
    const searchInput = useInput()
    const { favorites, removeFavorite, findByVideoTitle } = useFavorites()
    const { toFirstPlayer, toSecondPlayer } = useVideos()

    return (
        <div>
            <div className="sticky z-50 top-0 bg-inherit mb-4 left-0 pt-4 pb-2">
                <h4 className="font-semibold mb-2">Favoritos</h4>
                <input className="w-full !py-1" onChange={searchInput.onChange} value={searchInput.value} type="text" placeholder="Buscar favorito" />
            </div>
            <ul>
                {
                    favorites.length === 0 && (
                        <li>No hay favoritos aún</li>
                    )
                }
                {
                    findByVideoTitle(searchInput.value).map((fav) => (
                        <li className="flex items-center gap-2 border-b border-gray-800 py-4 px-1 group relative" key={fav.id.videoId}>
                            <div className="group-hover:block hidden absolute top-3 left-2">
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
                            <p className="text-xs truncate overflow-hidden w-[180px] ...">{fav.snippet.title}</p>
                            <div className="absolute top-4 right-2 flex gap-4 items-center">
                                <div className="group-hover:flex items-center gap-2 hidden">
                                    <button
                                        className="bg-red-500 font-bold text-white px-2"
                                        onClick={() => toFirstPlayer(fav)}
                                    >
                                        1
                                    </button>
                                    <button
                                        className="bg-blue-500 font-bold text-white px-2"
                                        onClick={() => toSecondPlayer(fav)}
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