import queryString from 'query-string';
import randomString from 'crypto-random-string';
import { isGithubContent } from './types';

/**
 * Raw installer script content.
 */
const SCRIPT_URL = 'https://raw.githubusercontent.com/thatmattlove/hyperglass/main/install.sh';

/**
 * GitHub API target for the installer script.
 */
const GITHUB_CONTENT_URL =
  'https://api.github.com/repos/thatmattlove/hyperglass/contents/install.sh';

/**
 * Create a Response object with a body in the form of a bash script.
 */
function ErrorResponse(error: string) {
  return new Response(`(echo '${error}'; exit 1)`, {
    headers: { 'content-type': 'application/x-sh' },
  });
}

/**
 * Get the installer script's commit SHA for caching purposes.
 */
async function getInstallerSha(): Promise<string | null> {
  const res = await fetch(GITHUB_CONTENT_URL, {
    method: 'GET',
    headers: { accept: 'application/json' },
  });
  if (res.ok) {
    const data = await res.json();
    if (isGithubContent(data)) {
      const { sha } = data;
      return sha;
    }
  }
  return null;
}

/**
 * Get the installer script from GitHub, or a bash script to print an error message if we're unable
 * to get the script from GitHub.
 *
 */
async function getInstaller(): Promise<Response> {
  try {
    const res = await fetch(SCRIPT_URL, { method: 'GET' });
    const installer = await res.text();
    return new Response(installer, { headers: { 'content-type': 'application/x-sh' } });
  } catch (err) {
    let message = `An error occurred while downloading the script from '${SCRIPT_URL}':\n`;
    if (err instanceof Error) {
      message += err.message;
    } else {
      message += String(err);
    }
    return ErrorResponse(message);
  }
}

/**
 * Handle the Worker Request, return a bash script to either install hyperglass or print an error.
 *
 * @param event Fetch Event
 */
export async function handleRequest(event: FetchEvent): Promise<Response> {
  const cache = caches.default;
  try {
    // Get the current commit SHA of the installer file.
    const installerSha = await getInstallerSha();

    // Create a URL containing the commit SHA as a cache key, or a random string if we're unable to
    // get the commit SHA (the random string should ensure we do NOT return a cached response).
    let key: string = installerSha ?? randomString({ length: 32, type: 'url-safe' });
    const url = queryString.stringifyUrl({ url: 'https://install.hyperglass.dev', query: { key } });

    const cacheKey = new Request(url, { method: 'GET' });

    // Return the cached response if one exists.
    const cached = await cache.match(cacheKey);
    if (typeof cached !== 'undefined') {
      return cached;
    }

    // Get the installer script content.
    const response = await getInstaller();

    event.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    let message = `Something went wrong`;
    if (err instanceof Error) {
      message += `: "${err.message}"`;
    } else {
      message += String(err);
    }
    return ErrorResponse(message);
  }
}
