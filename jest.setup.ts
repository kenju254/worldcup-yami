import '@testing-library/jest-dom';

// Polyfill Web APIs that JSDOM environment lacks but modern Node.js has
if (typeof global.Request === 'undefined' && typeof globalThis.Request !== 'undefined') {
  // @ts-expect-error JSDOM environment typing overrides
  global.Request = globalThis.Request;
  // @ts-expect-error JSDOM environment typing overrides
  global.Response = globalThis.Response;
  // @ts-expect-error JSDOM environment typing overrides
  global.Headers = globalThis.Headers;
  // @ts-expect-error JSDOM environment typing overrides
  global.fetch = globalThis.fetch;
}
