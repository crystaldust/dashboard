// TODO Update the SQL to:
//  fetch the company list with contribution count, contributor count, last commit with order
//  or even with specified path
export function companyListSql(owner: string, repo: string, from: number, to: number, topN = 20) {
  return `
  select distinct splitByChar('@', author_email)[-1] as domain, count() as commit_count
from gits_dir_label
where domain != ''
  and search_key__owner = '${owner}'
  and search_key__repo = '${repo}'
and toYYYYMM(authored_date) >= ${from}
and toYYYYMM(authored_date) <= ${to}
group by domain
order by commit_count
        desc
limit ${topN}
  `;
}

export function dirCommitsSql(
  owner: string,
  repo: string,
  from: number,
  to: number,
  company: string,
  // dir: string = '',
) {
  return `
  select author_name, author_email, authored_date, dir_list
from gits_dir_label
where search_key__owner = '${owner}'
  and search_key__repo = '${repo}'
  and toYYYYMM(authored_date) >= ${from}
  and toYYYYMM(authored_date) <= ${to}
  and splitByChar('@', author_email)[-1] like '%${company}%'
  `;
}

// TODO SQLs missing:
//  - Get dir paths for dir tree(already exists in other module)
//  - Get contributor commits(without specifying projects and companies
//  - Get companies commits(replace the dirCommitsSql above)
