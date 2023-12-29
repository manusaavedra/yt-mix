import useInput from "../hooks/input"
import { useFavorites, useVideos } from "../store"

export default function AsideBar() {
    const searchInput = useInput()
    const { favorites, findByVideoTitle } = useFavorites()
    const { toFirstPlayer, toSecondPlayer } = useVideos()

    return (
        <aside className="bg-black h-[calc(100vh-60px)] overflow-auto min-w-[260px] max-w-[260px] px-2">
            <div className="sticky top-0 bg-black mb-4 left-0 pt-4 pb-2">
                <h4 className="font-semibold mb-2">Favoritos</h4>
                <input className="w-full" onChange={searchInput.onChange} value={searchInput.value} type="text" placeholder="Buscar favorito" />
            </div>
            <ul>
                {
                    favorites.length === 0 && (
                        <li>No hay favoritos aún</li>
                    )
                }
                {
                    findByVideoTitle(searchInput.value).map((fav) => (
                        <li className="border-b" key={fav.id.videoId}>
                            <picture>
                                <img src={fav.snippet.thumbnails.medium.url} alt={fav.snippet.title} />
                            </picture>
                            <div className="flex items-center justify-end">
                                {fav.snippet.title}
                                <div className="flex items-center gap-2">
                                    <button className="bg-red-500 font-bold text-white px-2" onClick={() => toFirstPlayer({
                                        id: fav.id.videoId,
                                        title: fav.snippet.title,
                                    })}>
                                        1
                                    </button>
                                    <button className="bg-blue-500 font-bold text-white px-2" onClick={() => toSecondPlayer({
                                        id: fav.id.videoId,
                                        title: fav.snippet.title,
                                    })}>
                                        2
                                    </button>
                                </div>
                            </div>
                        </li>
                    )).reverse()
                }
            </ul>
        </aside>
    )
}