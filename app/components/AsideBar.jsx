import { BsClockHistory, BsHeart, BsTrash } from "react-icons/bs"
import { useState } from "react"
import ListFavorites from "./ListFavorites"

export default function AsideBar() {
    const [section, setSection] = useState("history")

    const handleSection = (section) => {
        setSection(section)
    }

    const COMPONENTS = {
        favorites: {
            title: "Historial",
            icon: <BsClockHistory />,
            panel: <div>Historial</div>
        },
        history: {
            title: "Favoritos",
            icon: <BsHeart />,
            panel: <ListFavorites />
        }
    }

    return (
        <aside className="bg-black h-[calc(100vh-60px)] overflow-auto min-w-[260px] max-w-[260px] px-2">
            <div className="flex items-center justify-between">
                {
                    Object.keys(COMPONENTS).map((tab) => {
                        const isActive = section === tab

                        return (
                            <div className={`${isActive ? 'text-red-500 border-b-2 border-red-500' : ''} font-semibold flex px-2 items-center gap-2 cursor-default`} key={tab} onClick={() => handleSection(tab)}>
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