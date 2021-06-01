import { handleRequest } from './handler';

addEventListener('fetch', (event: FetchEvent): void => {
  event.respondWith(handleRequest(event));
});
