"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { crossfader } from "@/helpers";
import { useStoreVideos } from "../app/store";
import DeckPanel from "./DeckPanel";

const createSeekState = (current = 0, duration = 0) => ({
    current,
    duration,
    seeking: false
});

const getPlayerStateValue = (player) => {
    return player?.getPlayerState?.();
};

export default function Controls() {
    const { firstPlayer, secondPlayer } = useStoreVideos();
    const inputVolFirstPlayerRef = useRef();
    const inputVolSecondPlayerRef = useRef();
    const inputTransitionRef = useRef();
    const firstPlayerRef = useRef(null);
    const secondPlayerRef = useRef(null);

    const [firstSeek, setFirstSeek] = useState(() => createSeekState());
    const [secondSeek, setSecondSeek] = useState(() => createSeekState());
    const [firstIsPlaying, setFirstIsPlaying] = useState(false);
    const [secondIsPlaying, setSecondIsPlaying] = useState(false);

    const runPlayerCommand = useCallback((playerRef, command) => {
        const player = playerRef.current;

        if (!player) return

        try {
            command(player);
        } catch (error) {
            console.warn("Player command skipped", error);
        }
    }, []);

    const getVolumeValue = useCallback((volumeRef) => {
        return parseFloat(volumeRef.current?.value || 75);
    }, []);

    const setPlayerVolume = useCallback((playerRef, value) => {
        runPlayerCommand(playerRef, (player) => player.setVolume(value));
    }, [runPlayerCommand]);

    const setPlayerSeeking = useCallback((setSeekState, seeking) => {
        setSeekState((previousState) => ({
            ...previousState,
            seeking
        }));
    }, []);

    const syncSeekState = useCallback((playerRef, setSeekState) => {
        const player = playerRef.current;

        if (!player) return

        try {
            setSeekState((previousState) => {
                if (previousState.seeking) previousState;

                return {
                    ...previousState,
                    current: player.getCurrentTime?.() || 0,
                    duration: player.getDuration?.() || 0
                };
            });
        } catch (error) {
            console.warn("Seek sync skipped", error);
        }
    }, []);

    const syncPlaybackState = useCallback((playerRef, setIsPlaying) => {
        const player = playerRef.current;

        if (!player) return

        const state = getPlayerStateValue(player);
        setIsPlaying(state === window.YT?.PlayerState?.PLAYING);
    }, []);

    const handleSeek = useCallback((playerRef, setSeekState, value) => {
        const nextValue = parseFloat(value);

        setSeekState((previousState) => ({
            ...previousState,
            current: nextValue
        }));

        runPlayerCommand(playerRef, (player) => player.seekTo(nextValue, true));
    }, [runPlayerCommand]);

    const setDeckPlaybackState = useCallback((playerRef, setIsPlaying, shouldPlay) => {
        runPlayerCommand(playerRef, (player) => {
            if (shouldPlay) {
                player.playVideo();
                player.unMute();
                return;
            }

            player.pauseVideo();
            player.mute();
        });

        setIsPlaying(shouldPlay);
    }, [runPlayerCommand]);

    const togglePlayback = useCallback((playerRef, isPlaying, setIsPlaying) => {
        runPlayerCommand(playerRef, (player) => {
            if (isPlaying) {
                player.pauseVideo();
                setIsPlaying(false);
                return;
            }

            player.playVideo();
            setIsPlaying(true);
        });
    }, [runPlayerCommand]);

    const adjustVolume = useCallback((volumeRef, playerRef, delta) => {
        if (!volumeRef.current) return

        const currentValue = parseInt(volumeRef.current.value || "0", 10);
        const nextValue = Math.max(0, Math.min(100, currentValue + delta));
        volumeRef.current.value = nextValue;
        setPlayerVolume(playerRef, nextValue);
    }, [setPlayerVolume]);

    const syncReadyState = useCallback((eventPlayer, options) => {
        const {
            playerRef,
            setSeekState,
            setIsPlaying,
            volumeRef,
            shouldPlay
        } = options;

        playerRef.current = eventPlayer.target;
        setSeekState(createSeekState(
            eventPlayer.target?.getCurrentTime?.() || 0,
            eventPlayer.target?.getDuration?.() || 0
        ));

        setDeckPlaybackState(playerRef, setIsPlaying, shouldPlay);
        setPlayerVolume(playerRef, getVolumeValue(volumeRef));
    }, [getVolumeValue, setDeckPlaybackState, setPlayerVolume]);

    useEffect(() => {
        const handleKeyboard = (event) => {
            if (!event.shiftKey) return

            if (event.code === "KeyW") {
                adjustVolume(inputVolSecondPlayerRef, secondPlayerRef, 1);
            }

            if (event.code === "KeyS") {
                adjustVolume(inputVolSecondPlayerRef, secondPlayerRef, -1);
            }

            if (event.code === "KeyQ") {
                adjustVolume(inputVolFirstPlayerRef, firstPlayerRef, 1);
            }

            if (event.code === "KeyA") {
                adjustVolume(inputVolFirstPlayerRef, firstPlayerRef, -1);
            }
        };

        window.addEventListener("keydown", handleKeyboard);

        return () => {
            firstPlayerRef.current = null;
            secondPlayerRef.current = null;
            window.removeEventListener("keydown", handleKeyboard);
        };
    }, [adjustVolume]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            syncSeekState(firstPlayerRef, setFirstSeek);
            syncSeekState(secondPlayerRef, setSecondSeek);
            syncPlaybackState(firstPlayerRef, setFirstIsPlaying);
            syncPlaybackState(secondPlayerRef, setSecondIsPlaying);
        }, 500);

        return () => {
            window.clearInterval(interval);
        };
    }, [syncPlaybackState, syncSeekState]);

    const onReadyFirstPlayer = useCallback((eventPlayer) => {
        const threshold = parseFloat(inputTransitionRef.current?.value || -1);

        syncReadyState(eventPlayer, {
            playerRef: firstPlayerRef,
            setSeekState: setFirstSeek,
            setIsPlaying: setFirstIsPlaying,
            volumeRef: inputVolFirstPlayerRef,
            shouldPlay: threshold < 0.85
        });
    }, [syncReadyState]);

    const onReadySecondPlayer = useCallback((eventPlayer) => {
        const threshold = parseFloat(inputTransitionRef.current?.value || -1);

        syncReadyState(eventPlayer, {
            playerRef: secondPlayerRef,
            setSeekState: setSecondSeek,
            setIsPlaying: setSecondIsPlaying,
            volumeRef: inputVolSecondPlayerRef,
            shouldPlay: threshold > -0.85
        });
    }, [syncReadyState]);

    const handleChangeVolumeFirstPlayer = useCallback((event) => {
        setPlayerVolume(firstPlayerRef, event.target.value);
    }, [setPlayerVolume]);

    const handleChangeVolumeSecondPlayer = useCallback((event) => {
        setPlayerVolume(secondPlayerRef, event.target.value);
    }, [setPlayerVolume]);

    const handleCrossFade = useCallback((event) => {
        const threshold = parseFloat(event.target.value);
        const firstPlayerVolume = getVolumeValue(inputVolFirstPlayerRef);
        const secondPlayerVolume = getVolumeValue(inputVolSecondPlayerRef);
        const [volume1, volume2] = crossfader(threshold, firstPlayerVolume, secondPlayerVolume);

        setDeckPlaybackState(firstPlayerRef, setFirstIsPlaying, threshold < 0.9);
        setDeckPlaybackState(secondPlayerRef, setSecondIsPlaying, threshold > -0.9);
        setPlayerVolume(firstPlayerRef, volume1);
        setPlayerVolume(secondPlayerRef, volume2);
    }, [getVolumeValue, setDeckPlaybackState, setPlayerVolume]);

    const deckPanels = [
        {
            deckNumber: 1,
            color: "red",
            playerData: firstPlayer,
            seekState: firstSeek,
            isPlaying: firstIsPlaying,
            onTogglePlayback: () => togglePlayback(firstPlayerRef, firstIsPlaying, setFirstIsPlaying),
            onSeek: (value) => handleSeek(firstPlayerRef, setFirstSeek, value),
            onSetSeeking: (seeking) => setPlayerSeeking(setFirstSeek, seeking),
            onPlayerReady: onReadyFirstPlayer,
            volumeRef: inputVolFirstPlayerRef,
            onVolumeChange: handleChangeVolumeFirstPlayer,
            playerId: "firstPlayer",
            volumeTitle: "(Shift+Q [>] Shift+A [<])"
        },
        {
            deckNumber: 2,
            color: "blue",
            playerData: secondPlayer,
            seekState: secondSeek,
            isPlaying: secondIsPlaying,
            onTogglePlayback: () => togglePlayback(secondPlayerRef, secondIsPlaying, setSecondIsPlaying),
            onSeek: (value) => handleSeek(secondPlayerRef, setSecondSeek, value),
            onSetSeeking: (seeking) => setPlayerSeeking(setSecondSeek, seeking),
            onPlayerReady: onReadySecondPlayer,
            volumeRef: inputVolSecondPlayerRef,
            onVolumeChange: handleChangeVolumeSecondPlayer,
            playerId: "secondPlayer",
            volumeTitle: "(Shift+W [>] Shift+S [<])"
        }
    ];

    return (
        <section className="mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-5xl flex-col px-3 pb-28 pt-4 sm:px-4 sm:pb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {
                    deckPanels.map((deck) => (
                        <DeckPanel key={deck.playerId} {...deck} />
                    ))
                }
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-800 bg-neutral-950/95 p-3 pb-8 backdrop-blur sm:sticky sm:bottom-0 sm:mt-4 sm:border sm:border-neutral-800 sm:bg-black/40 sm:p-4">
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
    );
}
