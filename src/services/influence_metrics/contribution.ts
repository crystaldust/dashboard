// import { request } from '@@/plugin-request/request';

// import { extend } from 'umi-request';
import { request } from 'umi';

export async function getTotalFixIntensity() {
  return await request('/influence_metric/contribution/total_fix_intensity', {
    method: 'GET',
  });
}

export async function getNetworkBaseGraph() {
  // return await request('/influence_metric/contribution/basic_graph', {
  //   method: 'GET',
  // });

  // TODO This is temporarily for debugging
  //  A viable approach is to organize the data by edges:
  //  Get a list of edges by filter(like top N, value above threshold)
  //  Generate the nodes by edges' (from, to)
  return request('/influence_metric/contribution/basic_graph', {
    method: 'GET',
  }).then((data) => {
    return {
      nodes: data.nodes.slice(0, 1000),
      edges: data.edges.slice(0, 1000),
    };
  });
}

export async function getPageRanking(topN = 10) {
  return await request('/influence_metric/contribution/page_rank_topN', {
    method: 'GET',
    // body: {
    //   top: topN,
    // },
  });
}

export async function getCentrialityScore() {
  return await request('/influence_metric/contribution/centrality_score', {
    method: 'GET',
  });
}

export async function getMaximumIntensity() {
  return await request('/influence_metric/contribution/person_metrics', {
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
