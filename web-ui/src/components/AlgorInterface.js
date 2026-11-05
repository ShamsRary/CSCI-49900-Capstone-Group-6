let currentWorker = undefined;

const stop = () => {
    currentWorker?.terminate();
    currentWorker = undefined;
};
export function GenerateAsync(input) {
    if (currentWorker) stop(); //only one worker can run at a time; always cancel the existing one
    if (input == false) return Promise.resolve(null); //"false" param means to cancel algorithm

    console.log("Starting algorithm worker...");
    currentWorker = new Worker(new URL('./AlgorWorker.js', import.meta.url), { type: "module" });
    return new Promise((resolve, reject) => {
        currentWorker.onmessage = ({ data }) => {
            stop();
            data.ok ? resolve(data.result) : reject(new Error(data.error));
        };
        currentWorker.onerror = (error) => {
            stop();
            reject(new Error(error.message));
        };
        currentWorker.postMessage(input);
    })
}