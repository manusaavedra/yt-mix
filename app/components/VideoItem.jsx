export default function VideoItem({ title, imageUrl, onFavorite, onAddToFirstPlayer, onAddToSecondPlayer }) {
    return (
        <div className="relative group overflow-hidden bg-black bg-opacity-30 border max-w-[200px] w-full rounded-md p-2">
            <picture>
                <img className="w-full" src={imageUrl} alt={title} />
            </picture>
            <h4 className="font-bold">{title}</h4>
            <div className="group-hover:block hidden absolute top-2 right-2">
                <button className="bg-yellow-500 text-black px-1 font-semibold rounded-md" onClick={onFavorite}>Add Favorito</button>
            </div>
            <div className="group-hover:flex absolute bottom-0 left-0 w-full hidden items-center gap-2">
                <button className="w-1/2 bg-red-500 bg-opacity-60 text-4xl font-bold text-white" onClick={onAddToFirstPlayer}>
                    1
                </button>
                <button className="w-1/2 bg-blue-500 bg-opacity-60 text-4xl font-bold text-white" onClick={onAddToSecondPlayer}>
                    2
                </button>
            </div>
        </div>
    )
}