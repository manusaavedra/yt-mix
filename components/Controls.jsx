"use client"

import { useStoreVideos } from "../app/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { crossfader } from "@/helpers";
import YoutubePlayer from "./YoutubePlayer";

const formatTime = (value) => {
    const totalSeconds = Math.max(0, Math.floor(value || 0))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = String(totalSeconds % 60).padStart(2, "0")

    return `${minutes}:${seconds}`
}

const getPlayerStateValue = (player) => {
    try {
        return player?.getPlayerState?.()
    } catch (error) {
        return null
    }
}

export default function Controls() {
    const { firstPlayer, secondPlayer } = useStoreVideos()
    const inputVolFirstPlayerRef = useRef()
    const inputVolSecondPlayerRef = useRef()
    const inputTransitionRef = useRef()

    const firstPlayerRef = useRef(null)
    const secondPlayerRef = useRef(null)

    const [firstSeek, setFirstSeek] = useState({ current: 0, duration: 0, seeking: false })
    const [secondSeek, setSecondSeek] = useState({ current: 0, duration: 0, seeking: false })
    const [firstIsPlaying, setFirstIsPlaying] = useState(false)
    const [secondIsPlaying, setSecondIsPlaying] = useState(false)

    const runPlayerCommand = useCallback((playerRef, command) => {
        const player = playerRef.current

        if (!player) {
            return
        }

        try {
            command(player)
        } catch (error) {
            console.warn("Player command skipped", error)
        }
    }, [])

    const syncSeekState = useCallback((playerRef, setSeekState) => {
        const player = playerRef.current

        if (!player) {
            return
        }

        try {
            setSeekState((prev) => {
                if (prev.seeking) {
                    return prev
                }

                return {
                    ...prev,
                    current: player.getCurrentTime?.() || 0,
                    duration: player.getDuration?.() || 0
                }
            })
        } catch (error) {
            console.warn("Seek sync skipped", error)
        }
    }, [])

    const syncPlaybackState = useCallback((playerRef, setIsPlaying) => {
        const player = playerRef.current

        if (!player) {
            return
        }

        const state = getPlayerStateValue(player)
        setIsPlaying(state === window.YT?.PlayerState?.PLAYING)
    }, [])

    const setSeeking = useCallback((setSeekState, seeking) => {
        setSeekState((prev) => ({ ...prev, seeking }))
    }, [])

    const handleSeek = useCallback((playerRef, setSeekState, value) => {
        const nextValue = parseFloat(value)

        setSeekState((prev) => ({
            ...prev,
            current: nextValue
        }))

        runPlayerCommand(playerRef, (player) => player.seekTo(nextValue, true))
    }, [runPlayerCommand])

    const togglePlayback = useCallback((playerRef, isPlaying, setIsPlaying) => {
        runPlayerCommand(playerRef, (player) => {
            if (isPlaying) {
                player.pauseVideo()
                setIsPlaying(false)
                return
            }

            player.playVideo()
            setIsPlaying(true)
        })
    }, [runPlayerCommand])

    useEffect(() => {
        const handleKeyboard = (event) => {
            const keypress = event.code

            if (event.shiftKey && keypress === "KeyW") {
                inputVolSecondPlayerRef.current.value = parseInt(inputVolSecondPlayerRef.current.value) + 1
                runPlayerCommand(secondPlayerRef, (player) => player.setVolume(inputVolSecondPlayerRef.current.value))
            }

            if (event.shiftKey && keypress === "KeyS") {
                inputVolSecondPlayerRef.current.value = parseInt(inputVolSecondPlayerRef.current.value) - 1
                runPlayerCommand(secondPlayerRef, (player) => player.setVolume(inputVolSecondPlayerRef.current.value))
            }

            if (event.shiftKey && keypress === "KeyQ") {
                inputVolFirstPlayerRef.current.value = parseInt(inputVolFirstPlayerRef.current.value) + 1
                runPlayerCommand(firstPlayerRef, (player) => player.setVolume(inputVolFirstPlayerRef.current.value))
            }

            if (event.shiftKey && keypress === "KeyA") {
                inputVolFirstPlayerRef.current.value = parseInt(inputVolFirstPlayerRef.current.value) - 1
                runPlayerCommand(firstPlayerRef, (player) => player.setVolume(inputVolFirstPlayerRef.current.value))
            }
        }

        window.addEventListener("keydown", handleKeyboard)

        return () => {
            firstPlayerRef.current = null
            secondPlayerRef.current = null
            window.removeEventListener("keydown", handleKeyboard)
        }
    }, [runPlayerCommand])

    useEffect(() => {
        const interval = window.setInterval(() => {
            syncSeekState(firstPlayerRef, setFirstSeek)
            syncSeekState(secondPlayerRef, setSecondSeek)
            syncPlaybackState(firstPlayerRef, setFirstIsPlaying)
            syncPlaybackState(secondPlayerRef, setSecondIsPlaying)
        }, 500)

        return () => {
            window.clearInterval(interval)
        }
    }, [syncPlaybackState, syncSeekState])

    const onReadyFirstPlayer = useCallback((eventPlayer) => {
        firstPlayerRef.current = eventPlayer.target
        setFirstSeek({
            current: eventPlayer.target?.getCurrentTime?.() || 0,
            duration: eventPlayer.target?.getDuration?.() || 0,
            seeking: false
        })
        setFirstIsPlaying(false)

        if (inputTransitionRef.current?.value >= 0.85) {
            runPlayerCommand(firstPlayerRef, (player) => {
                player.mute()
                player.pauseVideo()
            })
        } else {
            runPlayerCommand(firstPlayerRef, (player) => {
                player.unMute()
                player.playVideo()
            })
            setFirstIsPlaying(true)
        }

        runPlayerCommand(firstPlayerRef, (player) => player.setVolume(inputVolFirstPlayerRef.current?.value))
    }, [runPlayerCommand])

    const onReadySecondPlayer = useCallback((eventPlayer) => {
        secondPlayerRef.current = eventPlayer.target
        setSecondSeek({
            current: eventPlayer.target?.getCurrentTime?.() || 0,
            duration: eventPlayer.target?.getDuration?.() || 0,
            seeking: false
        })
        setSecondIsPlaying(false)

        if (inputTransitionRef.current?.value <= -0.85) {
            runPlayerCommand(secondPlayerRef, (player) => {
                player.mute()
                player.pauseVideo()
            })
        } else {
            runPlayerCommand(secondPlayerRef, (player) => {
                player.unMute()
                player.playVideo()
            })
            setSecondIsPlaying(true)
        }

        runPlayerCommand(secondPlayerRef, (player) => player.setVolume(inputVolSecondPlayerRef.current?.value))
    }, [runPlayerCommand])

    const handleChangeVolumeFirstPlayer = (e) => {
        runPlayerCommand(firstPlayerRef, (player) => player.setVolume(e.target.value))
    }

    const handleChangeVolumeSecondPlayer = (e) => {
        runPlayerCommand(secondPlayerRef, (player) => player.setVolume(e.target.value))
    }

    const handleCrossFade = (e) => {
        const threshold = parseFloat(e.target.value)
        const firstPlayerVolume = parseFloat(inputVolFirstPlayerRef.current.value)
        const secondPlayerVolume = parseFloat(inputVolSecondPlayerRef.current.value)
        const [volume1, volume2] = crossfader(threshold, firstPlayerVolume, secondPlayerVolume)

        if (threshold < 0.9) {
            runPlayerCommand(firstPlayerRef, (player) => {
                player.playVideo()
                player.unMute()
            })
            setFirstIsPlaying(true)
        } else {
            runPlayerCommand(firstPlayerRef, (player) => {
                player.pauseVideo()
                player.mute()
            })
            setFirstIsPlaying(false)
        }

        if (threshold > -0.9) {
            runPlayerCommand(secondPlayerRef, (player) => {
                player.playVideo()
                player.unMute()
            })
            setSecondIsPlaying(true)
        } else {
            runPlayerCommand(secondPlayerRef, (player) => {
                player.pauseVideo()
                player.mute()
            })
            setSecondIsPlaying(false)
        }

        runPlayerCommand(firstPlayerRef, (player) => player.setVolume(volume1))
        runPlayerCommand(secondPlayerRef, (player) => player.setVolume(volume2))
    }

    const renderDeck = ({
        deckNumber,
        color,
        playerData,
        seekState,
        setSeekState,
        playerRef,
        isPlaying,
        setIsPlaying,
        onReady,
        volumeRef,
        onVolumeChange,
        playerId
    }) => (
        <div className="flex flex-col gap-3">
            <div className={`relative min-h-[180px] overflow-hidden rounded-2xl border bg-black/30 shadow-lg sm:min-h-[260px] ${color === "red" ? "border-red-500/60" : "border-blue-500/60"}`}>
                <div className={`absolute left-0 top-0 z-10 w-12 rounded-br-2xl py-1 text-center text-sm font-black text-white ${color === "red" ? "bg-red-500" : "bg-blue-500"}`}>
                    {deckNumber}
                </div>

                <div className="relative z-10 flex min-h-[180px] items-center justify-center p-5 text-center sm:hidden">
                    <div className="w-full">
                        <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.2em] ${color === "red" ? "text-red-300" : "text-blue-300"}`}>
                            Deck {deckNumber}
                        </p>
                        <h3 className="mb-4 text-base font-bold leading-5 text-white">
                            {playerData?.title || `Carga un video en el deck ${deckNumber}`}
                        </h3>
                        <button
                            className={`mb-4 w-full rounded-xl border px-3 py-2 text-sm font-semibold ${color === "red" ? "border-red-500 bg-red-500/15 text-red-200" : "border-blue-500 bg-blue-500/15 text-blue-200"} ${!playerData ? "opacity-50" : ""}`}
                            onClick={() => togglePlayback(playerRef, isPlaying, setIsPlaying)}
                            disabled={!playerData}
                        >
                            {isPlaying ? "Pausar" : "Reproducir"}
                        </button>
                        <input
                            type="range"
                            min={0}
                            max={seekState.duration || 0}
                            step={1}
                            value={Math.min(seekState.current, seekState.duration || 0)}
                            onChange={(e) => handleSeek(playerRef, setSeekState, e.target.value)}
                            onMouseDown={() => setSeeking(setSeekState, true)}
                            onMouseUp={() => setSeeking(setSeekState, false)}
                            onTouchStart={() => setSeeking(setSeekState, true)}
                            onTouchEnd={() => setSeeking(setSeekState, false)}
                            onKeyDown={() => setSeeking(setSeekState, true)}
                            onKeyUp={() => setSeeking(setSeekState, false)}
                            disabled={!playerData}
                        />
                        <div className="mt-2 flex justify-between text-xs text-neutral-400">
                            <span>{formatTime(seekState.current)}</span>
                            <span>{formatTime(seekState.duration)}</span>
                        </div>
                    </div>
                </div>

                {
                    playerData !== null && (
                        <YoutubePlayer
                            id={playerId}
                            videoId={playerData?.id || ""}
                            title={playerData?.title}
                            onPlayerReady={onReady}
                            className="absolute inset-0 h-full opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto"
                        />
                    )
                }
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-white/[0.04] p-3 shadow-lg">
                <label className={`mb-2 block text-sm font-semibold ${color === "red" ? "text-red-300" : "text-blue-300"}`}>
                    Volumen deck {deckNumber}
                </label>
                <input
                    ref={volumeRef}
                    title={deckNumber === 1 ? "(Shift+Q [>] Shift+A [<])" : "(Shift+W [>] Shift+S [<])"}
                    type="range"
                    className={color === "red" ? "red" : "blue"}
                    onInput={onVolumeChange}
                    defaultValue={75}
                    min={0}
                    max={100}
                />
            </div>
        </div>
    )

    return (
        <section className="mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-5xl flex-col px-3 pb-28 pt-4 sm:px-4 sm:pb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {renderDeck({
                    deckNumber: 1,
                    color: "red",
                    playerData: firstPlayer,
                    seekState: firstSeek,
                    setSeekState: setFirstSeek,
                    playerRef: firstPlayerRef,
                    isPlaying: firstIsPlaying,
                    setIsPlaying: setFirstIsPlaying,
                    onReady: onReadyFirstPlayer,
                    volumeRef: inputVolFirstPlayerRef,
                    onVolumeChange: handleChangeVolumeFirstPlayer,
                    playerId: "firstPlayer"
                })}

                {renderDeck({
                    deckNumber: 2,
                    color: "blue",
                    playerData: secondPlayer,
                    seekState: secondSeek,
                    setSeekState: setSecondSeek,
                    playerRef: secondPlayerRef,
                    isPlaying: secondIsPlaying,
                    setIsPlaying: setSecondIsPlaying,
                    onReady: onReadySecondPlayer,
                    volumeRef: inputVolSecondPlayerRef,
                    onVolumeChange: handleChangeVolumeSecondPlayer,
                    playerId: "secondPlayer"
                })}
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-800 bg-neutral-950/95 p-3 py-4 backdrop-blur sm:sticky sm:bottom-0 sm:mt-4 sm:border sm:border-neutral-800 sm:bg-black/40 sm:p-4">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                        <span className="text-red-300">Deck 1</span>
                        <span>Crossfader</span>
                        <span className="text-blue-300">Deck 2</span>
                    </div>
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
        </section>
    )
}
