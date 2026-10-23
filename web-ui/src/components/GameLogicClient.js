const worker = new Worker(new URL("./GameLogicEngine.js", import.meta.url), { type: "module" });

let queue = Promise.resolve();
function run(message) {
  const result = queue.then(() => new Promise((resolve, reject) => {
    worker.onmessage = ({data}) => (data.ok ? resolve(data.result) : reject(new Error(data.error)));
    worker.onerror = (e) => reject(new Error(e.message));
    worker.postMessage(message);
  }));
  queue = result.catch(() => {});
  return result;
}


export const StartGame = (pairs) => run({type: "start", pairs});
export const SubmitAnswer = (index, guess) => run({type: "answer", index, guess});
export const UseHint = (index) => run({type: "hint", index});
export const GetSnapshot = () => run({type: "snapshot"});