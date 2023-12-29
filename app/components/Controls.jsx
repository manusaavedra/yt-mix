import YouTube from "react-youtube";
import { useStoreVideos } from "../store";
import { useRef } from "react";

export default function Controls() {
    const { playlist } = useStoreVideos()

    const inputVolFirstPlayerRef = useRef()
    const inputVolSecondPlayerRef = useRef()
    const inputTransitionRef = useRef()

    const onReadyFirstPlayer = (eventPlayer) => {

        if (inputTransitionRef.current.value >= 0.85) {
            eventPlayer.target.mute()
            eventPlayer.target.pauseVideo()
        } else {
            eventPlayer.target.unMute()
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
                eventPlayer.target.mute()
            } else {
                eventPlayer.target.playVideo()
                eventPlayer.target.unMute()
            }
        })
    }

    const onReadySecondPlayer = (eventPlayer) => {
        if (inputTransitionRef.current.value <= 0.15) {
            eventPlayer.target.mute()
            eventPlayer.target.pauseVideo()
        } else {
            eventPlayer.target.unMute()
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
                eventPlayer.target.mute()
            } else {
                eventPlayer.target.playVideo()
                eventPlayer.target.unMute()
            }
        })
    }

    return (
        <div className="max-w-7xl mx-auto sticky top-[50px] left-0 border-b border-black w-full bg-gray-900 bg-opacity-40 z-30">
            <div className="py-4 flex max-h-[400px] p-4 justify-between">
                <div className="w-full min-w-[400px] max-w-[400px] aspect-video border-2 border-red-500 overflow-hidden">
                    {
                        playlist.firstPlayer !== null && (
                            <YouTube
                                videoId={playlist.firstPlayer?.id || ''}
                                title={playlist.firstPlayer?.title}
                                onReady={onReadyFirstPlayer}
                                className="w-full aspect-video"
                                opts={{
                                    width: 400,
                                    height: 225
                                }}
                            />
                        )
                    }

                </div>
                <div className="pt-4">
                    <div className="relative flex mt-8 h-[50%]">
                        <input className="vertical red" ref={inputVolFirstPlayerRef} type="range" defaultValue={75} min={0} max={100} />
                        <input className="vertical blue" ref={inputVolSecondPlayerRef} type="range" defaultValue={75} min={0} max={100} />
                    </div>
                    <div className="flex gap-2 pt-12 px-4 items-center">
                        <input ref={inputTransitionRef} type="range" step={0.01} defaultValue={0} min={0} max={1} />
                    </div>
                </div>
                <div className="w-full min-w-[400px] max-w-[400px] aspect-video border-2 border-blue-500 overflow-hidden">
                    {
                        playlist.secondPlayer !== null && (
                            <YouTube
                                videoId={playlist.secondPlayer?.id || ''}
                                title={playlist.secondPlayer?.title}
                                onReady={onReadySecondPlayer}
                                className="w-full"
                                opts={{
                                    width: 400,
                                    height: 225
                                }}
                            />
                        )
                    }
                </div>
            </div>
        </div>
    )
}