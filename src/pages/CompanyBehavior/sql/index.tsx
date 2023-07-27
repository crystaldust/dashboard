// TODO Update the SQL to:
//  fetch the company list with contribution count, contributor count, last commit with order
//  or even with specified path
export const UNIQ_OWNER_REPOS_SQL =
  'select distinct search_key__owner, search_key__repo from dir_label_new_test';

// TODO Add 'order' parameter
export function companyListSql(
  owner: string,
  repo: string,
  dateRange = undefined,
  dir: string = '',
  order: string = 'commit', // 'contributor_count' or 'commit_count'
  topN = 20,
) {
  const dateRangeClause = dateRange
    ? `and toYYYYMM(authored_date) <= ${dateRange.to}
     and toYYYYMM(authored_date) >= ${dateRange.from}`
    : '';

  const dirClause = dir ? `and dir = ${dir}` : '';

  return `
with '${owner}' as owner, '${repo}' as repo
select a.*, b.commit_count
from (
    select search_key__owner, search_key__repo,author_company, count() as contributor_count
      from (

          select search_key__owner, search_key__repo, toString(author__id),author_company
            from dir_label_new_test
            where search_key__owner = owner
              and search_key__repo = repo
              and author__id != 0
              ${dateRangeClause}
              and author_company !=''
            ${dirClause}
            group by search_key__owner, search_key__repo, author__id,author_company
            union all
            select search_key__owner, search_key__repo, author_email,author_company
            from dir_label_new_test
            where search_key__owner = owner
              and search_key__repo = repo
              and author__id = 0
              ${dateRangeClause}
            and author_company !=''
            ${dirClause}
            group by search_key__owner, search_key__repo, author_email, author_company)
      group by search_key__owner, search_key__repo,author_company) as a global
         join (
             select search_key__owner, search_key__repo,author_company, count() as commit_count
               from (
                   select search_key__owner, search_key__repo, hexsha,author_company
                     from dir_label_new_test
                     where search_key__owner = owner
                       and search_key__repo = repo
                       ${dateRangeClause}
                       ${dirClause}
                     and author_company !=''
                     group by search_key__owner, search_key__repo, hexsha,author_company)
               group by search_key__owner, search_key__repo,author_company
    ) as b on a.search_key__owner = b.search_key__owner and a.search_key__repo = b.search_key__repo and a.author_company = b.author_company
order by ${order} desc
limit ${topN}
  `;
}

export function commitsSql(
  owner: string,
  repo: string,
  company: string,
  dateRange = undefined,
  dir: string = '',
) {
  const dateRangeClause = dateRange
    ? `and toYYYYMM(authored_date) <= ${dateRange.to}
     and toYYYYMM(authored_date) >= ${dateRange.from}`
    : '';

  const dirClause = dir ? `and dir = ${dir}` : '';

  return `
with '${owner}' as owner, '${repo}' as repo, '${company}' as company
select search_key__owner, search_key__repo, hexsha, author_email, authored_date, author_name, author_tz
from dir_label_new_test
where search_key__owner = owner
  and search_key__repo = repo
  and author_company = company
  ${dateRangeClause}
  ${dirClause}
group by search_key__owner, search_key__repo, hexsha, author_email, authored_date, author_name, author_tz
  `;
}

// TODO SQLs missing:
//  - Get dir paths for dir tree(already exists in other module)
//  - Get contributor commits(without specifying projects and companies
//  - Get companies commits(replace the dirCommitsSql above)

export function contributorsSql(owner, repo, company, dateRange = undefined, dir = '') {
  const dateRangeClause = dateRange
    ? `and toYYYYMM(authored_date) <= ${dateRange.to}
     and toYYYYMM(authored_date) >= ${dateRange.from}`
    : '';

  const dirClause = dir ? `and dir = ${dir}` : '';

  return `
with '${owner}' as owner, '${repo}' as repo, '${company}' as company
select search_key__owner, search_key__repo, toString(author__logins) as contributor
from dir_label_new_test
where search_key__owner = owner
  and search_key__repo = repo
  and author_company = company
  ${dateRangeClause}
  ${dirClause}
  and author__id != 0
group by search_key__owner, search_key__repo, author__logins
union all
select search_key__owner, search_key__repo, author_name
from dir_label_new_test
where search_key__owner = owner
  and search_key__repo = repo
  and author_company = company
  ${dateRangeClause}
  ${dirClause}
  and author__id = 0
group by search_key__owner, search_key__repo, author_name
  `;
}

export function dirListSql(owner: string, repo: string, dateRange = undefined) {
  const dateRangeClause = dateRange
    ? `and toYYYYMM(authored_date) <= ${dateRange.to}
     and toYYYYMM(authored_date) >= ${dateRange.from}`
    : '';

  return `
with '${owner}' as owner, '${repo}' as repo
select dir
from dir_label_new_test
            where search_key__owner = owner
              and search_key__repo = repo
              ${dateRangeClause}
group by search_key__owner, search_key__repo, dir
order by dir
  `;
}
