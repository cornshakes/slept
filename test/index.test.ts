import { promt, sleep, wait_for } from '../src/index';

test('sleep returns a promise that resolves after the timeout', async () => {
  const before = Date.now();
  await sleep(10);
  expect(Date.now() - before).toBeGreaterThanOrEqual(10);
  expect(Date.now() - before).toBeLessThanOrEqual(15);
});

describe('wait_for', () => {
  test('waits until the predicate function returns true', async () => {
    const before = Date.now();
    await wait_for(() => true);
    expect(Date.now() - before).toBeLessThanOrEqual(5);
  });

  test('waits until the Promise returned from the predicate function resolves to true', async () => {
    const before = Date.now();
    await wait_for(() => new Promise((resolve) => resolve(true)));
    expect(Date.now() - before).toBeLessThanOrEqual(5);
  });

  test('throws if the timeout is reached before the predicate function returns true', async () => {
    const before = Date.now();
    await expect(wait_for(() => false, { timeout: 1 })).rejects.toThrow('timeout');
    expect(Date.now() - before).toBeLessThanOrEqual(10);
  });

  test('throws if the timeout is reached before the Promise returned from the predicate function resolves to true', async () => {
    const before = Date.now();
    await expect(wait_for(() => new Promise((r) => r(false)), { timeout: 1 })).rejects.toThrow('timeout');
    expect(Date.now() - before).toBeLessThanOrEqual(10);
  });

  test('throws if the predicate function throws', async () => {
    await expect(
      wait_for(
        () => {
          throw Error('bad');
        },
        { timeout: 20 }
      )
    ).rejects.toThrow('bad');
  });

  test('throws if the Promise returned from the predicate function rejects', async () => {
    await expect(wait_for(() => new Promise((_, r) => r(Error('bad'))), { timeout: 20 })).rejects.toThrow(
      'bad'
    );
  });

  test('takes a custom message for the timeout error', async () => {
    await expect(wait_for(() => false, { timeout: 1, timeout_message: '🍋' })).rejects.toThrow('🍋');
  });

  test('executes the predicate function every $interval milliseconds', async () => {
    const nope = jest.fn(() => false);
    const waiter = wait_for(nope, { interval: 10, timeout: 50 });
    await expect(waiter).rejects.toThrow('timeout');
    expect(nope).toHaveBeenCalledTimes(5);
  });

  test('stops executing the predicate function after the timeout has been reached', async () => {
    const nope = jest.fn(() => false);
    const waiter = wait_for(nope, { interval: 1, timeout: 0 });
    await expect(waiter).rejects.toThrow('timeout');
    await sleep(10);
    expect(nope).toHaveBeenCalledTimes(1);
  });
});

describe('promt', () => {
  test('returns a promise and its resolve and reject functions', async () => {
    const { promise, resolve, reject } = promt();
    expect(promise).toBeInstanceOf(Promise);
    expect(resolve).toBeInstanceOf(Function);
    expect(reject).toBeInstanceOf(Function);
  });

  test('resolves the promise when the resolve function is called', async () => {
    const { promise, resolve } = promt();
    resolve();
    expect(promise).resolves.toBeUndefined();
  });

  test('returns the value passed to the resolve function', async () => {
    const { promise, resolve } = promt<string>();
    resolve('hello');
    expect(promise).resolves.toEqual('hello');
  });

  test('rejects the promise when the reject function is called', async () => {
    const { promise, reject } = promt();
    reject('absolutely not');
    await expect(promise).rejects.toEqual('absolutely not');
  });
});
