"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import YoutubePlayer from "@/components/YoutubePlayer";
import { createOutputState, getOverlayOpacity, readOutputState, subscribeOutputState } from "@/helpers/output";

const syncPlayerState = (player, deckState) => {
    if (!player || !deckState?.id) {
        return;
    }

    try {
        const currentData = player.getVideoData?.();
        const currentVideoId = currentData?.video_id;

        if (currentVideoId !== deckState.id) {
            player.loadVideoById({
                videoId: deckState.id,
                startSeconds: deckState.currentTime || 0
            });
            player.mute();
            return;
        }

        const currentTime = player.getCurrentTime?.() || 0;

        if (Math.abs(currentTime - (deckState.currentTime || 0)) > 1.5) {
            player.seekTo(deckState.currentTime || 0, true);
        }

        if (deckState.isPlaying) {
            player.playVideo();
        } else {
            player.pauseVideo();
        }

        player.mute();
    } catch (error) {
        console.warn("External output sync skipped", error);
    }
};

export default function OutputPage() {
    const [outputState, setOutputState] = useState(() => createOutputState());
    const firstPlayerRef = useRef(null);
    const secondPlayerRef = useRef(null);

    useEffect(() => {
        setOutputState(readOutputState());
        return subscribeOutputState(setOutputState);
    }, []);

    const handleFirstPlayerReady = useCallback((event) => {
        firstPlayerRef.current = event.target;

        try {
            event.target.mute();
        } catch (error) {
            console.warn("External first deck mute skipped", error);
        }

        syncPlayerState(event.target, outputState.firstDeck);
    }, [outputState.firstDeck]);

    const handleSecondPlayerReady = useCallback((event) => {
        secondPlayerRef.current = event.target;

        try {
            event.target.mute();
        } catch (error) {
            console.warn("External second deck mute skipped", error);
        }

        syncPlayerState(event.target, outputState.secondDeck);
    }, [outputState.secondDeck]);

    useEffect(() => {
        syncPlayerState(firstPlayerRef.current, outputState.firstDeck);
    }, [outputState.firstDeck]);

    useEffect(() => {
        syncPlayerState(secondPlayerRef.current, outputState.secondDeck);
    }, [outputState.secondDeck]);

    const firstDeckOpacity = getOverlayOpacity(outputState.crossfade);
    const hasFirstDeck = Boolean(outputState.firstDeck?.id);
    const hasSecondDeck = Boolean(outputState.secondDeck?.id);

    return (
        <main className="relative min-h-dvh overflow-hidden bg-black text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_50%)]" />

            {
                hasSecondDeck ? (
                    <YoutubePlayer
                        id="externalSecondDeck"
                        videoId={outputState.secondDeck.id}
                        title={outputState.secondDeck.title}
                        onPlayerReady={handleSecondPlayerReady}
                        playerVars={{
                            autoplay: 1,
                            controls: 0,
                            disablekb: 1,
                            fs: 0,
                            iv_load_policy: 3
                        }}
                        className="absolute inset-0 h-full w-full [&>div]:scale-[1.05]"
                    />
                ) : (
                    <div className="absolute inset-0 grid place-items-center bg-neutral-950">
                        <p className="text-lg font-semibold text-neutral-400">Deck 2 esperando video</p>
                    </div>
                )
            }

            {
                hasFirstDeck && (
                    <div
                        className="absolute inset-0 transition-opacity duration-150"
                        style={{ opacity: firstDeckOpacity }}
                    >
                        <YoutubePlayer
                            id="externalFirstDeck"
                            videoId={outputState.firstDeck.id}
                            title={outputState.firstDeck.title}
                            onPlayerReady={handleFirstPlayerReady}
                            playerVars={{
                                autoplay: 1,
                                controls: 0,
                                disablekb: 1,
                                fs: 0,
                                iv_load_policy: 3
                            }}
                            className="absolute inset-0 h-full w-full [&>div]:scale-[1.05]"
                        />
                    </div>
                )
            }

            {
                !hasFirstDeck && !hasSecondDeck && (
                    <div className="absolute inset-0 grid place-items-center bg-neutral-950">
                        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 px-8 py-6 text-center shadow-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Salida externa</p>
                            <h1 className="mt-3 text-3xl font-black">YT Mix</h1>
                            <p className="mt-2 text-neutral-400">Carga videos en los decks para transmitirlos aqui.</p>
                        </div>
                    </div>
                )
            }
        </main>
    );
}
