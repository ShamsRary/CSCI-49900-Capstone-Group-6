import { loadPyodide } from "pyodide";
import algorithm from "./CrosswordAlgor.py?raw"

const py = loadPyodide({ fullStdLib: false });
//const py = loadPyodide();

self.onmessage = async ({ data: i }) => {
    try {
        //initiate input to the algorithm
        const initStart = performance.now();
        const pyodide = await py;
        const pyi = pyodide.toPy(i);
        pyodide.globals.set("PUZZLE_CONFIG", pyi);
        pyi.destroy();
        console.log(`Pyodide init took ${Math.trunc(performance.now() - initStart)}ms`)

        //run and extract output
        const start = performance.now();
        const resultProxy = await pyodide.runPythonAsync(algorithm);
        console.log(`Generator took ${Math.trunc(performance.now() - start)}ms`);

        const output = resultProxy.toJs({ dict_converter: Object.fromEntries });
        resultProxy.destroy();

        self.postMessage({ok: true, result: output})
    } catch (err) {
        self.postMessage({ok: false, error: String(err)})
    }
}