import { loadPyodide } from "pyodide";
import algorithm from "./CrosswordAlgor.py?raw"

const { promise: pyodidePromise, resolve: pyodideResolve } = Promise.withResolvers();

self.onmessage = async ({ data: i }) => {
    const pyodide = await pyodidePromise; //Pyodide might not be ready at time of message; wait

    //cancel signal
    if (i === false) {
        await pyodide.runPythonAsync("CANCEL_FLAG = True");
        return;
    }

    try {
        //initiate input to the algorithm  
        const pyi = pyodide.toPy(i);
        pyodide.globals.set("PUZZLE_CONFIG", pyi);
        pyodide.globals.set("CANCEL_FLAG", false);
        pyi.destroy();

        //run and extract output
        const start = performance.now();
        const resultProxy = await pyodide.runPythonAsync("GenerateJSON(PUZZLE_CONFIG)");
        if (resultProxy === undefined) return;
        console.log(`Generator took ${Math.trunc(performance.now() - start)}ms`);

        const output = resultProxy.toJs({ dict_converter: Object.fromEntries });
        resultProxy.destroy();

        self.postMessage({ ok: true, result: output });
    } catch (err) {
        self.postMessage({ ok: false, error: String(err) });
    } finally {
        //cleanup input
        pyodide.globals.set("PUZZLE_CONFIG", undefined);
    }
}

// deferred loading of Pyodide and the algorithm environment

const initStart = performance.now();
const actualPyodide = await loadPyodide();
actualPyodide.runPython(algorithm);
pyodideResolve(actualPyodide);
console.log(`Pyodide init took ${Math.trunc(performance.now() - initStart)}ms`);