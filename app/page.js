"use client"

import { useEffect } from "react";
import { BsClockHistory, BsSearch } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import { fetchVideos, useFavorites, useStoreVideos, useVideos } from "./store";
import Header from "../components/Header";
import AsideBar from "../components/AsideBar";
import Controls from "../components/Controls";
import VideoItem from "../components/VideoItem";
import ModalButton from "../components/ModalButton";
import ToastProvider from "@/components/ToastProvider";

function SearchModal({ videos, onSubmit, onFavorite, onAddToFirstPlayer, onAddToSecondPlayer, isSearching }) {
    return (
        <div className="flex max-h-[78vh] flex-col gap-4">
            <form className="sticky top-0 z-10 bg-neutral-900" onSubmit={onSubmit}>
                <input
                    className="h-11 w-full !rounded-full border border-neutral-700 bg-neutral-900 px-4 text-sm text-neutral-200 outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 md:text-base"
                    type="search"
                    name="search"
                    autoComplete="true"
                    placeholder="Buscar en YouTube..."
                />
            </form>
            {
                isSearching && (
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <span className="w-2 h-2 rounded-full animate-ping bg-gray-200"></span>
                        Cargando...
                    </div>
                )
            }
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {videos.map((video) => (
                    <VideoItem
                        key={video.id.videoId}
                        videoId={video.id.videoId}
                        imageUrl={video.snippet.thumbnails.medium.url}
                        title={video.snippet.title}
                        onFavorite={() => onFavorite(video)}
                        onAddToFirstPlayer={() => onAddToFirstPlayer(video)}
                        onAddToSecondPlayer={() => onAddToSecondPlayer(video)}
                    />
                ))}
            </div>
        </div>
    )
}

function HistoryModal({ onAddToFirstPlayer, onAddToSecondPlayer }) {
    return (
        <div className="max-h-[78vh] overflow-auto">
            <AsideBar onAddToFirstPlayer={onAddToFirstPlayer} onAddToSecondPlayer={onAddToSecondPlayer} />
        </div>
    )
}

export default function Home() {
    const { videos, toFirstPlayer, toSecondPlayer, searchVideos, isSearching } = useVideos()
    const { toFavorites } = useFavorites()

    const { data } = useQuery({
        queryKey: ["listvideos"],
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

    const actions = (
        <ToastProvider>
            {({ showAddedToast, showSimpleMessage }) => {
                const handleAddToFirstPlayer = (video) => {
                    toFirstPlayer(video)
                    showAddedToast(`"${video.snippet.title}" se añadio al deck 1`, 1)
                }

                const handleAddToSecondPlayer = (video) => {
                    toSecondPlayer(video)
                    showAddedToast(`"${video.snippet.title}" se añadio al deck 2`, 2)
                }

                const handleAddToFavorites = (video) => {
                    toFavorites(video)
                    showSimpleMessage(`"${video.snippet.title}" se añadio a favoritos`)
                }

                return (
                    <>
                        <ModalButton
                            wrapperClassName="max-w-2xl w-full"
                            className="flex h-11 w-full items-center justify-between rounded-full border border-neutral-700 bg-neutral-900 px-4 text-left text-neutral-300 transition hover:border-neutral-500 hover:bg-neutral-800"
                            contentClassName="max-w-5xl bg-neutral-900"
                            position="top"
                            buttonContent={
                                <div className="flex w-full items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <BsSearch size={18} className="shrink-0 text-neutral-400" />
                                        <p className="truncate text-sm text-neutral-400 md:text-base">
                                            Buscar en YouTube
                                        </p>
                                    </div>
                                </div>
                            }
                        >
                            <SearchModal
                                videos={videos}
                                onSubmit={handleSubmit}
                                onFavorite={handleAddToFavorites}
                                onAddToFirstPlayer={handleAddToFirstPlayer}
                                onAddToSecondPlayer={handleAddToSecondPlayer}
                                isSearching={isSearching}
                            />
                        </ModalButton>
                        <ModalButton
                            className="grid h-10 w-10 place-items-center rounded-full border border-neutral-700 bg-neutral-900 text-white"
                            contentClassName="max-w-4xl bg-neutral-900"
                            position="top"
                            buttonContent={<BsClockHistory size={18} />}
                        >
                            <HistoryModal
                                onAddToFirstPlayer={handleAddToFirstPlayer}
                                onAddToSecondPlayer={handleAddToSecondPlayer}
                            />
                        </ModalButton>
                    </>
                )
            }}
        </ToastProvider>
    )

    return (
        <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-neutral-950">
            <Header actions={actions} />
            <main className="overflow-x-hidden">
                <Controls />
            </main>
        </div>
    )
}
