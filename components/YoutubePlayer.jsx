"use client"

import { useEffect } from "react"

export default function YoutubePlayer({
    id,
    className,
    videoId,
    title,
    onPlayerReady,
}) {

    useEffect(() => {
        const mountedYTPlayer = async () => await import("@justinribeiro/lite-youtube")

        mountedYTPlayer()

        const loadedYTScripts = document.querySelector("script[src='https://www.youtube.com/iframe_api']")

        if (loadedYTScripts === null) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.body.appendChild(tag)
        }

        const $player = document.querySelector(`#${id}`)

        const setupYT = () => {
            try {
                new YT.Player($player.shadowRoot.querySelector('iframe'), {
                    events: {
                        'onReady': onPlayerReady,
                    }
                })
            } catch (error) {
                setTimeout(setupYT, 100)
            }
        }

        $player.addEventListener('liteYoutubeIframeLoaded', setupYT, false)

        return () => {
            $player.removeEventListener('liteYoutubeIframeLoaded', setupYT, false)
        }

    }, [id, onPlayerReady, videoId])

    return (
        <lite-youtube
            id={id}
            videoid={videoId}
            videotitle={title}
            autoload
            params="autoplay=1&mute=1&loop=1&controls=1&modestbranding=1&playsinline=1&rel=0&enablejsapi=1"
            className={className}
        />
    )
}