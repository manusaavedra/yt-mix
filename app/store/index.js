import { useEffect } from "react";
import { create } from "zustand";

export async function fetchVideos(searchText = "") {
    const url = 'https://www.googleapis.com/youtube/v3/search'

    const params = new URLSearchParams()
    params.append('key', process.env.NEXT_PUBLIC_YOUTUBE_API_KEY)
    params.append('type', 'video')
    params.append('part', 'snippet')
    params.append('maxResults', 12)
    params.append('q', searchText)

    const request = await fetch(`${url}?${params.toString()}`)
    const data = await request.json()

    if (request.ok) {
        return data.items
    }

    return []
}

export function useVideos() {
    const { videos } = useStoreVideos()
    const { toHistory } = useHistory()

    const toFirstPlayer = (video) => {
        const player = {
            id: video.id.videoId,
            title: video.snippet.title
        }
        useStoreVideos.setState({ firstPlayer: player })
        toHistory(video)
    }

    const toSecondPlayer = (video) => {
        const player = {
            id: video.id.videoId,
            title: video.snippet.title
        }
        useStoreVideos.setState({ secondPlayer: player })
        toHistory(video)
    }

    const searchVideos = async (value) => {
        const data = await fetchVideos(value)
        useStoreVideos.setState({ videos: data })
    }

    return {
        videos,
        fetchVideos,
        toFirstPlayer,
        toSecondPlayer,
        searchVideos
    }
}

export function useHistory() {
    const { history } = useStoreVideos()

    useEffect(() => {
        const localFavorites = localStorage.getItem('history_songs')
        if (localFavorites) {
            useStoreVideos.setState({ history: JSON.parse(localFavorites) })
        }
    }, [])

    const toHistory = (video) => {
        const newVideo = { ...video, date: new Date() }
        const AllHistory = history.filter((history) => history.id.videoId !== video.id.videoId)
        const newHistory = [
            ...AllHistory,
            newVideo
        ]

        localStorage.setItem('history_songs', JSON.stringify(newHistory))
        useStoreVideos.setState({ history: newHistory })
    }

    const removeItemHistory = (video) => {
        const AllHistory = history.filter((history) => history.id.videoId !== video.id.videoId)
        localStorage.setItem('history_songs', JSON.stringify(AllHistory))
        useStoreVideos.setState({ history: AllHistory })
    }

    const findByVideoTitle = (text) => {
        return history.filter((video) => {
            return String(video.snippet.title).toLowerCase().includes(String(text).toLowerCase())
        })
    }

    return { history, toHistory, removeItemHistory, findByVideoTitle }
}

export function useFavorites() {
    const { favorites } = useStoreVideos()

    useEffect(() => {
        const localFavorites = localStorage.getItem('favorites_songs')
        if (localFavorites) {
            useStoreVideos.setState({ favorites: JSON.parse(localFavorites) })
        }
    }, [])

    const toFavorites = (video) => {
        const Allfavorites = favorites.filter((favorite) => favorite.id.videoId !== video.id.videoId)
        const newFavorites = [
            ...Allfavorites,
            video
        ]

        localStorage.setItem('favorites_songs', JSON.stringify(newFavorites))
        useStoreVideos.setState({ favorites: newFavorites })
    }

    const removeFavorite = (video) => {
        const Allfavorites = favorites.filter((favorite) => favorite.id.videoId !== video.id.videoId)
        localStorage.setItem('favorites_songs', JSON.stringify(Allfavorites))
        useStoreVideos.setState({ favorites: Allfavorites })
    }

    const findByVideoTitle = (text) => {
        return favorites.filter((video) => {
            return String(video.snippet.title).toLowerCase().includes(String(text).toLowerCase())
        })
    }

    return { favorites, toFavorites, removeFavorite, findByVideoTitle }
}

export const useStoreVideos = create(() => ({
    videos: [],
    favorites: [],
    history: [],
    firstPlayer: null,
    secondPlayer: null
}))