import { request } from '@@/plugin-request/request';

export async function getTotalFixIntensity() {
  return await request('/influence_metric/centrality_score/total_fix_intensity', {
    method: 'GET',
  });
}

export async function getNetworkBaseGraph() {
  return await request('/influence_metric/centrality_score/basic_graph', {
    method: 'GET',
  });
}

export async function getPageRanking(topN = 10) {
  return await request('/influence_metric/get_page_rank_topN', {
    method: 'GET',
    body: {
      top: topN,
    },
  });
}

export async function getCentrialityScore() {
  return await request('/influence_metric/centrality_score', {
    method: 'GET',
  });
}

export async function getMaximumIntensity() {
  return await request('/influence_metric/centrality_score/person_metrics', {
    method: 'GET',
    // body: {
    //   top: topN,
    // },
    // body: sql,
    // headers: {
    //   jsonObjects,
    // },
  });
}
