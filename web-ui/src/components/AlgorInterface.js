let currentWorker = undefined;
let pending = undefined; //resolve() callback of the current running Promise

const newWorker = () => new Worker(new URL('./AlgorWorker.js', import.meta.url), { type: "module" });

export function GenerateAsync(input) {

    //a false boolean input is a "cancel signal" that will just halt the current worker
    if (input === false || pending || !currentWorker) {
        currentWorker?.terminate();
        currentWorker = newWorker();
        pending?.(null);
        pending = undefined;
        if (input === false) return Promise.resolve(null);
    }

    console.log("Starting algorithm worker...");
    return new Promise((resolve, reject) => {
        pending = resolve;
        currentWorker.onmessage = ({ data }) => {
            data.ok ? resolve(data.result) : reject(new Error(data.error));
            pending = undefined;
        };
        currentWorker.onerror = (error) => {
            reject(new Error(error.message));
            pending = undefined;
        };
        currentWorker.postMessage(input);
    })
}