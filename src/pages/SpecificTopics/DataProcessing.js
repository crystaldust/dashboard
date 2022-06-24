import { runSql } from '@/services/clickhouse';
import {
  authorCountOfMonthSql,
  commitCountOfDomainByDate,
  commitCountOfMonthSql,
  domainCommitSeriesSql,
  domainTotalCommitsDistSql,
  emailCommitSeriesSql,
  firstCommitDateSql,
  topDomainsSql,
  topEmailsSql,
} from '@/pages/SpecificTopics/DataSQLs';

const OWNER_REPO_DATES = {};

function getAuthorAndCommitCountsByDates(owner, repo, dates) {
  const authorCountPromises = [];
  const commitCountPromises = [];
  const authorCommitData = [];

  dates.forEach((date) => {
    commitCountPromises.push(runSql(commitCountOfMonthSql(owner, repo, date)));
    authorCountPromises.push(runSql(authorCountOfMonthSql(owner, repo, date)));
  });

  const allAuthorCountsPromise = Promise.all(authorCountPromises).then((result) => {
    return result.map((item) => {
      return item.data[0][0];
    });
  });

  const allCommitCountPromise = Promise.all(commitCountPromises).then((result) => {
    return result.map((item) => {
      return item.data[0][0];
    });
  });

  return Promise.all([allAuthorCountsPromise, allCommitCountPromise]).then((values) => {
    const authorCounts = values[0];
    const commitCounts = values[1];
    dates.forEach((date, index) => {
      const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const numAuthors = authorCounts[index];
      const numCommits = commitCounts[index];

      authorCommitData.push({ date: dateStr, category: 'authorCount', value: numAuthors });
      authorCommitData.push({ date: dateStr, category: 'commitCount', value: numCommits });
    });
    return authorCommitData;
  });
}

function getDates(owner, repo) {
  return runSql(firstCommitDateSql(owner, repo)).then((result) => {
    const firstCommitDate = new Date(result.data[0]);
    const now = new Date();
    // Tips: JavaScript Date instance's month start from 0
    // If hours is not specified, then day parameter might not be expected
    let iterDate = new Date(
      firstCommitDate.getFullYear(),
      firstCommitDate.getMonth(),
      firstCommitDate.getDate(),
      firstCommitDate.getHours(),
    );
    let nextMonth = null;
    const dates = [];
    while (iterDate < now) {
      nextMonth = new Date(
        iterDate.getFullYear(),
        iterDate.getMonth() + 1,
        iterDate.getDate(),
        iterDate.getHours(),
      );
      dates.push(iterDate);
      iterDate = nextMonth;
    }
    OWNER_REPO_DATES[`${owner}_${repo}`] = dates;
    return dates;
  });
}

function getTopDomains(owner, repo, limit = 10, commitThreshold = 100) {
  return runSql(topDomainsSql(owner, repo, limit, commitThreshold)).then((result) => {
    return result.data.map((item) => {
      return item[0];
    });
  });
}

function getTopEmails(owner, repo, limit = 10, commitThreshold = null) {
  return runSql(topEmailsSql(owner, repo, limit, commitThreshold)).then((result) => {
    return result.data.map((item) => {
      return item[0];
    });
  });
}

export function getAuthorAndCommitCount(owner, repo) {
  let dates = [];
  if (OWNER_REPO_DATES.hasOwnProperty(`${owner}_${repo}`)) {
    dates = OWNER_REPO_DATES[`${owner}_${repo}`];
    return getAuthorAndCommitCountsByDates(owner, repo, dates);
  }

  return getDates(owner, repo).then((dates) => {
    return getAuthorAndCommitCountsByDates(owner, repo, dates);
  });
}

function _getDomainsSeries(owner, repo, dates) {
  const allDomainSeries = [];
  return getTopDomains(owner, repo, 10, 100).then((topDomains) => {
    const domainPromises = [];
    topDomains.forEach((domain) => {
      domainPromises.push(
        _getDomainSeries(owner, repo, domain, dates).then((result) => {
          return [domain, result];
        }),
      );
    });
    return Promise.all(domainPromises).then((results) => {
      results.forEach((result) => {
        const domain = result[0];
        const domainSeries = result[1];
        dates.forEach((date, index) => {
          const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}`;
          allDomainSeries.push({
            date: dateStr,
            category: domain,
            value: domainSeries[index],
          });
        });
      });
      return allDomainSeries;
    });
  });
}

function _getDomainSeries(owner, repo, domain) {
  const allPromises = [];
  dates.forEach((date) => {
    allPromises.push(runSql(commitCountOfDomainByDate(owner, repo, domain, date)));
  });
  return Promise.all(allPromises).then((results) => {
    const datas = results.map((result) => {
      return result.data[0][0];
    });

    return datas;
  });
}

export function getDomainSeries(owner, repo) {
  return getTopDomains(owner, repo, 10, 100).then((topDomains) => {
    const domainPromises = [];
    topDomains.forEach((domain) => {
      domainPromises.push(runSql(domainCommitSeriesSql(owner, repo, domain)));
    });

    return Promise.all(domainPromises).then((results) => {
      const allDomainSeries = [];
      results.forEach((result) => {
        result.data.forEach((item) => {
          allDomainSeries.push({
            category: item[0],
            date: item[1],
            value: item[2],
          });
        });
      });
      return allDomainSeries;
    });
  });
}

export function getDomainCommitsDist(owner, repo) {
  return runSql(domainTotalCommitsDistSql(owner, repo, 10)).then((result) => {
    return result.data.map((item) => {
      return { domain: item[0], totalCommitCount: item[1] };
    });
  });
}

export function getEmailSeries(owner, repo) {
  return getTopEmails(owner, repo, 10).then((topEamils) => {
    const emailPromises = [];
    topEamils.forEach((email) => {
      emailPromises.push(runSql(emailCommitSeriesSql(owner, repo, email)));
    });

    return Promise.all(emailPromises).then((results) => {
      const allEmailSeries = [];
      results.forEach((result) => {
        result.data.forEach((item) => {
          allEmailSeries.push({
            category: item[0],
            date: item[1],
            value: item[2],
          });
        });
      });
      return allEmailSeries;
    });
  });
}

export function getRegionSeries(owner, repo) {
  return runSql('SELECT region, date, commit_count FROM gits_region_commits_ts ORDER BY date').then(
    (result) => {
      return result.data.map((item) => {
        return {
          category: item[0],
          date: item[1],
          value: item[2],
        };
      });
    },
  );
}
