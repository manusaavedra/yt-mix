"use client"

import { useEffect, useState } from "react";

export default function useMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const isMobile = () => {
            const toMatch = [
                /Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i,
                /Windows Phone/i
            ];

            return toMatch.some((toMatchItem) => {
                return navigator.userAgent.match(toMatchItem);
            })
        }

        setIsMobile(isMobile)
    }, [])

    return {
        isMobile
    }
}