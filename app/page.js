"use client"

import { useEffect, useRef, useState } from "react";
import { BsClockHistory, BsSearch } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import { fetchVideos, useFavorites, useStoreVideos, useVideos } from "./store";
import Header from "../components/Header";
import AsideBar from "../components/AsideBar";
import Controls from "../components/Controls";
import VideoItem from "../components/VideoItem";
import ModalButton from "../components/ModalButton";

function SearchModal({ videos, onSubmit, onFavorite, onAddToFirstPlayer, onAddToSecondPlayer }) {
    return (
        <div className="flex max-h-[78vh] flex-col gap-4">
            <div>
                <h3 className="text-xl font-bold">Buscar en YouTube</h3>
                <p className="text-sm text-neutral-400">Encuentra un video y cargalo en el deck 1 o 2.</p>
            </div>
            <form className="sticky top-0 z-10 bg-neutral-900" onSubmit={onSubmit}>
                <input
                    className="h-11 w-full !rounded-full border border-neutral-700 bg-neutral-900 px-4 text-sm text-neutral-200 outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 md:text-base"
                    type="search"
                    name="search"
                    autoComplete
                    placeholder="Buscar en YouTube..."
                />
            </form>
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
    const { videos, toFirstPlayer, toSecondPlayer, searchVideos } = useVideos()
    const { toFavorites } = useFavorites()
    const didInitSearchRef = useRef(false)
    const toastTimeoutRef = useRef(null)
    const [toastMessage, setToastMessage] = useState("")
    const [toastDeck, setToastDeck] = useState(null)

    const { data } = useQuery({
        queryKey: ["listvideos"],
        queryFn: async () => await fetchVideos(),
        initialData: [],
        refetchOnWindowFocus: false
    })

    useEffect(() => {
        useStoreVideos.setState({ videos: data || [] })
    }, [data])

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current)
            }
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { search } = Object.fromEntries(new FormData(e.target))
        searchVideos(search)
    }

    const showAddedToast = (video, deck) => {
        const title = video?.snippet?.title || "La cancion"
        setToastMessage(`"${title}" se anadio al deck ${deck}`)
        setToastDeck(deck)

        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current)
        }

        toastTimeoutRef.current = setTimeout(() => {
            setToastMessage("")
            setToastDeck(null)
        }, 3000)
    }

    const handleAddToFirstPlayer = (video) => {
        toFirstPlayer(video)
        showAddedToast(video, 1)
    }

    const handleAddToSecondPlayer = (video) => {
        toSecondPlayer(video)
        showAddedToast(video, 2)
    }

    const actions = (
        <>
            <ModalButton
                wrapperClassName="min-w-0 flex-1"
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
                        <span className="hidden rounded-full border border-neutral-700 px-2 py-1 text-xs text-neutral-500 sm:inline-flex">
                            Enter
                        </span>
                    </div>
                }
            >
                <SearchModal
                    videos={videos}
                    onSubmit={handleSubmit}
                    onFavorite={toFavorites}
                    onAddToFirstPlayer={handleAddToFirstPlayer}
                    onAddToSecondPlayer={handleAddToSecondPlayer}
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

    return (
        <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-neutral-950">
            <Header actions={actions} />
            <main className="overflow-x-hidden">
                <Controls />
            </main>
            {
                toastMessage && (
                    <div className={`pointer-events-none fixed left-1/2 top-20 z-50 w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-md border bg-neutral-900/95 px-4 py-3 text-sm font-semibold text-white shadow-2xl ${toastDeck === 1 ? "border-red-500" : "border-blue-500"}`}>
                        {toastMessage}
                    </div>
                )
            }
        </div>
    )
}
