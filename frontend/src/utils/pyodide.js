let pyodide = null;

export const initPyodide = async () => {
    if (pyodide) return pyodide;

    try {
        pyodide = await window.loadPyodide();
        await pyodide.loadPackage(["numpy", "opencv-python"]);
        return pyodide;
    } catch (error) {
        console.error("Error loading Pyodide:", error);
        throw error;
    }
};

export const runPythonProcess = async (script, globals = {}) => {
    if (!pyodide) {
        throw new Error("Pyodide not initialized");
    }

    // Convert globals to Pyodide dictionary
    // Note: For simple types this is easy, for images we might need specific handling
    // but for now let's assume globals are passed as key-value pairs in python scope

    for (const [key, value] of Object.entries(globals)) {
        pyodide.globals.set(key, value);
    }

    try {
        const result = await pyodide.runPythonAsync(script);

        // Clean up globals to prevent memory leaks?
        // pyodide.globals.delete(key)? - Optional optimization

        return result;
    } catch (error) {
        console.error("Error running Python code:", error);
        throw error;
    }
};
