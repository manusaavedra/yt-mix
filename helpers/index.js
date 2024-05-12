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