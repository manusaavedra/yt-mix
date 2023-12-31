import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { create } from "zustand";

async function fetchVideos(searchText = "") {
    const url = 'https://www.googleapis.com/youtube/v3/search'

    const params = new URLSearchParams()
    params.append('key', 'AIzaSyCCP5lU5NjOz3JISOMxRsG_1WtV9h6nDhw')
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

    const { data } = useQuery({
        queryKey: ['videos'],
        queryFn: async () => await fetchVideos(),
        initialData: [],
        refetchOnWindowFocus: false
    })

    useEffect(() => {
        useStoreVideos.setState({ videos: data || [] })
    }, [data])

    const toFirstPlayer = (video) => {
        useStoreVideos.setState({ firstPlayer: video })
    }

    const toSecondPlayer = (video) => {
        useStoreVideos.setState({ secondPlayer: video })
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
        const history = history.filter((history) => history.id.videoId !== video.id.videoId)
        const newHistory = [
            ...history,
            video
        ]

        localStorage.setItem('history_songs', JSON.stringify(newHistory))
        useStoreVideos.setState({ history: newHistory })
    }

    const removeItemHistory = (video) => {
        const history = history.filter((history) => history.id.videoId !== video.id.videoId)
        localStorage.setItem('history_songs', JSON.stringify(history))
        useStoreVideos.setState({ favorites: history })
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

export const useStoreVideos = create((set, get) => ({
    videos: [],
    favorites: [],
    history: [],
    firstPlayer: null,
    secondPlayer: null
}))