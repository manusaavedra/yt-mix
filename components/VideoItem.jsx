import { BsDownload, BsHeartFill } from "react-icons/bs"

export default function VideoItem({ videoId, title, imageUrl, onFavorite, onAddToFirstPlayer, onAddToSecondPlayer }) {
    return (
        <div className="relative min-h-fit flex flex-col gap-3 overflow-hidden rounded-md border border-neutral-800 bg-black bg-opacity-30 p-2">
            <picture>
                <img className="w-full rounded-sm object-cover aspect-video" src={imageUrl} alt={title} />
            </picture>
            <h4 className="text-[10px] sm:text-sm font-bold leading-5">{title}</h4>
            <div className="absolute right-2 top-2 block">
                <button
                    className="bg-white text-red-500 p-2 font-semibold rounded-md"
                    onClick={onFavorite}
                >
                    <BsHeartFill />
                </button>
            </div>
            <div className="absolute left-2 top-2 block">
                <a
                    className="flex bg-neutral-800 text-white p-2 font-semibold rounded-md"
                    href={`https://www.youtubepi.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    <BsDownload />
                </a>
            </div>
            <div className="mt-auto flex items-center gap-2">
                <button className="w-1/2 rounded-sm bg-red-500 py-2 text-xl font-bold text-white" onClick={onAddToFirstPlayer}>
                    1
                </button>
                <button className="w-1/2 rounded-sm bg-blue-500 py-2 text-xl font-bold text-white" onClick={onAddToSecondPlayer}>
                    2
                </button>
            </div>
        </div>
    )
}
