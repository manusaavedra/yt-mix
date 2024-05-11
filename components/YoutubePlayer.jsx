import "@justinribeiro/lite-youtube"
import { useEffect } from "react"

export default function YoutubePlayer({
    id,
    className,
    videoId,
    title,
    onPlayerReady,
}) {

    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag)

        const $player = document.querySelector(`#${id}`)

        const setup = () => {
            new YT.Player($player.shadowRoot.querySelector('iframe'), {
                events: {
                    'onReady': onPlayerReady,
                }
            })
        }

        $player.addEventListener('liteYoutubeIframeLoaded', setup, false)

        return () => {
            document.body.removeChild(tag)
            $player.removeEventListener('liteYoutubeIframeLoaded', setup, false)
        }

    }, [id, onPlayerReady])

    return (
        <lite-youtube
            id={id}
            videoid={videoId}
            videotitle={title}
            params="controls=1&enablejsapi=1"
            className={className}
        />
    )
}