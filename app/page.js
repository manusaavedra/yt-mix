"use client"

import { useRef } from "react"
import YouTube from 'react-youtube';
import { useFavorites, useStoreVideos, useVideos } from "./store";
import Header from "./components/Header";
import AsideBar from "./components/AsideBar";
import Controls from "./components/Controls";

export default function Home() {
    const { videos, toPlaylist, searchVideos } = useVideos()
    const { toFavorites } = useFavorites()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { search } = Object.fromEntries(new FormData(e.target))
        searchVideos(search)
    }

    return (
        <div className="h-screen overflow-hidden">
            <Header />
            <main className="flex gap-2">
                <AsideBar />
                <div className="w-full">
                    <Controls />
                    <form className="max-w-4xl mx-auto p-4" onSubmit={handleSubmit}>
                        <div>
                            <input className="w-full" type="text" name="search" placeholder="Buscar en youtube..." />
                        </div>
                    </form>
                    <div className="w-full mx-auto p-4 overflow-auto h-[calc(100vh-380px)]">
                        {videos?.length !== 0 && <h4 className="font-bold text-base my-4">Resultados:</h4>}
                        <div className="flex flex-wrap gap-4">
                            {
                                videos.map((video) => (
                                    <div className="relative group overflow-hidden bg-black bg-opacity-30 border max-w-[200px] w-full rounded-md p-2" key={video.id.videoId}>
                                        <picture>
                                            <img className="w-full" src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} />
                                        </picture>
                                        <h4 className="font-bold">{video.snippet.title}</h4>
                                        <div className="group-hover:block hidden absolute top-2 right-2">
                                            <button className="bg-yellow-500 text-black px-1 font-semibold rounded-md" onClick={() => toFavorites(video)}>Add Favorito</button>
                                        </div>
                                        <div className="group-hover:flex absolute bottom-0 left-0 w-full hidden items-center gap-2">
                                            <button className="w-1/2 bg-red-500 bg-opacity-60 text-4xl font-bold text-white" onClick={() => toPlaylist({
                                                id: video.id.videoId,
                                                title: video.snippet.title,
                                            }, 'firstPlayer')}>
                                                1
                                            </button>
                                            <button className="w-1/2 bg-blue-500 bg-opacity-60 text-4xl font-bold text-white" onClick={() => toPlaylist({
                                                id: video.id.videoId,
                                                title: video.snippet.title,
                                            }, 'secondPlayer')}>
                                                2
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
