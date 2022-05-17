export function allProjectsSQL() {
  return `
   select distinct search_key__origin,
                search_key__owner,
                search_key__repo
from gits`;
}

export function commitCountSql() {
  return `select count() from gits
    `;
}

export function developerCountSql() {
  return `
  select count(distinct (author_email)) from gits
  `;
}

export function repoCountSql() {
  return `
  select count(distinct (search_key__owner, search_key__repo)) from gits
  `;
}

export function issueCountSql() {
  return `
  select count() from github_issues
  `;
}

export function prCountSql() {
  return `
  select count() from github_pull_requests
  `;
}
