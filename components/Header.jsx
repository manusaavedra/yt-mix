export default function Header({ actions }) {
    return (
        <header className="bg-black flex items-center justify-between p-4 sticky top-0 left-0 z-40">
            <picture className="w-[140px]">
                <img src="/logo.svg" alt="yt-mix logo" />
            </picture>
            <div className="flex items-center gap-2">
                {actions}
            </div>
        </header>
    )
}
