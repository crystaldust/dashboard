import { runSql } from '@/services/clickhouse';
import {
  authorCountOfMonthSql,
  commitCountOfDomainByDate,
  commitCountOfMonthSql,
  domainAuthorsDistSql,
  domainAuthorsSeriesSql,
  domainCommitSeriesSql,
  domainTotalCommitsDistSql,
  emailCommitSeriesSql,
  firstCommitDateSql,
  topDomainsByAuthorsSql,
  topDomainsByCommitsSql,
  topEmailsSql,
} from '@/pages/SpecificTopics/DataSQLs';
import { dateToYearMonthInt } from '@/pages/ContribDistribution/DataProcessors';

const OWNER_REPO_DATES = {};

function getAuthorAndCommitCountSeries(owner, repo) {
  return runSql(
    `SELECT date, commit_count, author_count FROM gits_author_series WHERE owner='${owner}' AND repo='${repo}' ORDER BY date`,
  ).then((result) => {
    const allData = {
      author: {},
      commit: {},
    };
    result.data.forEach((item) => {
      const date = item[0];
      const commitCount = item[1];
      const authorCount = item[2];
      allData.author[date] = {
        category: 'author',
        date,
        value: authorCount,
      };
      allData.commit[date] = {
        category: 'commit',
        date,
        value: commitCount,
      };
    });
    return allData;
  });
}

function getTopDomainsByCommits(owner, repo, limit = 10, commitThreshold = 100) {
  return runSql(topDomainsByCommitsSql(owner, repo, limit, commitThreshold)).then((result) => {
    return result.data.map((item) => {
      return item[0];
    });
  });
}

function getTopDomainsByAuthors(owner, repo, limit = 10) {
  return runSql(topDomainsByAuthorsSql(owner, repo, limit)).then((result) => {
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

export function getAuthorAndCommitCount(owner, repo, startDate, endDate) {
  return getAuthorAndCommitCountSeries(owner, repo).then((dataMaps) => {
    const madeupMaps = {
      author: makeupMissingDates(startDate, dataMaps.author, endDate, ['author']),
      commit: makeupMissingDates(startDate, dataMaps.commit, endDate, ['commit']),
    };

    return madeupMaps.author.concat(madeupMaps.commit);
  });
}

function _getDomainsSeries(owner, repo, dates) {
  const allDomainSeries = [];
  return getTopDomainsByCommits(owner, repo, 10, 100).then((topDomains) => {
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

export function getDomainCommitsSeries(owner, repo, startDate, endDate) {
  return getTopDomainsByCommits(owner, repo, 10, 100).then((topDomains) => {
    const domainPromises = [];
    topDomains.forEach((domain) => {
      domainPromises.push(runSql(domainCommitSeriesSql(owner, repo, domain)));
    });

    return Promise.all(domainPromises).then((results) => {
      let allDomainSeries = [];

      results.forEach((result) => {
        // result is a single domain's data array
        const domainDataMap = {};
        const category = result.data[0][0];
        result.data.forEach((item) => {
          const category = item[0];
          const date = item[1];
          const value = item[2];
          domainDataMap[date] = {
            category,
            date,
            value,
          };
        });
        console.log('data to made up:', Object.keys(domainDataMap).length);
        allDomainSeries = allDomainSeries.concat(
          makeupMissingDates(startDate, domainDataMap, endDate, [category]),
        );
      });
      return allDomainSeries;
    });
  });
}

export function getDomainAuthorsSeries(owner, repo) {
  return getTopDomainsByAuthors(owner, repo, 10, 100).then((topDomains) => {
    const domainPromises = [];
    topDomains.forEach((domain) => {
      domainPromises.push(runSql(domainAuthorsSeriesSql(owner, repo, domain)));
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

export function getDomainAuthorsDist(owner, repo) {
  return runSql(domainAuthorsDistSql(owner, repo, 10)).then((result) => {
    return result.data.map((item) => {
      return { domain: item[0], authorCount: item[1] };
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

export function getRegionCommitsSeries(owner, repo) {
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

export function getRegionAuthorsSeries(owner, repo) {
  return runSql('SELECT region, date, count FROM gits_region_authors_ts ORDER BY date').then(
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

export function getIssuesSeries(owner, repo) {
  const createdIssuesPromise = runSql(
    `SELECT date, count FROM created_issues_ts WHERE owner='${owner}' AND repo='${repo}' ORDER BY date `,
  );
  const closedIssuesPromise = runSql(
    `SELECT date, count FROM closed_issues_ts WHERE owner='${owner}' AND repo='${repo}' ORDER BY date `,
  );

  return Promise.all([createdIssuesPromise, closedIssuesPromise]).then((results) => {
    const createdIssuesResult = results[0];
    const closedIssuesResult = results[1];
    const allIssuesSeries = [];
    for (let i in createdIssuesResult.data) {
      const createdIssue = createdIssuesResult.data[i];
      const closedIssue = closedIssuesResult.data[i];

      allIssuesSeries.push({
        category: 'created_issue',
        date: createdIssue[0],
        value: createdIssue[1],
      });
      allIssuesSeries.push({
        category: 'closed_issue',
        date: closedIssue[0],
        value: closedIssue[1],
      });
    }

    return allIssuesSeries;
  });
}

export function getPullRequestsSeries(owner, repo) {
  const createdPullRequestsPromise = runSql(
    `SELECT date, count FROM created_pull_requests_ts ORDER BY date`,
  );
  const closedPullRequestsPromise = runSql(
    `SELECT date, count FROM closed_pull_requests_ts ORDER BY date`,
  );

  return Promise.all([createdPullRequestsPromise, closedPullRequestsPromise]).then((results) => {
    const createdPRsResult = results[0];
    const closedPRsResult = results[1];
    const allPRsSeries = [];
    for (let i in createdPRsResult.data) {
      const createdPR = createdPRsResult.data[i];
      const closedPR = closedPRsResult.data[i];

      allPRsSeries.push({
        category: 'created_prs',
        date: createdPR[0],
        value: createdPR[1],
      });
      allPRsSeries.push({
        category: 'closed_prs',
        date: closedPR[0],
        value: closedPR[1],
      });
    }

    return allPRsSeries;
  });
}

export function getDirSeries(owner, repo, dir) {
  return runSql(
    `SELECT owner, repo, dir, date, author_count, committer_count, alter_files_count
FROM dir_counts_ts
WHERE owner='${owner}'
 and repo='${repo}'
 and dir='${dir}'
 order by date`,
  );
}

// The function makes up the missing month's data by inserting an empty data item
// Only support a single categorized data array, that is, all the 'category' field in the
// data array's element should be exactly the same.
export function makeupMissingDates(startDate, dataMap, endDate, categories = []) {
  const madeUpArray = [];
  let iterDate = new Date(startDate.getFullYear(), startDate.getMonth());

  function fillEmptyDateItem(dateInt) {
    categories.forEach((category) => {
      madeUpArray.push({
        category,
        date: dateInt,
        value: 0,
      });
    });
  }

  while (iterDate < endDate) {
    const iterDateInt = dateToYearMonthInt(iterDate.toISOString());
    if (dataMap.hasOwnProperty(iterDateInt)) {
      madeUpArray.push(dataMap[iterDateInt]);
    } else {
      fillEmptyDateItem(iterDateInt);
    }
    iterDate = new Date(iterDate.getFullYear(), iterDate.getMonth() + 1);
  }
  return madeUpArray;
}

export function getFirstCommitDate(owner, repo) {
  return runSql(firstCommitDateSql(owner, repo)).then((result) => {
    return new Date(result.data[0]);
  });
}
