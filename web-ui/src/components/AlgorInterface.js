const worker = new Worker(new URL('./AlgorWorker.js', import.meta.url), { type: "module" });

function run(input) {
    return new Promise((resolve, reject) => {
        worker.onmessage = ({ data }) => data.ok ? resolve(data.result) : reject(new Error(data.error));
        worker.onerror = (error) => reject(new Error(error.message));
        worker.postMessage(input);
    })
}

// Serialize calls so overlapping requests can't overwrite each other's handlers
let queue = Promise.resolve()
export function GenerateAsync(input) {
    const result = queue.then(() => run(input));
    queue = result.catch(() => { }); // keep the queue alive after a failure
    return result;
}