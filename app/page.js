"use client"

import { useFavorites, useVideos } from "./store";
import Header from "./components/Header";
import AsideBar from "./components/AsideBar";
import Controls from "./components/Controls";
import VideoItem from "./components/VideoItem";

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
                    <div className="max-w-7xl mx-auto p-4 overflow-auto h-[calc(100vh-380px)]">
                        {videos?.length !== 0 && <h4 className="font-bold text-base my-4">Resultados:</h4>}
                        <div className="grid grid-cols-[repeat(5,200px)] gap-4 justify-center">
                            {
                                videos.map((video) => (
                                    <VideoItem
                                        key={video.id.videoId}
                                        imageUrl={video.snippet.thumbnails.medium.url}
                                        title={video.snippet.title}
                                        onFavorite={() => toFavorites(video)}
                                        onAddToFirstPlayer={() => toPlaylist({
                                            id: video.id.videoId,
                                            title: video.snippet.title,
                                        }, 'firstPlayer')}
                                        onAddToSecondPlayer={() => toPlaylist({
                                            id: video.id.videoId,
                                            title: video.snippet.title,
                                        }, 'secondPlayer')}
                                    />
                                ))
                            }
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
