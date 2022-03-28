import { request } from 'umi';

export async function getClickhouseResult(body: string) {
  return request<string>('/sql/transfer', {
    method: 'POST',
    params: {
      sql: body,
    },
  });
}
