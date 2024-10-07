/**
 * Sleeps asynchronously for a specified number of milliseconds.
 * @param ms - The number of milliseconds to sleep.
 */
export const sleep = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Waits for a condition to be true within a specified timeout period.
 *
 * @param condition - The condition to wait for. It can be a synchronous function that returns a boolean,
 *                    or an asynchronous function that returns a Promise resolving to a boolean.
 * @param options - Optional configuration options for the wait operation.
 * @param options.interval - The interval (in milliseconds) at which the condition will be checked. Default is 100ms.
 * @param options.timeout - The maximum time (in milliseconds) to wait for the condition to be true. Default is 1000ms.
 * @param options.timeout_message - The error message to throw if the timeout is reached. Default is 'timeout'.
 * @throws {Error} If the timeout is reached before the condition becomes true.
 */
export const wait_for = async (
  condition: () => boolean | Promise<boolean>,
  options: {
    interval?: number;
    timeout?: number;
    timeout_message?: string;
  } = {}
) => {
  const { interval = 100, timeout = 1000, timeout_message = 'timeout' } = options;
  let timed_out = false;

  const timer = async () => {
    await sleep(timeout);
    timed_out = true;
    throw Error(timeout_message);
  };

  const poller = async () => {
    while (!timed_out && !(await condition())) {
      await sleep(interval);
    }
    await sleep(1);
  };

  await Promise.race([timer(), poller()]);
};

/**
 * Creates a promise and its corresponding resolve and reject functions to hide this boilerplate.
 * @returns An object containing the promise, resolve and reject functions.
 */
export const promt = <T = void>() => {
  let resolve: (value: T) => void = (_: T) => {};
  let reject: (reason: any) => void = (_: any) => {};

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};
