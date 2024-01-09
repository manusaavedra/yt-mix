import { BsClockHistory, BsHeart, BsTrash } from "react-icons/bs"
import { useState } from "react"
import ListFavorites from "./ListFavorites"
import ListHistory from "./ListHistory"

export default function AsideBar() {
    const [section, setSection] = useState("history")

    const handleSection = (section) => {
        setSection(section)
    }

    const COMPONENTS = {
        history: {
            title: "Historial",
            icon: <BsClockHistory />,
            panel: <ListHistory />
        },
        favorites: {
            title: "Favoritos",
            icon: <BsHeart />,
            panel: <ListFavorites />
        }
    }

    return (
        <aside className="bg-neutral-950 h-[calc(100vh-50px)] overflow-auto min-w-[260px] max-w-[260px] px-2 py-4">
            <div className="flex items-center justify-between">
                {
                    Object.keys(COMPONENTS).map((tab) => {
                        const isActive = section === tab

                        return (
                            <div className={`${isActive ? 'text-gray-300 border-b-2 border-gray-300' : 'text-neutral-800'} font-semibold flex px-2 items-center gap-2 cursor-default`} key={tab} onClick={() => handleSection(tab)}>
                                {COMPONENTS[tab].icon}
                                {COMPONENTS[tab].title}
                            </div>
                        )
                    })
                }
            </div>
            <div>
                {COMPONENTS[section].panel}
            </div>
        </aside >
    )
}