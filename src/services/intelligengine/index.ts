import { request } from 'umi';
import { extend } from 'umi-request';

export async function addRepository(repoUrl: string) {
  const client = extend({
    method: 'POST',
    body: JSON.stringify({
      url: repoUrl,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return await client('/api/repository');
}

export async function getRepositories() {
  // We have to do some parsing here, since the server just returns raw query result
  return await request('/api/repositories', {
    method: 'GET',
  });
}
