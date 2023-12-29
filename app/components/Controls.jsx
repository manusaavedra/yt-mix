import YouTube from "react-youtube";
import { useStoreVideos } from "../store";
import { useEffect, useRef } from "react";

export default function Controls() {
    const { firstPlayer, secondPlayer } = useStoreVideos()

    const inputVolFirstPlayerRef = useRef()
    const inputVolSecondPlayerRef = useRef()
    const inputTransitionRef = useRef()

    const firstPlayerRef = useRef(null)
    const secondPlayerRef = useRef(null)

    useEffect(() => {
        const handleKeyboard = (event) => {
            const keypress = event.code

            if (event.shiftKey && keypress === "KeyW") {
                inputVolSecondPlayerRef.current.value = parseInt(inputVolSecondPlayerRef.current.value) + 1
                secondPlayerRef.current.setVolume(inputVolSecondPlayerRef.current.value)
            }

            if (event.shiftKey && keypress === "KeyS") {
                inputVolSecondPlayerRef.current.value = parseInt(inputVolSecondPlayerRef.current.value) - 1
                secondPlayerRef.current.setVolume(inputVolSecondPlayerRef.current.value)
            }

            if (event.shiftKey && keypress === "KeyQ") {
                inputVolFirstPlayerRef.current.value = parseInt(inputVolFirstPlayerRef.current.value) + 1
                firstPlayerRef.current.setVolume(inputVolFirstPlayerRef.current.value)
            }

            if (event.shiftKey && keypress === "KeyA") {
                inputVolFirstPlayerRef.current.value = parseInt(inputVolFirstPlayerRef.current.value) - 1
                firstPlayerRef.current.setVolume(inputVolFirstPlayerRef.current.value)
            }
        }

        window.addEventListener('keydown', handleKeyboard)

        return () => {
            window.removeEventListener('keydown', handleKeyboard)
        }
    }, [])

    const onReadyFirstPlayer = (eventPlayer) => {

        firstPlayerRef.current = eventPlayer.target

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
        secondPlayerRef.current = eventPlayer.target

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
        <div className="sticky top-[50px] left-0 border-b border-black w-full bg-gray-900 bg-opacity-40 z-30">
            <div className="py-4 grid grid-cols-[minmax(280px,380px)_200px_minmax(280px,360px)] justify-center max-h-[400px] p-4">
                <div className="w-full aspect-video border-2 border-red-500 overflow-hidden">
                    {
                        firstPlayer !== null && (
                            <YouTube
                                videoId={firstPlayer?.id || ''}
                                title={firstPlayer?.title}
                                onReady={onReadyFirstPlayer}
                                className="h-full aspect-video"
                                opts={{
                                    width: 380,
                                    height: 213
                                }}
                            />
                        )
                    }

                </div>
                <div className="pt-4">
                    <div className="relative flex mt-8 h-[25%]">
                        <input className="vertical red" title="(Shift+Q [>] Shift+A [<] )" ref={inputVolFirstPlayerRef} type="range" defaultValue={75} min={0} max={100} />
                        <input className="vertical blue" title="(Shift+W [>] Shift+S [<] )" ref={inputVolSecondPlayerRef} type="range" defaultValue={75} min={0} max={100} />
                    </div>
                    <div className="w-[90%] mx-auto mt-10 p-2">
                        <input ref={inputTransitionRef} type="range" step={0.01} defaultValue={0} min={0} max={1} />
                        <div className="grid grid-cols-2 text-center">
                            <div className="bg-red-500 bg-opacity-50">1</div>
                            <div className="bg-blue-500 bg-opacity-50">2</div>
                        </div>
                    </div>
                </div>
                <div className="w-full aspect-video border-2 border-blue-500 overflow-hidden">
                    {
                        secondPlayer !== null && (
                            <YouTube
                                videoId={secondPlayer?.id || ''}
                                title={secondPlayer?.title}
                                onReady={onReadySecondPlayer}
                                className="h-full aspect-video"
                                opts={{
                                    width: 380,
                                    height: 213
                                }}
                            />
                        )
                    }
                </div>
            </div>
        </div>
    )
}