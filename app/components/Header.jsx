export default function Header() {
    return (
        <header className="bg-black flex items-center justify-between p-4 sticky top-0 left-0 z-40">
            <picture className="w-[140px]">
                <img src="/logo.svg" alt="yt-mix logo" />
            </picture>
            <span className="text-xs">Creado por <a className="underline" href="https://github.com/manusaavedra">Manuel Saavedra</a></span>
        </header>
    )
}