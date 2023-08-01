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

  const dirClause = dir ? `and dir = '${dir}/'` : '';

  return `
with '${owner}' as owner, '${repo}' as repo
select a.*, b.commit_count, b.last_active_time, b.total_insertions, b.total_deletions, b.total_commit_lines
from (
         select search_key__owner, search_key__repo, author_company, count() as contributor_count
         from (
                  select search_key__owner, search_key__repo, toString(author__id), author_company
                  from dir_label_new_test
                  where search_key__owner = owner
                    and search_key__repo = repo
                    and author__id != 0
                    ${dateRangeClause}
                    and author_company != ''
                    ${dirClause}
                  group by search_key__owner, search_key__repo, author__id, author_company
                  union all
                  select search_key__owner, search_key__repo, author_email, author_company
                  from dir_label_new_test
                  where search_key__owner = owner
                    and search_key__repo = repo
                    and author__id = 0
                    ${dateRangeClause}
                    and author_company != ''
                    ${dirClause}
                  group by search_key__owner, search_key__repo, author_email, author_company)
         group by search_key__owner, search_key__repo, author_company) as a global
         join (
    select search_key__owner,
           search_key__repo,
           author_company,
           max(authored_date)     as last_active_time,
           sum(commit_insertions) as total_insertions,
           sum(commit_deletions)  as total_deletions,
           sum(commit_lines)      as total_commit_lines,
           count()                as commit_count
    from (select search_key__owner,
                 search_key__repo,
                 hexsha,
                 authored_date,
                 author_company,
                 commit_insertions,
                 commit_deletions,
                 commit_lines
          from dir_label_new_test
          where search_key__owner = owner
            and search_key__repo = repo
            ${dateRangeClause}
            and author_company != ''
            ${dirClause}
          group by search_key__owner, search_key__repo, hexsha, authored_date, author_company, commit_insertions,
                   commit_deletions, commit_lines)
    group by search_key__owner, search_key__repo, author_company) as b
              on a.search_key__owner = b.search_key__owner and a.search_key__repo = b.search_key__repo and
                 a.author_company = b.author_company
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

  const dirClause = dir ? `and dir = '${dir}/'` : '';

  return `
with '${owner}' as owner, '${repo}' as repo, '${company}' as company
select search_key__owner,
       search_key__repo,
       hexsha,
       message,
       author_email,
       authored_date,
       author_name,
       author_tz,
       commit_insertions,
       commit_deletions,
       commit_lines
from dir_label_new_test
where search_key__owner = owner
  and search_key__repo = repo
  and author_company = company
  ${dateRangeClause}
  ${dirClause}
group by search_key__owner, search_key__repo, hexsha, message, author_email, authored_date, author_name, author_tz,
         commit_insertions, commit_deletions, commit_lines
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

  const dirClause = dir ? `and dir = '${dir}/'` : '';

  return `
with '${owner}' as owner, '${repo}' as repo, '${company}' as company
select search_key__owner,
       search_key__repo,
       groupArray(author_name) as names,
       contributor,
       max(last_active_time)   as last_active_time,
       sum(total_insertions)   as total_insertions,
       sum(total_deletions)    as total_deletions,
       sum(total_commit_lines) as total_commit_lines,
       sum(commit_count)       as commit_count
from (select search_key__owner,
             search_key__repo,
             author_name,
             contributor,
             max(authored_date)     as last_active_time,
             sum(commit_insertions) as total_insertions,
             sum(commit_deletions)  as total_deletions,
             sum(commit_lines)      as total_commit_lines,
             count()                as commit_count
      from (
               select search_key__owner,
                      search_key__repo,
                      author_name,
                      author__logins as contributor,
                      hexsha,
                      authored_date,
                      commit_insertions,
                      commit_deletions,
                      commit_lines
               from dir_label_new_test
               where search_key__owner = owner
                 and search_key__repo = repo
                 and author_company = company
                 ${dateRangeClause}
                 ${dirClause}
                 and author__id != 0
               group by search_key__owner, search_key__repo, author_name, author__logins, hexsha, authored_date,
                        commit_insertions,
                        commit_deletions, commit_lines)
      group by search_key__owner, search_key__repo, contributor, author_name)
group by search_key__owner, search_key__repo, contributor
union all
select search_key__owner,
       search_key__repo,
       [author_name]          as names,
       []                     as contributor,
       max(authored_date)     as last_active_time,
       sum(commit_insertions) as total_insertions,
       sum(commit_deletions)  as total_deletions,
       sum(commit_lines)      as total_commit_lines,
       count()                as commit_count
from (
         select search_key__owner,
                search_key__repo,
                author_name,
                hexsha,
                authored_date,
                commit_insertions,
                commit_deletions,
                commit_lines
         from dir_label_new_test
         where search_key__owner = owner
           and search_key__repo = repo
           and author_company = company
           ${dateRangeClause}
           ${dirClause}
           and author__id = 0
         group by search_key__owner, search_key__repo, author_name, hexsha, authored_date, commit_insertions,
                  commit_deletions, commit_lines)
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
