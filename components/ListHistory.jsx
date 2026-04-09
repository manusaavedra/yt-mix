import { BsTrash } from "react-icons/bs"
import useInput from "../app/hooks/input"
import { useHistory, useVideos } from "../app/store"
import { timeago } from "@/helpers"

export default function ListHistory({ onAddToFirstPlayer, onAddToSecondPlayer }) {
    const searchInput = useInput()
    const { history, removeItemHistory, removeAllHistory, findByVideoTitle } = useHistory()
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
        <>
            <div className="sticky left-0 top-[40px] z-30 mb-4 flex flex-col gap-3 bg-neutral-900 pb-2 pt-4">
                <div>
                    <input className="h-11 !w-full !rounded-full border border-neutral-700 bg-neutral-900 !px-4 text-sm text-neutral-200 outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 md:text-base" onChange={searchInput.onChange} value={searchInput.value} type="text" placeholder="Buscar..." />
                </div>
                <button onClick={removeAllHistory} className="flex w-full items-center justify-center gap-2 rounded-md bg-black bg-opacity-40 p-2 font-semibold">
                    <BsTrash />
                    Borrar historial
                </button>
            </div>
            <ul>
                {
                    history.length === 0 && (
                        <li>Historial vacío</li>
                    )
                }
                {
                    findByVideoTitle(searchInput.value).map((item) => (
                        <li className="group relative grid grid-cols-[30px_1fr_auto] sm:grid-cols-[30px_40px_1fr_auto] items-center gap-2 border-b border-gray-800 py-4 px-1" key={item.id.videoId}>
                            <div>
                                <button
                                    className="bg-gray-700 text-white p-2 font-semibold rounded-md"
                                    onClick={() => removeItemHistory(item)}
                                >
                                    <BsTrash />
                                </button>
                            </div>
                            <picture className="w-[38px] hidden sm:block">
                                <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} />
                            </picture>
                            <div className="min-w-0 pr-16">
                                <p className="w-full overflow-hidden text-xs text-ellipsis whitespace-nowrap md:w-[180px]">{item.snippet.title}</p>
                                <span className="text-xs text-gray-700 font-bold">{timeago(new Date(item.date))}</span>
                            </div>
                            <div className="absolute top-4 right-2 flex gap-4 items-center">
                                <div className="flex items-center gap-2 md:hidden md:group-hover:flex">
                                    <button className="bg-red-500 font-bold text-white px-2" onClick={() => handleAddToFirstPlayer(item)}>
                                        1
                                    </button>
                                    <button className="bg-blue-500 font-bold text-white px-2" onClick={() => handleAddToSecondPlayer(item)}>
                                        2
                                    </button>
                                </div>
                            </div>
                        </li>
                    )).reverse()
                }
            </ul>
        </>
    )
}
