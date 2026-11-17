let pending = undefined; //resolve() callback of the current running Promise
let reject = undefined; //reject() callback

const worker = new Worker(new URL('./AlgorWorker.js', import.meta.url), { type: "module" });
worker.onmessage = ({ data }) => {
    data.ok ? pending?.(data.result) : reject?.(new Error(data.error));
    pending = reject = undefined;
};
worker.onerror = (error) => {
    reject?.(new Error(error.message));
    pending = reject = undefined;
};
export function GenerateAsync(input) {

    //a false boolean input is a "cancel signal"
    if (input === false) {
        worker.postMessage(false);
        pending?.(null);
        pending = undefined;
        return Promise.resolve(null);
    }

    return new Promise((_resolve, _reject) => {
        pending = _resolve;
        reject = _reject;
        worker.postMessage(input);
    })
}