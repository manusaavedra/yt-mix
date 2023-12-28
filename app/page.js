"use client"

import { useEffect, useRef, useState } from "react"
import YouTube from 'react-youtube';

export default function Home() {
    const [videos, setVideos] = useState([])
    const [favorites, setFavorites] = useState([])
    const [playlist, setPlaylist] = useState({
        firstPlayer: {},
        secondPlayer: {}
    })

    const inputVolFirstPlayerRef = useRef()
    const inputVolSecondPlayerRef = useRef()
    const inputTransitionRef = useRef()


    useEffect(() => {
        const localFavorites = localStorage.getItem('favorites_songs')
        if (localFavorites) {
            setFavorites(JSON.parse(localFavorites))
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const { search } = Object.fromEntries(new FormData(e.target))
        const url = 'https://www.googleapis.com/youtube/v3/search'

        const params = new URLSearchParams()
        params.append('key', 'AIzaSyBY_wlzNvv-tzjiJ4GawGMHo2Ei6hC4DY0')
        params.append('type', 'video')
        params.append('part', 'snippet')
        params.append('maxResults', 20)
        params.append('q', search)

        const request = await fetch(`${url}?${params.toString()}`)
        const data = await request.json()

        setVideos(data.items)
    }

    const handleSelectedItem = (video, where) => {
        setPlaylist({
            ...playlist,
            [where]: video
        })
    }

    const handleAddFavorite = (video) => {
        const Allfavorites = favorites.filter((favorite) => favorite.id.videoId !== video.id.videoId)
        const newFavorites = [
            ...Allfavorites,
            video
        ]

        localStorage.setItem('favorites_songs', JSON.stringify(newFavorites))
        setFavorites(newFavorites)
    }

    const onReadyFirstPlayer = (eventPlayer) => {

        if (inputTransitionRef.current.value >= 0.85) {
            eventPlayer.target.pauseVideo()
        } else {
            eventPlayer.target.playVideo()
        }

        eventPlayer.target.setVolume(inputVolFirstPlayerRef.current.value)

        inputVolFirstPlayerRef.current.addEventListener('input', (e) => {
            eventPlayer.target.setVolume(e.target.value)
        })

        inputTransitionRef.current.addEventListener('input', (e) => {
            const firstPlayerVolume = inputVolFirstPlayerRef.current.value
            const volume = (firstPlayerVolume / 100) * Math.cos((e.target.value) * 0.5 * Math.PI)
            eventPlayer.target.setVolume(volume * 100)

            if (e.target.value >= 0.85) {
                eventPlayer.target.pauseVideo()
            } else {
                eventPlayer.target.playVideo()
            }
        })
    }



    const onReadySecondPlayer = (eventPlayer) => {

        if (inputTransitionRef.current.value <= 0.15) {
            eventPlayer.target.pauseVideo()
        } else {
            eventPlayer.target.playVideo()
        }

        eventPlayer.target.setVolume(inputVolSecondPlayerRef.current.value)

        inputVolSecondPlayerRef.current.addEventListener('input', (e) => {
            eventPlayer.target.setVolume(e.target.value)
        })

        inputTransitionRef.current.addEventListener('input', (e) => {
            const secondPlayerVolume = inputVolSecondPlayerRef.current.value
            const volume = (secondPlayerVolume / 100) * Math.cos((1.0 - (e.target.value)) * 0.5 * Math.PI)
            eventPlayer.target.setVolume(volume * 100)

            if (e.target.value <= 0.15) {
                eventPlayer.target.pauseVideo()
            } else {
                eventPlayer.target.playVideo()
            }
        })
    }


    return (
        <div className="h-screen overflow-hidden">
            <header className="bg-black p-4 sticky top-0 left-0 z-40">
                <h4 className="font-bold">YT Mixer</h4>
                <span className="text-xs">Creado por <a href="https://github.com/manusaavedra">Manuel Saavedra</a></span>
            </header>
            <main className="flex justify-between gap-2">
                <aside className="bg-black h-[calc(100vh-60px)] overflow-auto min-w-[320px] max-w-[320px] py-6 px-2">
                    <h4 className="font-semibold mb-6">Favoritos</h4>
                    <ul>
                        {
                            favorites.length === 0 && (
                                <li>No hay favoritos aún</li>
                            )
                        }
                        {
                            favorites.map((fav) => (
                                <li className="border-b" key={fav.id.videoId}>
                                    <picture>
                                        <img src={fav.snippet.thumbnails.medium.url} alt={fav.snippet.title} />
                                    </picture>
                                    <div className="flex items-center justify-end">
                                        {fav.snippet.title}
                                        <div className="flex items-center gap-2">
                                            <button className="bg-red-500 font-bold text-white px-2" onClick={() => handleSelectedItem({
                                                id: fav.id.videoId,
                                                title: fav.snippet.title,
                                            }, 'firstPlayer')}>
                                                1
                                            </button>
                                            <button className="bg-blue-500 font-bold text-white px-2" onClick={() => handleSelectedItem({
                                                id: fav.id.videoId,
                                                title: fav.snippet.title,
                                            }, 'secondPlayer')}>
                                                2
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            )).reverse()
                        }
                    </ul>
                </aside>
                <div className="max-w-4xl mx-auto">
                    <div className="sticky top-[50px] left-0 border-b border-black w-full bg-gray-900 z-30">
                        <div className="py-4 flex max-h-[400px] p-4 justify-between">
                            <div className="w-full max-w-[320px] h-[180px] border-2 border-red-500 overflow-hidden">
                                <YouTube
                                    videoId={playlist.firstPlayer?.id || ''}
                                    onReady={onReadyFirstPlayer}
                                    className="w-full"
                                    opts={
                                        { width: 320, height: 180 }
                                    } />
                            </div>
                            <div>
                                <div className="flex h-[70%]">
                                    <input className="rotate-[-90deg] accent-red-500 origin-center" ref={inputVolFirstPlayerRef} type="range" defaultValue={75} min={0} max={100} />
                                    <input className="rotate-[-90deg] accent-blue-500 origin-center" ref={inputVolSecondPlayerRef} type="range" defaultValue={75} min={0} max={100} />
                                </div>
                                <div className="flex gap-2 pt-2 px-4 items-center h-[25%]">
                                    <input className="w-full" ref={inputTransitionRef} type="range" step={0.01} defaultValue={0} min={0} max={1} />
                                </div>
                            </div>
                            <div className="w-full max-w-[320px] h-[180px] border-2 border-blue-500 overflow-hidden">
                                <YouTube
                                    videoId={playlist.secondPlayer?.id || ''}
                                    onReady={onReadySecondPlayer}
                                    className="w-full"
                                    opts={
                                        { width: 320, height: 180 }
                                    } />
                            </div>
                        </div>
                        <form className="max-w-4xl mx-auto p-4" onSubmit={handleSubmit}>
                            <div>
                                <input className="w-full" type="text" name="search" placeholder="Buscar en youtube..." />
                            </div>
                        </form>
                    </div>
                    <div className="max-w-4xl mx-auto p-4 overflow-auto h-[calc(100vh-380px)]">
                        {videos.length !== 0 && <h4 className="font-bold text-base my-4">Resultados:</h4>}
                        <div className="flex flex-wrap gap-4">
                            {
                                videos.map((video) => (
                                    <div className="relative group overflow-hidden bg-black bg-opacity-30 border max-w-[200px] w-full rounded-md p-2" key={video.id.videoId}>
                                        <picture>
                                            <img className="w-full" src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} />
                                        </picture>
                                        <h4 className="font-bold">{video.snippet.title}</h4>
                                        <div className="group-hover:block hidden absolute top-2 right-2">
                                            <button className="bg-yellow-500 text-black px-1 font-semibold rounded-md" onClick={() => handleAddFavorite(video)}>Add Favorito</button>
                                        </div>
                                        <div className="group-hover:flex absolute bottom-0 left-0 w-full hidden items-center gap-2">
                                            <button className="w-1/2 bg-red-500 bg-opacity-60 text-4xl font-bold text-white" onClick={() => handleSelectedItem({
                                                id: video.id.videoId,
                                                title: video.snippet.title,
                                            }, 'firstPlayer')}>
                                                1
                                            </button>
                                            <button className="w-1/2 bg-blue-500 bg-opacity-60 text-4xl font-bold text-white" onClick={() => handleSelectedItem({
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
