export const OUTPUT_CHANNEL_NAME = "yt-mix-output";
export const OUTPUT_STORAGE_KEY = "yt-mix-output-state";

const defaultDeckState = {
    id: "",
    title: "",
    currentTime: 0,
    duration: 0,
    isPlaying: false
};

export function createOutputState(partialState = {}) {
    return {
        crossfade: -1,
        firstDeck: defaultDeckState,
        secondDeck: defaultDeckState,
        updatedAt: Date.now(),
        ...partialState
    };
}

export function readOutputState() {
    if (typeof window === "undefined") {
        return createOutputState();
    }

    try {
        const storedValue = window.localStorage.getItem(OUTPUT_STORAGE_KEY);

        if (!storedValue) {
            return createOutputState();
        }

        return createOutputState(JSON.parse(storedValue));
    } catch (error) {
        console.warn("Output state read skipped", error);
        return createOutputState();
    }
}

export function publishOutputState(nextState) {
    if (typeof window === "undefined") {
        return;
    }

    const payload = createOutputState(nextState);

    try {
        window.localStorage.setItem(OUTPUT_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.warn("Output state persistence skipped", error);
    }

    if (typeof window.BroadcastChannel === "undefined") {
        return;
    }

    try {
        const channel = new window.BroadcastChannel(OUTPUT_CHANNEL_NAME);
        channel.postMessage(payload);
        channel.close();
    } catch (error) {
        console.warn("Output state broadcast skipped", error);
    }
}

export function subscribeOutputState(onMessage) {
    if (typeof window === "undefined") {
        return () => {};
    }

    const handleStorage = (event) => {
        if (event.key !== OUTPUT_STORAGE_KEY || !event.newValue) {
            return;
        }

        try {
            onMessage(createOutputState(JSON.parse(event.newValue)));
        } catch (error) {
            console.warn("Output state storage sync skipped", error);
        }
    };

    window.addEventListener("storage", handleStorage);

    if (typeof window.BroadcastChannel === "undefined") {
        return () => {
            window.removeEventListener("storage", handleStorage);
        };
    }

    const channel = new window.BroadcastChannel(OUTPUT_CHANNEL_NAME);
    const handleChannelMessage = (event) => {
        onMessage(createOutputState(event.data));
    };

    channel.addEventListener("message", handleChannelMessage);

    return () => {
        window.removeEventListener("storage", handleStorage);
        channel.removeEventListener("message", handleChannelMessage);
        channel.close();
    };
}

export function getOverlayOpacity(crossfadeValue) {
    const normalized = Math.min(1, Math.max(0, (Number(crossfadeValue || 0) + 1) / 2));
    return 1 - normalized;
}
