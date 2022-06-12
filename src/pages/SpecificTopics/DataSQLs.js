import { dateToYearMonthInt } from '@/pages/ContribDistribution/DataProcessors';

export function firstCommitDateSql(owner, repo) {
  return `select authored_date from gits
where search_key__owner='${owner}'
and search_key__repo='${repo}'
order by authored_date
limit 1`;
}

export function authorCountOfMonthSql(owner, repo, date) {
  const thatMonth = dateToYearMonthInt(date.toISOString());
  const nextMonth = dateToYearMonthInt(
    new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
    ).toISOString(),
  );
  return `select count(distinct author_email) from gits
where search_key__owner='${owner}'
and search_key__repo='${repo}'
and toYYYYMM(authored_date)>=${thatMonth}
and toYYYYMM(authored_date)<${nextMonth}`;
}

export function commitCountOfMonthSql(owner, repo, date) {
  const thatMonth = dateToYearMonthInt(date.toISOString());
  const nextMonth = dateToYearMonthInt(
    new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
    ).toISOString(),
  );
  return `select count() from gits
where search_key__owner='${owner}'
and search_key__repo='${repo}'
and toYYYYMM(authored_date)>=${thatMonth}
and toYYYYMM(authored_date)<${nextMonth}`;
}

export function topDomainsSql(owner, repo, limit, commitThreshold) {
  return `select domain
from (
         select domain, sum(commit_count) as total_commits
         from gits_domain_ts
         where owner = '${owner}'
           and repo = '${repo}'
         group by domain
         order by total_commits desc
         )
where total_commits > ${commitThreshold}
limit ${limit}`;
}

export function commitCountOfDomainByDate(owner, repo, domain, date) {
  const thatMonth = dateToYearMonthInt(date.toISOString());
  const nextMonth = dateToYearMonthInt(
    new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
    ).toISOString(),
  );
  return `select count() as commit_count
from gits
where search_key__owner = '${owner}'
  and search_key__repo = '${repo}'
  and splitByChar('@', author_email)[2] == '${domain}'
  and toYYYYMM(authored_date) >= ${thatMonth}
  and toYYYYMM(authored_date) < ${nextMonth}
  `;
}

export function domainCommitSeriesSql(owner, repo, domain) {
  return `select domain, date, commit_count as total_commits
from gits_domain_ts
where owner = '${owner}'
  and repo = '${repo}'
and domain='${domain}'
order by date asc`;
}

export function domainTotalCommitsDistSql(owner, repo, limit = 10) {
  return `select domain, sum(commit_count) as total_commits
from gits_domain_ts
where owner = '${owner}'
  and repo = '${repo}'
group by domain
order by total_commits desc
limit ${limit}`;
}
