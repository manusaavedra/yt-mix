export function timeago(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
        return `hace ${interval} año${interval === 1 ? "" : "s"}`;
    }

    interval = Math.floor(seconds / 2592000);

    if (interval >= 1) {
        return `hace ${interval} mes${interval === 1 ? "" : "es"}`;
    }

    interval = Math.floor(seconds / 86400);

    if (interval >= 1) {
        return `hace ${interval} día${interval === 1 ? "" : "s"}`;
    }

    interval = Math.floor(seconds / 3600);

    if (interval >= 1) {
        return `hace ${interval} hora${interval === 1 ? "" : "s"}`;
    }

    interval = Math.floor(seconds / 60);

    if (interval >= 1) {
        return `hace ${interval} min`;
    }
    return `Hace un momento`;
}

export const formatTime = (value) => {
    const totalSeconds = Math.max(0, Math.floor(value || 0));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
};

export const crossfader = (threshold, value1, value2) => {
    if (threshold < -1 || threshold > 1) {
        return null;
    }

    const interpolatedValue1 = (1 - Math.abs(threshold)) * value1;
    const interpolatedValue2 = (1 - Math.abs(threshold)) * value2;

    if (threshold < 0) {
        return [value1, interpolatedValue2];
    }

    if (threshold > 0) {
        return [interpolatedValue1, value2];
    }

    return [parseFloat(interpolatedValue1), parseFloat(interpolatedValue2)];
}

export function rampTo(value, nextValue, ms, onUpdate) {
    const start = performance.now()
    const diff = nextValue - value

    function step(now) {
        const elapsed = now - start
        const progress = Math.min(elapsed / ms, 1)

        const currentValue = value + diff * progress
        onUpdate?.(currentValue)

        if (progress < 1) {
            requestAnimationFrame(step)
        }
    }

    requestAnimationFrame(step)
}
