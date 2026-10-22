import { loadPyodide } from "pyodide";
import algorithm from "./CrosswordAlgor.py?raw"

const py = loadPyodide();

self.onmessage = async ({ data: i }) => {
    try {
        //initiate input to the algorithm
        const pyodide = await py;
        const pyi = pyodide.toPy(i);
        pyodide.globals.set("PUZZLE_CONFIG", pyi);
        pyi.destroy();

        //run and extract output
        const resultProxy = await pyodide.runPythonAsync(algorithm);
        const output = resultProxy.toJs({ dict_converter: Object.fromEntries });
        resultProxy.destroy();

        self.postMessage({ok: true, result: output})
    } catch (err) {
        self.postMessage({ok: false, error: String(err)})
    }
}