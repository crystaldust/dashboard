import { request } from '@@/plugin-request/request';

export async function getTotalFixIntensity() {
  const result = await request('/influence_metric/get_total_fix_intensity', {
    method: 'GET',
    // body: sql,
    // headers: {
    //   jsonObjects,
    // },
  });

  return result;
}

export async function getNetworkBaseGraph() {
  const result = await request('/influence_metric/get_basic_graph', {
    method: 'GET',
    // body: sql,
    // headers: {
    //   jsonObjects,
    // },
  });

  return result;
}

export async function getPageRanking(topN = 10) {
  const result = await request('/influence_metric/get_page_rank_topN', {
    method: 'GET',
    body: {
      top: topN,
    },
    // body: sql,
    // headers: {
    //   jsonObjects,
    // },
  });

  return result;
}

export async function getCentrialityScore() {
  const result = await request('/influence_metric/get_centrality_score', {
    method: 'GET',
    // body: {
    //   top: topN,
    // },
    // body: sql,
    // headers: {
    //   jsonObjects,
    // },
  });

  return result;
}

export async function getMaximumIntensity() {
  const result = await request('/influence_metric/get_person_metrics', {
    method: 'GET',
    // body: {
    //   top: topN,
    // },
    // body: sql,
    // headers: {
    //   jsonObjects,
    // },
  });

  return result;
}
