import { loadPyodide } from "pyodide";
import algorithm from "./CrosswordAlgor.py?raw"

export async function Generate(cfg) {
    const pyodide = await loadPyodide();
    const input = pyodide.toPy(cfg);
    pyodide.globals.set("PUZZLE_CONFIG", input);
    input.destroy();
    const resultProxy = pyodide.runPython(algorithm);
    const output = resultProxy.toJs({ dict_converter: Object.fromEntries });
    resultProxy.destroy();
    return output;
}