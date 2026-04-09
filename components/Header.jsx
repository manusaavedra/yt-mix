import { FaInfo } from "react-icons/fa";
import ModalButton from "./ModalButton";
import Info from "./Info";

export default function Header({ actions }) {
    return (
        <header className="sticky top-0 left-0 z-40 grid grid-cols-[40px_1fr_40px] items-center gap-3 bg-black p-4">
            <picture className="w-[110px] shrink-0 md:w-[140px]">
                <img src="/logo.svg" alt="yt-mix logo" />
            </picture>
            <div className="flex min-w-0 items-center justify-center gap-2">
                {actions}
            </div>
            <ModalButton
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-neutral-800 bg-neutral-900 text-white transition hover:border-neutral-700"
                position="top"
                buttonContent={
                    <FaInfo size={24} />
                }
            >
                <Info />
            </ModalButton>
        </header>
    )
}
