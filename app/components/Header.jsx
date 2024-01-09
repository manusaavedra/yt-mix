import { BsInfo } from "react-icons/bs";
import Info from "./Info";
import ModalButton from "./ModalButton";

export default function Header() {
    return (
        <header className="bg-black flex items-center justify-between p-4 sticky top-0 left-0 z-40">
            <picture className="w-[140px]">
                <img src="/logo.svg" alt="yt-mix logo" />
            </picture>
            <ModalButton
                buttonContent={
                    <BsInfo size={24} />
                }
            >
                <Info />
            </ModalButton>
        </header>
    )
}