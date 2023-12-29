import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { create } from "zustand";
import useInput from "../hooks/input";

async function fetchVideos(searchText = "") {
    const url = 'https://www.googleapis.com/youtube/v3/search'

    const params = new URLSearchParams()
    params.append('key', 'AIzaSyDyZySgu10trrXXLNNvuzCbFXJCo5a7qV4')
    params.append('type', 'video')
    params.append('part', 'snippet')
    params.append('maxResults', 20)
    params.append('q', searchText)

    const request = await fetch(`${url}?${params.toString()}`)
    const data = await request.json()

    return data.items
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

    const toPlaylist = (video, where) => {
        useStoreVideos.setState((state) => ({
            playlist: {
                ...state.playlist,
                [where]: video
            }
        }))
    }

    const searchVideos = async (value) => {
        const data = await fetchVideos(value)
        useStoreVideos.setState({ videos: data })
    }

    return { videos, fetchVideos, toPlaylist, searchVideos }
}

export function useFavorites() {
    const { favorites, fetchFavorites } = useStoreVideos()

    useEffect(() => {
        fetchFavorites()
    }, [fetchFavorites])

    const toFavorites = (video) => {
        const Allfavorites = favorites.filter((favorite) => favorite.id.videoId !== video.id.videoId)
        const newFavorites = [
            ...Allfavorites,
            video
        ]

        localStorage.setItem('favorites_songs', JSON.stringify(newFavorites))
        useStoreVideos.setState({ favorites: newFavorites })
    }

    const findByVideoTitle = (text) => {
        return favorites.filter((video) => {
            return String(video.snippet.title).toLowerCase().includes(String(text).toLowerCase())
        })
    }

    return { favorites, fetchFavorites, toFavorites, findByVideoTitle }
}

export const useStoreVideos = create((set, get) => ({
    videos: [],
    favorites: [],
    playlist: {
        firstPlayer: null,
        secondPlayer: null
    },
    fetchFavorites: () => {
        const localFavorites = localStorage.getItem('favorites_songs')
        if (localFavorites) {
            set({ favorites: JSON.parse(localFavorites) })
        }
    }
}))