// TODO Update the SQL to:
//  fetch the company list with contribution count, contributor count, last commit with order
//  or even with specified path
export const UNIQ_OWNER_REPOS_SQL =
  'select distinct search_key__owner, search_key__repo from dir_label_new_test';

// TODO Add 'order' parameter
export function companyListSql(owner: string, repo: string, from: number, to: number, topN = 20) {
  return `
  select author_company, count() as commit_count
from dir_label_new_test
where author_company != ''
and search_key__owner = '${owner}'
and search_key__repo = '${repo}'
and toYYYYMM(authored_date) >= ${from}
and toYYYYMM(authored_date) <= ${to}
group by author_company
order by commit_count desc
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
select author_name, author_email, authored_date, hexsha
from dir_label_new_test
where search_key__owner = '${owner}'
  and search_key__repo = '${repo}'
  and toYYYYMM(authored_date) >= ${from}
  and toYYYYMM(authored_date) <= ${to}
  and author_company = '${company}'
  `;
}

// TODO SQLs missing:
//  - Get dir paths for dir tree(already exists in other module)
//  - Get contributor commits(without specifying projects and companies
//  - Get companies commits(replace the dirCommitsSql above)
