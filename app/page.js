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
            <form className="sticky top-0 z-10 rounded-md bg-neutral-800" onSubmit={onSubmit}>
                <input className="w-full" type="text" name="search" placeholder="Buscar en youtube..." />
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
            <ModalButton
                className="grid h-10 w-10 place-items-center rounded-full border border-neutral-700 bg-white text-black"
                contentClassName="max-w-5xl bg-neutral-900"
                position="top"
                buttonContent={<BsSearch size={18} />}
            >
                <SearchModal
                    videos={videos}
                    onSubmit={handleSubmit}
                    onFavorite={toFavorites}
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
