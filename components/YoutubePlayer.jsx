"use client"

import { useEffect, useRef } from "react"

let youtubeApiPromise = null

const loadYoutubeApi = () => {
    if (typeof window === "undefined") {
        return Promise.resolve(null)
    }

    if (window.YT?.Player) {
        return Promise.resolve(window.YT)
    }

    if (youtubeApiPromise) {
        return youtubeApiPromise
    }

    youtubeApiPromise = new Promise((resolve) => {
        const previousCallback = window.onYouTubeIframeAPIReady

        window.onYouTubeIframeAPIReady = () => {
            previousCallback?.()
            resolve(window.YT)
        }

        const loadedYTScripts = document.querySelector("script[src='https://www.youtube.com/iframe_api']")

        if (loadedYTScripts === null) {
            const tag = document.createElement("script")
            tag.src = "https://www.youtube.com/iframe_api"
            document.body.appendChild(tag)
        }
    })

    return youtubeApiPromise
}

export default function YoutubePlayer({
    id,
    className,
    videoId,
    title,
    onPlayerReady,
    playerVars,
}) {
    const containerRef = useRef(null)
    const playerRef = useRef(null)
    const onPlayerReadyRef = useRef(onPlayerReady)
    const initialVideoIdRef = useRef(videoId)
    const playerVarsRef = useRef(playerVars)

    useEffect(() => {
        onPlayerReadyRef.current = onPlayerReady
    }, [onPlayerReady])

    useEffect(() => {
        playerVarsRef.current = playerVars
    }, [playerVars])

    useEffect(() => {
        let isMounted = true

        const setupPlayer = async () => {
            const YT = await loadYoutubeApi()

            if (!isMounted || !YT?.Player || !containerRef.current || playerRef.current) {
                return
            }

            playerRef.current = new YT.Player(containerRef.current, {
                width: "100%",
                height: "100%",
                videoId: initialVideoIdRef.current,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    enablejsapi: 1,
                    ...playerVarsRef.current,
                },
                events: {
                    onReady: (event) => {
                        onPlayerReadyRef.current?.(event)
                    },
                },
            })
        }

        setupPlayer()

        return () => {
            isMounted = false

            try {
                playerRef.current?.destroy?.()
            } catch (error) {
                console.warn("Player cleanup skipped", error)
            }

            playerRef.current = null
        }
    }, [])

    useEffect(() => {
        const player = playerRef.current

        if (!player || !videoId) {
            return
        }

        try {
            const currentData = player.getVideoData?.()

            if (currentData?.video_id === videoId) {
                return
            }

            player.cueVideoById(videoId)
            onPlayerReadyRef.current?.({ target: player })
        } catch (error) {
            console.warn("Video update skipped", error)
        }
    }, [videoId])

    return (
        <div className={`relative w-full aspect-video ${className || ""}`}>
            <div id={id} ref={containerRef} className="absolute inset-0 h-full w-full" aria-label={title} />
        </div>
    )
}
