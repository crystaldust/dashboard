import { request } from 'umi';
import { extend } from 'umi-request';

export async function runSql(sql: string) {
  const result = await request('/clickhouse/sql', {
    method: 'POST',
    params: {
      sql,
    },
  });

  return {
    data: result[0],
    columns: result[1],
  };
}

export async function getAllOwners() {
  const result = await request('/clickhouse/sql', {
    method: 'POST',
    params: {
      sql: 'SELECT DISTINCT owner FROM activities',
    },
  });
  // We have to do some parsing here, since the server just returns raw query result
  return result.map((item) => item[0]);
}

export async function getRepos(owner: string): Promise<string[]> {
  const result = await request('/clickhouse/sql', {
    method: 'POST',
    params: {
      sql: `SELECT DISTINCT repo FROM activities WHERE owner = '${owner}'`,
    },
  });

  return result.map((item: string[]) => item[0]);
}

export async function getActivities(owner: string, repo: string): Promise<CKData.Activity[]> {
  const result = await request('/clickhouse/sql', {
    method: 'POST',
    params: {
      sql: `SELECT * FROM activities WHERE owner = '${owner}' AND repo ='${repo}'`,
    },
  });

  const activities = result.map((act: any[]) => {
    const activity: CKData.Activity = {
      owner: act[0],
      repo: act[1],
      githubId: act[2],
      githubLogin: act[3],
      knowledgeSharing: parseFloat(act[4].toFixed(2)),
      codeContribution: parseFloat(act[5].toFixed(2)),
      issueCoordination: parseFloat(act[6].toFixed(2)),
      progressControl: parseFloat(act[7].toFixed(2)),
      codeTweaking: parseFloat(act[8].toFixed(2)),
      issueReporting: parseFloat(act[9].toFixed(2)),
    };
    return activity;
  });

  return activities;
}

export async function debug() {
  const client = extend({
    method: 'POST',
    params: {
      sql: 'SELECT DISTINCT owner FROM activities',
    },
  });

  const result = await client('/clickhouse/sql');
  const allOwners: string[] = [];
  result.forEach((item: string[]) => {
    allOwners.push(item[0]);
  });
  return allOwners;
}
