"use client"

import { fetchVideos, useFavorites, useStoreVideos, useVideos } from "./store";
import Header from "./components/Header";
import AsideBar from "./components/AsideBar";
import Controls from "./components/Controls";
import VideoItem from "./components/VideoItem";
import useMobile from "./hooks/useMobile";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function Home() {
    const { isMobile } = useMobile()
    const { videos, toFirstPlayer, toSecondPlayer, searchVideos } = useVideos()
    const { toFavorites } = useFavorites()

    const { data } = useQuery({
        queryKey: ['listvideos'],
        queryFn: async () => await fetchVideos(),
        initialData: [],
        refetchOnWindowFocus: false
    })

    useEffect(() => {
        useStoreVideos.setState({ videos: data || [] })
    }, [data])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { search } = Object.fromEntries(new FormData(e.target))
        searchVideos(search)
    }

    if (isMobile) {
        return (
            <div className="grid place-items-center h-screen p-4">
                <p>Lo sentimos, <b>Ytmix</b> aún no esta adaptado para móviles.
                    Usa un ordenador para poder usar Ytmix</p>
            </div>
        )
    }

    return (
        <div className="h-screen overflow-hidden">
            <Header />
            <main className="grid grid-cols-[260px_1fr] gap-2">
                <AsideBar />
                <div className="w-full bg-neutral-950">
                    <Controls />
                    <form className="w-full shadow-xl p-4" onSubmit={handleSubmit}>
                        <input className="w-full" type="text" name="search" placeholder="Buscar en youtube..." />
                    </form>
                    <div className="w-full mx-auto p-4 overflow-auto h-[calc(100vh-380px)]">
                        {videos?.length !== 0 && <h4 className="font-bold text-base my-4">Resultados:</h4>}
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] place-content-center gap-4">
                            {
                                videos.map((video) => (
                                    <VideoItem
                                        key={video.id.videoId}
                                        videoId={video.id.videoId}
                                        imageUrl={video.snippet.thumbnails.medium.url}
                                        title={video.snippet.title}
                                        onFavorite={() => toFavorites(video)}
                                        onAddToFirstPlayer={() => toFirstPlayer(video)}
                                        onAddToSecondPlayer={() => toSecondPlayer(video)}
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
