"use client"

import { useStoreVideos } from "../app/store";
import { useEffect, useRef } from "react";
import { crossfader } from "@/helpers";
import YoutubePlayer from "./YoutubePlayer";

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
            firstPlayerRef.current = null
            secondPlayerRef.current = null
            window.removeEventListener('keydown', handleKeyboard)
        }
    }, [])

    const onReadyFirstPlayer = (eventPlayer) => {
        firstPlayerRef.current = eventPlayer.target

        if (inputTransitionRef.current?.value >= 0.85) {
            firstPlayerRef.current.mute()
            firstPlayerRef.current.pauseVideo()
        } else {
            firstPlayerRef.current.unMute()
            firstPlayerRef.current.playVideo()
        }

        console.log(inputVolFirstPlayerRef.current?.value)

        firstPlayerRef.current.setVolume(inputVolFirstPlayerRef.current?.value)
    }

    const onReadySecondPlayer = (eventPlayer) => {
        secondPlayerRef.current = eventPlayer.target

        if (inputTransitionRef.current?.value <= -0.85) {
            secondPlayerRef.current.mute()
            secondPlayerRef.current.pauseVideo()
        } else {
            secondPlayerRef.current.unMute()
            secondPlayerRef.current.playVideo()
        }

        secondPlayerRef.current.setVolume(inputVolSecondPlayerRef.current?.value)
    }

    const handleChangeVolumeFirstPlayer = (e) => {
        firstPlayerRef.current?.setVolume(e.target.value)
        console.log(inputVolFirstPlayerRef.current?.value)
    }

    const handleChangeVolumeSecondPlayer = (e) => {
        secondPlayerRef.current?.setVolume(e.target.value)
    }

    const handleCrossFade = (e) => {
        const { value } = e.target
        const threshold = parseFloat(value)

        const firstPlayerVolume = parseFloat(inputVolFirstPlayerRef.current.value)
        const secondPlayerVolume = parseFloat(inputVolSecondPlayerRef.current.value)

        const [volume1, volume2] = crossfader(threshold, firstPlayerVolume, secondPlayerVolume)

        if (threshold < 0.9) {
            firstPlayerRef.current?.playVideo()
            firstPlayerRef.current?.unMute()
        } else {
            firstPlayerRef.current?.pauseVideo()
            firstPlayerRef.current?.mute()
        }

        if (threshold > -0.9) {
            secondPlayerRef.current?.playVideo()
            secondPlayerRef.current?.unMute()
        } else {
            secondPlayerRef.current?.pauseVideo()
            secondPlayerRef.current?.mute()
        }

        firstPlayerRef.current?.setVolume(volume1)
        secondPlayerRef.current?.setVolume(volume2)
    }

    return (
        <div className="sticky top-[50px] left-0 border-b border-black w-full controls z-30">
            <div className="py-4 grid grid-cols-[minmax(280px,380px)_200px_minmax(280px,360px)] items-stretch justify-center max-h-[400px] p-4">
                <div className="relative w-full aspect-video rounded-sm border-2 border-red-500 bg-black bg-opacity-40 overflow-hidden">
                    <div className="w-10 bg-red-500 text-white font-bold rounded-br-xl text-center absolute top-0 left-0">1</div>
                    {
                        firstPlayer !== null && (
                            <YoutubePlayer
                                id="firstPlayer"
                                videoId={firstPlayer?.id || ''}
                                title={firstPlayer?.title}
                                onPlayerReady={onReadyFirstPlayer}
                                className="h-full aspect-video"
                            />
                        )
                    }
                </div>
                <div className="pt-4">
                    <div className="relative flex mt-8 h-[25%]">
                        <input
                            ref={inputVolFirstPlayerRef}
                            title="(Shift+Q [>] Shift+A [<] )"
                            type="range"
                            className="vertical red"
                            onInput={handleChangeVolumeFirstPlayer}
                            defaultValue={75}
                            min={0}
                            max={100}
                        />
                        <input
                            ref={inputVolSecondPlayerRef}
                            title="(Shift+W [>] Shift+S [<] )"
                            type="range"
                            className="vertical blue"
                            onInput={handleChangeVolumeSecondPlayer}
                            defaultValue={75}
                            min={0}
                            max={100}
                        />
                    </div>
                    <div className="w-[90%] mx-auto mt-14 p-2">
                        <input
                            ref={inputTransitionRef}
                            onInput={handleCrossFade}
                            type="range"
                            step={0.01}
                            defaultValue={-1}
                            min={-1}
                            max={1}
                        />
                    </div>
                </div>
                <div className="relative w-full aspect-video rounded-sm border-2 border-blue-500 bg-black bg-opacity-40 overflow-hidden">
                    <div className="w-10 bg-blue-500 text-white font-bold rounded-br-xl text-center absolute top-0 left-0">2</div>
                    {
                        secondPlayer !== null && (
                            <YoutubePlayer
                                id="secondPlayer"
                                videoId={secondPlayer?.id || ''}
                                title={secondPlayer?.title}
                                onPlayerReady={onReadySecondPlayer}
                                className="h-full aspect-video"
                            />
                        )
                    }
                </div>
            </div>
        </div>
    )
}