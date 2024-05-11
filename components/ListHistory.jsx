import { BsTrash } from "react-icons/bs"
import useInput from "../app/hooks/input"
import { useHistory, useVideos } from "../app/store"
import { timeago } from "@/helpers"

export default function ListHistory() {
    const searchInput = useInput()
    const { history, removeItemHistory, removeAllHistory, findByVideoTitle } = useHistory()
    const { toFirstPlayer, toSecondPlayer } = useVideos()

    return (
        <div>
            <div className="sticky z-50 top-0 bg-neutral-950 mb-4 left-0 pt-4 pb-2">
                <button onClick={removeAllHistory} className="flex w-full font-semibold gap-2 items-center bg-black bg-opacity-40 mb-2 p-2 rounded-md">
                    <BsTrash />
                    Borrar historial
                </button>
                <h4 className="font-semibold mb-2">Historial</h4>
                <input className="w-full !py-1" onChange={searchInput.onChange} value={searchInput.value} type="text" placeholder="Buscar..." />
            </div>
            <ul>
                {
                    history.length === 0 && (
                        <li>Historial vacío</li>
                    )
                }
                {
                    findByVideoTitle(searchInput.value).map((item) => (
                        <li className="flex items-center gap-2 border-b border-gray-800 py-4 px-1 group relative" key={item.id.videoId}>
                            <div className="group-hover:block hidden absolute top-4 left-2">
                                <button
                                    className="bg-gray-700 text-white p-2 font-semibold rounded-md"
                                    onClick={() => removeItemHistory(item)}
                                >
                                    <BsTrash />
                                </button>
                            </div>
                            <picture className="w-[38px]">
                                <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} />
                            </picture>
                            <div>
                                <p className="text-xs truncate overflow-hidden w-[180px] ...">{item.snippet.title}</p>
                                <span className="text-xs text-gray-700 font-bold">{timeago(new Date(item.date))}</span>
                            </div>
                            <div className="absolute top-4 right-2 flex gap-4 items-center">
                                <div className="group-hover:flex items-center gap-2 hidden">
                                    <button className="bg-red-500 font-bold text-white px-2" onClick={() => toFirstPlayer(item)}>
                                        1
                                    </button>
                                    <button className="bg-blue-500 font-bold text-white px-2" onClick={() => toSecondPlayer(item)}>
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