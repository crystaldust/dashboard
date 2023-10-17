import { request } from 'umi';

export async function getPRNetworkMetrics(
  metricName: string,
  owner: string,
  repo: string,
  time: string = 'ALL_TIME',
  // jsonObjects = false,
) {
  console.log(
    ` requesting influence_metric/pr_network_metrics/${metricName}/${owner}/${repo}/${time}`,
  );
  const result = await request(
    `/influence_metric/pr_network_metrics/${metricName}/${owner}/${repo}/${time}`,
    {
      method: 'GET',
    },
  ).catch((error) => {
    console.error('fetcherror: ' + error);
  });
  if (result.length === 0) {
    return [];
  }
  return { data: result[0][metricName] };
}
