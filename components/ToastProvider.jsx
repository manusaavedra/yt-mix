import { useEffect, useRef, useState } from "react"

export default function ToastProvider({ children }) {
    const toastTimeoutRef = useRef(null)
    const [toastMessage, setToastMessage] = useState("")
    const [toastDeck, setToastDeck] = useState(null)

    const showAddedToast = (message, deck) => {
        setToastMessage(message)
        setToastDeck(deck)

        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current)
        }

        toastTimeoutRef.current = setTimeout(() => {
            setToastMessage("")
            setToastDeck(null)
        }, 3000)
    }

    const showSimpleMessage = (message) => {
        setToastDeck(null)
        setToastMessage(message)

        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current)
        }

        toastTimeoutRef.current = setTimeout(() => {
            setToastMessage("")
        }, 3000)
    }

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current)
            }
        }
    }, [])

    const borderColor = () => {
        if (toastDeck === 1) return "border-red-500"
        if (toastDeck === 2) return "border-blue-500"
        return "border-gray-500/50"
    }

    return (
        <>
            {typeof children === 'function' ? children({ showAddedToast, showSimpleMessage }) : children}
            {toastMessage && (
                <div className={`pointer-events-none border-l-8 ${borderColor()} bg-neutral-900/95 fixed right-4 top-4 z-50 w-[calc(100%-24px)] max-w-md rounded-md border px-4 py-3 text-sm font-semibold text-white shadow-2xl`}>
                    {toastMessage}
                </div>
            )}
        </>
    )

}