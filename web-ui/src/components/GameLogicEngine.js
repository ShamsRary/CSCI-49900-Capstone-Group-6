import { loadPyodide } from "pyodide";
import init from "../../../game/__init__.py?raw";
import parser from "../../../game/parser.py?raw";
import hints from "../../../game/hints.py?raw";
import game from "../../../game/game.py?raw";
import layout from "../../../game/layout.py?raw";

const ready = loadPyodide().then((py) => {
  py.FS.mkdir("game");
  const files = { __init__: init, parser, hints, game, layout };
  for (const [name, src] of Object.entries(files)) py.FS.writeFile(`game/${name}.py`, src);
  return py;
});

const toJs = (p) => { const r = p.toJs({ dict_converter: Object.fromEntries }); p.destroy?.(); return r; };

async function handle(py, { type, pairs, index, guess }) {
  if (type === "start") {
    py.globals.set("PAIRS", py.toPy(pairs));
    return toJs(await py.runPythonAsync(`
from game.parser import validate_questions
from game.game import Game
from game.layout import build_generator_input
QS = validate_questions(PAIRS)
GAME = Game(QS)
GAME.start()
{"input": build_generator_input(QS), "snapshot": GAME.snapshot()}
`));
  }
  py.globals.set("IDX", index);
  py.globals.set("GUESS", guess ?? "");
  if (type === "answer") return toJs(await py.runPythonAsync(`GAME.submit_answer(IDX, GUESS)`));
  if (type === "hint") return await py.runPythonAsync(`GAME.use_hint(IDX)`);
  if (type === "snapshot") return toJs(await py.runPythonAsync(`GAME.snapshot()`));
}

self.onmessage = async ({ data }) => {
  try {
    self.postMessage({ ok: true, result: await handle(await ready, data) });
  } catch (err) {
    const lines = String(err.message).trim().split("\n");
    const at = lines.findIndex((l) => l.startsWith("ValueError:"));
    self.postMessage({ ok: false, error: (at >= 0 ? lines.slice(at).join("\n").replace("ValueError: ", "") : String(err)) });
  }
};