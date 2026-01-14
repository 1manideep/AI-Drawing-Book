export function floodFill(canvas, startX, startY, fillColorHex) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Helper to get color at x,y
    const getColorAt = (x, y) => {
        const idx = (y * width + x) * 4;
        return {
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a: data[idx + 3]
        };
    };

    // Helper to set color
    const setColorAt = (x, y, r, g, b, a) => {
        const idx = (y * width + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = a;
    };

    // Parse fill color
    const rFill = parseInt(fillColorHex.slice(1, 3), 16);
    const gFill = parseInt(fillColorHex.slice(3, 5), 16);
    const bFill = parseInt(fillColorHex.slice(5, 7), 16);

    const startColor = getColorAt(startX, startY);

    // Prevent filling the black borders (Lock Borders)
    // If pixel is OPAQUE and dark, assume it's a border and ignore.
    // If it's transparent, it's not a border, so we can fill it (or if backend is white).
    const isOpaque = startColor.a > 100;
    const isDark = startColor.r < 100 && startColor.g < 100 && startColor.b < 100;

    if (isOpaque && isDark) {
        return;
    }

    // Tolerance/Threshold
    const matchColor = (c1, c2) => {
        // Allow slight variance or strictly match white?
        // For line art (drawing), we usually fill white areas.
        // Euclidean distance or simple diff
        return Math.abs(c1.r - c2.r) < 50 &&
            Math.abs(c1.g - c2.g) < 50 &&
            Math.abs(c1.b - c2.b) < 50 &&
            Math.abs(c1.a - c2.a) < 50;
    };

    // Create queue
    const queue = [[startX, startY]];
    const visited = new Set();

    while (queue.length > 0) {
        const [x, y] = queue.shift();
        const key = `${x},${y}`;
        if (visited.has(key)) continue;

        const currentColor = getColorAt(x, y);

        if (matchColor(currentColor, startColor)) {
            setColorAt(x, y, rFill, gFill, bFill, 255);
            visited.add(key);

            if (x > 0) queue.push([x - 1, y]);
            if (x < width - 1) queue.push([x + 1, y]);
            if (y > 0) queue.push([x, y - 1]);
            if (y < height - 1) queue.push([x, y + 1]);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}
