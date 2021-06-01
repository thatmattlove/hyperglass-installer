/**
 * GitHub API Response for Repository Content.
 *
 * @see https://docs.github.com/en/rest/reference/repos#get-repository-content
 */
export type GithubContent = {
  _links: {
    git: string;
    html: string;
    self: string;
  };
  content: string;
  download_url: string;
  encoding: string;
  git_url: string;
  html_url: string;
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
  url: string;
};

/**
 * Type guard to determine if the data is a valid GitHub Repository Content object.
 *
 * @param data JSON returned from request.
 */
export function isGithubContent(data: Record<string, unknown>): data is GithubContent {
  return '_links' in data && 'git_url' in data;
}
