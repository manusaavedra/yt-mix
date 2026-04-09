import { BsClockHistory, BsHeart, BsTrash } from "react-icons/bs"
import { useState } from "react"
import ListFavorites from "./ListFavorites"
import ListHistory from "./ListHistory"

export default function AsideBar({ onAddToFirstPlayer, onAddToSecondPlayer }) {
    const [section, setSection] = useState("history")

    const handleSection = (section) => {
        setSection(section)
    }

    const COMPONENTS = {
        history: {
            title: "Historial",
            icon: <BsClockHistory />,
            panel: <ListHistory onAddToFirstPlayer={onAddToFirstPlayer} onAddToSecondPlayer={onAddToSecondPlayer} />
        },
        favorites: {
            title: "Favoritos",
            icon: <BsHeart />,
            panel: <ListFavorites onAddToFirstPlayer={onAddToFirstPlayer} onAddToSecondPlayer={onAddToSecondPlayer} />
        }
    }

    return (
        <aside className="relative px-1 pb-2">
            <div className="sticky top-0 z-40  flex items-center gap-2 overflow-x-auto bg-neutral-900 px-3 py-2">
                {
                    Object.keys(COMPONENTS).map((tab) => {
                        const isActive = section === tab

                        return (
                            <div className={`${isActive ? 'bg-red-500 text-white font-semibold border-red-500' : 'text-neutral-500'} rounded-lg border border-gray-600/50 py-1 flex shrink-0 cursor-default items-center gap-2 px-2`} key={tab} onClick={() => handleSection(tab)}>
                                {COMPONENTS[tab].icon}
                                {COMPONENTS[tab].title}
                            </div>
                        )
                    })
                }
            </div>
            <div className="relative">
                {COMPONENTS[section].panel}
            </div>
        </aside >
    )
}
