import { formatTime } from "@/helpers";
import YoutubePlayer from "./YoutubePlayer";

export default function DeckPanel({
    deckNumber,
    color,
    playerData,
    seekState,
    isPlaying,
    onTogglePlayback,
    onSeek,
    onSetSeeking,
    onPlayerReady,
    volumeRef,
    onVolumeChange,
    playerId,
    volumeTitle
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className={`relative min-h-[180px] overflow-hidden rounded-2xl border bg-black/30 shadow-lg sm:min-h-[270px] ${color === "red" ? "border-red-500/60" : "border-blue-500/60"}`}>
                <div className={`absolute left-0 top-0 z-10 w-8 sm:w-12 rounded-br-2xl py-1 text-center text-sm font-black text-white ${color === "red" ? "bg-red-500" : "bg-blue-500"}`}>
                    {deckNumber}
                </div>

                <div className="relative z-10 flex min-h-[180px] items-center justify-center p-5 text-center sm:hidden">
                    <div className="w-full pt-2">
                        <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                            <div className="w-full overflow-hidden mb-4 text-base font-bold leading-5 text-white">
                                <div className="flex w-max animate-marquee">
                                    <p className="mx-4">{playerData?.title || `Carga un video en el deck ${deckNumber}`}</p>
                                </div>
                            </div>
                            <button
                                className={`mb-4 w-full rounded-xl border px-3 py-2 text-sm font-semibold ${color === "red" ? "border-red-500 bg-red-500/15 text-red-200" : "border-blue-500 bg-blue-500/15 text-blue-200"} ${!playerData ? "opacity-50" : ""}`}
                                onClick={onTogglePlayback}
                                disabled={!playerData}
                            >
                                {isPlaying ? "Pausar" : "Reproducir"}
                            </button>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={seekState.duration || 0}
                            step={1}
                            value={Math.min(seekState.current, seekState.duration || 0)}
                            onChange={(event) => onSeek(event.target.value)}
                            onMouseDown={() => onSetSeeking(true)}
                            onMouseUp={() => onSetSeeking(false)}
                            onTouchStart={() => onSetSeeking(true)}
                            onTouchEnd={() => onSetSeeking(false)}
                            onKeyDown={() => onSetSeeking(true)}
                            onKeyUp={() => onSetSeeking(false)}
                            disabled={!playerData}
                        />
                        <div className="mt-1 flex justify-between text-xs text-neutral-400">
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
                            onPlayerReady={onPlayerReady}
                            className="absolute inset-0 h-0 pointer-events-none opacity-0 sm:h-full sm:pointer-events-auto sm:opacity-100"
                        />
                    )
                }
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-white/[0.04] p-3 shadow-lg">
                <label className={`block text-sm font-semibold ${color === "red" ? "text-red-300" : "text-blue-300"}`}>
                    Volumen
                </label>
                <input
                    ref={volumeRef}
                    title={volumeTitle}
                    type="range"
                    className={color === "red" ? "red" : "blue"}
                    onInput={onVolumeChange}
                    defaultValue={75}
                    min={0}
                    max={100}
                />
            </div>
        </div>
    );
}