import { dateToYearMonthInt } from '@/pages/ContribDistribution/DataProcessors';

export function secondaryDirSql(owner, repo) {
  return `
    select dir
  from gits_dir
  where search_key__owner = '${owner}'
    and search_key__repo = '${repo}'
  order by dir
    `;
}

export function alteredFileTZSql(owner, repo, dir) {
  return `
SELECT search_key__owner, search_key__repo, dir_level2, author_tz, COUNT() alter_file_count
FROM (
    SELECT search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    FROM gits
    ARRAY JOIN \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    WHERE dir_level2 = '${dir}'
        AND search_key__owner = '${owner}'
        AND search_key__repo = '${repo}'
)
GROUP BY search_key__owner, search_key__repo, dir_level2,author_tz
ORDER BY alter_file_count desc`;
}

export function alteredFileEmailDomainSql(owner, repo, dir) {
  return `
    select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    email_domain,
    COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        splitByChar('@',\`author_email\`)[2] as email_domain,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
)
group by search_key__owner, search_key__repo,
    dir_level2,email_domain ORDER by alter_file_count desc limit 20
    `;
}

export function alteredFileCountSql(owner, repo, dir) {
  return `
    SELECT search_key__owner,
       search_key__repo,
       dir_level2,
       COUNT() alter_file_count
FROM (
         SELECT search_key__owner,
                search_key__repo,
                author_email,
                author_tz,
                \`files.file_name\`,
                \`files.insertions\`,
                \`files.deletions\`,
                \`files.lines\`,
                splitByChar('/', \`files.file_name\`)                as dir_list,
                arrayStringConcat(arraySlice(dir_list, 1, 2), '/') as dir_level2
         FROM gits
             ARRAY JOIN \`files.file_name\`
            , \`files.insertions\`
            , \`files.deletions\`
            , \`files.lines\`
         WHERE dir_level2 = '${dir}'
           AND search_key__owner = '${owner}'
           AND search_key__repo = '${repo}'
         )
GROUP BY search_key__owner, search_key__repo, dir_level2
    `;
}

export function alteredFileCountByRegionSql(owner, repo, dir) {
  return `
  select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '北美' as area,
    COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12)
)
group by search_key__owner, search_key__repo,
    dir_level2

union all

select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '西欧' as area,
    COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (0,1,2)
)
group by search_key__owner, search_key__repo,
    dir_level2

union all

select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '东欧' as area,
    COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (3,4)
)
group by search_key__owner, search_key__repo,
    dir_level2

union all

select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '印度' as area,
    COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (5)
)
group by search_key__owner, search_key__repo,
    dir_level2

union all

select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '中国' as area,
    COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (8)
)
group by search_key__owner, search_key__repo,
    dir_level2

union all

select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '日韩' as area,
    COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (9)
)
group by search_key__owner, search_key__repo,
    dir_level2

union all

select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '澳洲' as area,
    COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (10)
)
group by search_key__owner, search_key__repo,
    dir_level2
`;
}

export function developerCountByRegionSql(owner, repo, dir) {
  return `
  select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '北美' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12)
)
group by search_key__owner, search_key__repo,
    dir_level2,author_email)
group by search_key__owner, search_key__repo,
    dir_level2,area

union all

select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '西欧' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (0,1,2)
)
group by search_key__owner, search_key__repo,
    dir_level2,author_email)
group by search_key__owner, search_key__repo,
    dir_level2,area

union all

select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '东欧' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (3,4)
)
group by search_key__owner, search_key__repo,
    dir_level2,author_email)
group by search_key__owner, search_key__repo,
    dir_level2,area

union all

select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '印度' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (5)
)
group by search_key__owner, search_key__repo,
    dir_level2,author_email)
group by search_key__owner, search_key__repo,
    dir_level2,area

union all

select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '中国' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (8)
)
group by search_key__owner, search_key__repo,
    dir_level2,author_email)
group by search_key__owner, search_key__repo,
    dir_level2,area

union all

select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '日韩' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (9)
)
group by search_key__owner, search_key__repo,
    dir_level2,author_email)
group by search_key__owner, search_key__repo,
    dir_level2,area

union all

select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    '澳洲' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email ,
        author_tz ,
        \`files.file_name\` ,
            \`files.insertions\`,
            \`files.deletions\`,
            \`files.lines\` ,
        splitByChar('/',\`files.file_name\`) as dir_list,
        arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
    from gits
    array join \`files.file_name\` ,
        \`files.insertions\`,
        \`files.deletions\`,
        \`files.lines\`
    where
        dir_level2 = '${dir}'
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (10)
)
group by search_key__owner, search_key__repo,
    dir_level2,author_email)
group by search_key__owner, search_key__repo,
    dir_level2,area
  `;
}

export function commitsRegionDistSql(
  owner,
  repo,
  since,
  until,
  commitMsgFilter,
  include,
  caseSensitive,
) {
  let dateRangeClause =
    since && until
      ? `and authored_date>'${since}'
    and authored_date<'${until}'`
      : '';

  let msgFilterClause = '';
  if (commitMsgFilter) {
    msgFilterClause = 'and ';

    if (caseSensitive) {
      msgFilterClause = `${msgFilterClause} message`;
    } else {
      msgFilterClause = `${msgFilterClause} lowerUTF8(message)`;
    }

    if (include) {
      msgFilterClause = `${msgFilterClause} like`;
    } else {
      msgFilterClause = `${msgFilterClause} not like`;
    }

    if (caseSensitive) {
      msgFilterClause = `${msgFilterClause} '%${commitMsgFilter}%'`;
    } else {
      msgFilterClause = `${msgFilterClause} '%${commitMsgFilter.toLowerCase()}%'`;
    }
  }

  return `
  select search_key__owner, search_key__repo,'北美' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12)
                                            ${dateRangeClause}
                                            ${msgFilterClause}
                                          group by search_key__owner, search_key__repo

union all
select search_key__owner, search_key__repo,'西欧' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (0,1,2)
                                            ${dateRangeClause}
                                            ${msgFilterClause}
                                          group by search_key__owner, search_key__repo

union all
select search_key__owner, search_key__repo,'东欧' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (3,4)
                                            ${dateRangeClause}
                                            ${msgFilterClause}
                                          group by search_key__owner, search_key__repo
union all
select search_key__owner, search_key__repo,'印度' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (5)
                                            ${dateRangeClause}
                                            ${msgFilterClause}
                                          group by search_key__owner, search_key__repo
union all
select search_key__owner, search_key__repo,'中国' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (8)
                                            ${dateRangeClause}
                                            ${msgFilterClause}
                                          group by search_key__owner, search_key__repo
union all
select search_key__owner, search_key__repo,'日韩' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (9)
                                            ${dateRangeClause}
                                            ${msgFilterClause}
                                          group by search_key__owner, search_key__repo
union all
select search_key__owner, search_key__repo,'澳洲' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (10)
                                            ${dateRangeClause}
                                            ${msgFilterClause}
                                          group by search_key__owner, search_key__repo`;
}

export function commitsRegionDissSql_ByProfile(
  owner,
  repo,
  since,
  until,
  commitMsgFilter,
  include,
  caseSensitive,
) {
  let gitsDateRangeClause =
    since && until
      ? `and authored_date>'${since}'
    and authored_date<'${until}'`
      : '';

  let githubCommitsDateRangeClause =
    since && until
      ? `and commit__author__date>'${since}'
    and commit__author__date<'${until}'`
      : '';

  let gitsMsgFilterClause = '';
  let githubCommitsMesgFilterClause = '';
  if (commitMsgFilter) {
    gitsMsgFilterClause = 'and ';
    githubCommitsMesgFilterClause = 'and ';

    if (caseSensitive) {
      gitsMsgFilterClause = `${gitsMsgFilterClause} message`;
      githubCommitsMesgFilterClause = `${githubCommitsMesgFilterClause} commit__message`;
    } else {
      gitsMsgFilterClause = `${gitsMsgFilterClause} lowerUTF8(message)`;
      githubCommitsMesgFilterClause = `${githubCommitsMesgFilterClause} lowerUTF8(commit__message)`;
    }

    if (include) {
      gitsMsgFilterClause = `${gitsMsgFilterClause} like`;
      githubCommitsMesgFilterClause = `${githubCommitsMesgFilterClause} like`;
    } else {
      gitsMsgFilterClause = `${gitsMsgFilterClause} not like`;
      githubCommitsMesgFilterClause = `${githubCommitsMesgFilterClause} not like`;
    }

    if (caseSensitive) {
      gitsMsgFilterClause = `${gitsMsgFilterClause} '%${commitMsgFilter}%'`;
      githubCommitsMesgFilterClause = `${githubCommitsMesgFilterClause} '%${commitMsgFilter}%'`;
    } else {
      gitsMsgFilterClause = `${gitsMsgFilterClause} '%${commitMsgFilter.toLowerCase()}%'`;
      githubCommitsMesgFilterClause = `${githubCommitsMesgFilterClause} '%${commitMsgFilter.toLowerCase()}%'`;
    }
  }

  return `
  select search_key__owner, search_key__repo, area, sum(commit_count) as total_commit_count
from (select search_key__owner, search_key__repo, '北美' as area, COUNT() commit_count
      from gits g
      where if_merged = 0
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12)
        ${gitsDateRangeClause}
        ${gitsMsgFilterClause}

      group by search_key__owner, search_key__repo

      union all
      select search_key__owner, search_key__repo, '西欧' as area, COUNT() commit_count
      from gits g
      where if_merged = 0
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (1, 2)
        ${gitsDateRangeClause}
        ${gitsMsgFilterClause}


      group by search_key__owner, search_key__repo

      union all
      select search_key__owner, search_key__repo, '东欧' as area, COUNT() commit_count
      from gits g
      where if_merged = 0
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (3, 4)
        ${gitsDateRangeClause}
        ${gitsMsgFilterClause}

      group by search_key__owner, search_key__repo
      union all
      select search_key__owner, search_key__repo, '印度' as area, COUNT() commit_count
      from gits g
      where if_merged = 0
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (5)
        ${gitsDateRangeClause}
        ${gitsMsgFilterClause}

      group by search_key__owner, search_key__repo
      union all
      select search_key__owner, search_key__repo, '中国' as area, COUNT() commit_count
      from gits g
      where if_merged = 0
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (8)
        ${gitsDateRangeClause}
        ${gitsMsgFilterClause}

      group by search_key__owner, search_key__repo
      union all
      select search_key__owner, search_key__repo, '日韩' as area, COUNT() commit_count
      from gits g
      where if_merged = 0
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (9)
        ${gitsDateRangeClause}
        ${gitsMsgFilterClause}

      group by search_key__owner, search_key__repo
      union all
      select search_key__owner, search_key__repo, '澳洲' as area, COUNT() commit_count
      from gits g
      where if_merged = 0
        and search_key__owner = '${owner}'
        and search_key__repo = '${repo}'
        and author_tz global in (10)
        ${gitsDateRangeClause}
        ${gitsMsgFilterClause}

      group by search_key__owner, search_key__repo

      union all

      select search_key__owner, search_key__repo, region as area, count() as commit_count
      from (select a.*, if(b.region = '', '西欧', region) as region
            from (select a.*, b.inferred_from_location__country
                  from (
                           select a.*, b.author__id
                           from (select search_key__owner, search_key__repo, author_email
                                 from gits g
                                 where if_merged = 0
                                   and search_key__owner = '${owner}'
                                   and search_key__repo = '${repo}'
                                   and author_tz = 0
                                   ${gitsDateRangeClause}
                                   ${gitsMsgFilterClause}
                                   ) a global
                                    left join (select distinct commit__author__email, author__id
                                               from github_commits
                                               where search_key__owner = '${owner}'
                                                 and search_key__repo = '${repo}'
                                                 and author__id != 0
                                                 ${githubCommitsDateRangeClause}
                                                 ${githubCommitsMesgFilterClause}
                                                 ) b
                                              on a.author_email = b.commit__author__email) a global
                           left join (select id, inferred_from_location__country
                                      from github_profile
                                      where inferred_from_location__country != ''
                                      group by id, inferred_from_location__country
                                      limit 1 by id) b on a.author__id = b.id) a global
                     left join (select * from location_region) b
                               on a.inferred_from_location__country = b.location
               )
      group by search_key__owner, search_key__repo, region)
group by search_key__owner, search_key__repo, area
order by total_commit_count desc
  `;
}

export function commitsEmailDomainDistSql(
  owner,
  repo,
  since,
  until,
  commitMsgFilter,
  include,
  caseSensitive,
) {
  let dateRangeClause =
    since && until
      ? `and authored_date>'${since}'
    and authored_date<'${until}'`
      : '';
  // let msgFilterClause = commitMsgFilter ? `and lowerUTF8(message) like '%${commitMsgFilter}%'` : '';
  let msgFilterClause = '';
  if (commitMsgFilter) {
    msgFilterClause = 'and ';

    if (caseSensitive) {
      msgFilterClause = `${msgFilterClause} message`;
    } else {
      msgFilterClause = `${msgFilterClause} lowerUTF8(message)`;
    }

    if (include) {
      msgFilterClause = `${msgFilterClause} like`;
    } else {
      msgFilterClause = `${msgFilterClause} not like`;
    }

    if (caseSensitive) {
      msgFilterClause = `${msgFilterClause} '%${commitMsgFilter}%'`;
    } else {
      msgFilterClause = `${msgFilterClause} '%${commitMsgFilter.toLowerCase()}%'`;
    }
  }
  return `
  select search_key__owner ,search_key__repo,
    \t\tsplitByChar('@',\`author_email\`)[2] as email_domain,
    \t\tCOUNT() as commit_count
    from gits
    where
    if_merged=0
    and search_key__owner = '${owner}'
    and search_key__repo = '${repo}'
    and author_email != ''
    and email_domain != ''
    ${dateRangeClause}
    ${msgFilterClause}

    group by
    \t\tsearch_key__owner ,
    \t\tsearch_key__repo ,
    \t\temail_domain
    ORDER by commit_count desc`;
}

// 给定（owner，repo，二级目录），按照区域划分的commits修改文件数量
export function alteredFileCountRegionDistInSecondaryDirSql(
  owner,
  repo,
  dir,
  since,
  until,
  commitMsgFilter,
) {
  // For the cached table, date is converted to Int type(like 2022-05(str) => 202205(int)) for better
  // performance and skip ClickHouse's constraint on date length(date with format YYYY-MM won't work, it
  // requires YYYY-MM-DD at least)
  // So here the date string is converted to int to take the advantage of cache table's optimization
  // This trick is also applied to these functions:
  // - developerCountRegionDistInSecondaryDirSql
  // - alteredFileCountDomainDistInSecondaryDirSql
  // - developerCountDomainDistInSecondaryDirSql

  // TODO Should we use <= and >= instead of < and > ?
  let dateRangeClause =
    since && until
      ? `and authored_date>${dateToYearMonthInt(since)}
    and authored_date<${dateToYearMonthInt(until)}`
      : '';
  let msgFilterClause = commitMsgFilter ? `and lowerUTF8(message) like '%${commitMsgFilter}%'` : '';

  return `
  select sum(alter_file_count) as count, area from gits_alter_file_times
where search_key__owner='${owner}'
and search_key__repo='${repo}'
and in_dir='${dir}/'
${dateRangeClause}
group by area
order by count desc
  `;
  //   return `
  //   select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '北美' as area,
  //     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2
  //
  // union all
  //
  // select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '西欧' as area,
  //     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (0,1,2)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2
  //
  // union all
  //
  // select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '东欧' as area,
  //     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (3,4)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2
  //
  // union all
  //
  // select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '印度' as area,
  //     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (5)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2
  //
  // union all
  //
  // select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '中国' as area,
  //     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (8)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2
  //
  // union all
  //
  // select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '日韩' as area,
  //     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (9)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2
  //
  // union all
  //
  // select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '澳洲' as area,
  //     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (10)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2
  //
  //   `;
}

// 给定（owner，repo，二级目录），按照区域划分的开发者数量
export function developerCountRegionDistInSecondaryDirSql(
  owner,
  repo,
  dir,
  since,
  until,
  commitMsgFilter,
) {
  let dateRangeClause =
    since && until
      ? `and toYYYYMM(authored_date)>${dateToYearMonthInt(since)}
    and toYYYYMM(authored_date)<${dateToYearMonthInt(until)}`
      : '';
  let msgFilterClause = commitMsgFilter ? `and lowerUTF8(message) like '%${commitMsgFilter}%'` : '';

  // TODO Replace it with malin's new SQL
  return `
select * from (
select search_key__owner,search_key__repo,in_dir,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    in_dir ,
    '北美' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email,

        in_dir
    from gits_dir_label
    where
author_tz global in (-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12)
and search_key__owner = '${owner}'
and search_key__repo = '${repo}'
and in_dir = '${dir}/'
${dateRangeClause}
)
group by search_key__owner, search_key__repo,
    in_dir,author_email)
group by search_key__owner, search_key__repo,
    in_dir,area

union all

select search_key__owner,search_key__repo,in_dir,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    in_dir ,
    '西欧' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email,
        in_dir
    from gits_dir_label
    where
         author_tz global in (0,1,2)
    and search_key__owner = '${owner}'
and search_key__repo = '${repo}'
and in_dir = '${dir}/'
${dateRangeClause}
)
group by search_key__owner, search_key__repo,
    in_dir,author_email)
group by search_key__owner, search_key__repo,
    in_dir,area

union all

select search_key__owner,search_key__repo,in_dir,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    in_dir ,
    '东欧' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email,
        in_dir
    from gits_dir_label
    where
         author_tz global in (3,4)
    and search_key__owner = '${owner}'
and search_key__repo = '${repo}'
and in_dir = '${dir}/'
${dateRangeClause}
)
group by search_key__owner, search_key__repo,
    in_dir,author_email)
group by search_key__owner, search_key__repo,
    in_dir,area

union all

select search_key__owner,search_key__repo,in_dir,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    in_dir ,
    '印度' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email,
        in_dir
    from gits_dir_label
    where author_tz global in (5)
    and search_key__owner = '${owner}'
and search_key__repo = '${repo}'
and in_dir = '${dir}/'
${dateRangeClause}
)
group by search_key__owner, search_key__repo,
    in_dir,author_email)
group by search_key__owner, search_key__repo,
    in_dir,area

union all

select search_key__owner,search_key__repo,in_dir,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    in_dir ,
    '中国' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email,
        in_dir
    from gits_dir_label
    where author_tz global in (8)
    and search_key__owner = '${owner}'
and search_key__repo = '${repo}'
and in_dir = '${dir}/'
${dateRangeClause}
)
group by search_key__owner, search_key__repo,
    in_dir,author_email)
group by search_key__owner, search_key__repo,
    in_dir,area

union all

select search_key__owner,search_key__repo,in_dir,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    in_dir ,
    '日韩' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email,
        in_dir
    from gits_dir_label
    where author_tz global in (9)
    and search_key__owner = '${owner}'
and search_key__repo = '${repo}'
and in_dir = '${dir}/'
${dateRangeClause}
)
group by search_key__owner, search_key__repo,
    in_dir,author_email)
group by search_key__owner, search_key__repo,
    in_dir,area

union all

select search_key__owner,search_key__repo,in_dir,area,count() as contributor_count from (select search_key__owner ,
    search_key__repo ,
    in_dir ,
    '澳洲' as area,
    author_email
--     COUNT() alter_file_count
from (
    select search_key__owner,
        search_key__repo,
        author_email,
        in_dir
    from gits_dir_label
    where author_tz global in (10)
    and search_key__owner = '${owner}'
and search_key__repo = '${repo}'
and in_dir = '${dir}/'
${dateRangeClause}
)
group by search_key__owner, search_key__repo,
    in_dir,author_email)
group by search_key__owner, search_key__repo,
    in_dir,area
) order by contributor_count desc
    `;

  //   return `
  //   select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '北美' as area,
  //     author_email
  // --     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2,author_email)
  // group by search_key__owner, search_key__repo,
  //     dir_level2,area
  //
  // union all
  //
  // select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '西欧' as area,
  //     author_email
  // --     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (0,1,2)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2,author_email)
  // group by search_key__owner, search_key__repo,
  //     dir_level2,area
  //
  // union all
  //
  // select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '东欧' as area,
  //     author_email
  // --     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (3,4)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2,author_email)
  // group by search_key__owner, search_key__repo,
  //     dir_level2,area
  //
  // union all
  //
  // select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '印度' as area,
  //     author_email
  // --     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (5)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2,author_email)
  // group by search_key__owner, search_key__repo,
  //     dir_level2,area
  //
  // union all
  //
  // select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '中国' as area,
  //     author_email
  // --     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (8)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2,author_email)
  // group by search_key__owner, search_key__repo,
  //     dir_level2,area
  //
  // union all
  //
  // select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '日韩' as area,
  //     author_email
  // --     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (9)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2,author_email)
  // group by search_key__owner, search_key__repo,
  //     dir_level2,area
  //
  // union all
  //
  // select search_key__owner,search_key__repo,dir_level2,area,count() as contributor_count from (select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     '澳洲' as area,
  //     author_email
  // --     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email ,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where
  //         dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         and author_tz global in (10)
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2,author_email)
  // group by search_key__owner, search_key__repo,
  //     dir_level2,area`;OK
}

// 给定（owner，repo，二级目录），按照email domain划分的commits修改文件数量
export function alteredFileCountDomainDistInSecondaryDirSql(
  owner,
  repo,
  dir,
  since,
  until,
  commitMsgFilter,
) {
  let dateRangeClause =
    since && until
      ? `and authored_date>${dateToYearMonthInt(since)}
    and authored_date<${dateToYearMonthInt(until)}`
      : '';
  let msgFilterClause = commitMsgFilter ? `and lowerUTF8(message) like '%${commitMsgFilter}%'` : '';
  return `
  select sum(alter_file_count) as count, email_domain from gits_dir_email_domain_alter_file_count
where search_key__owner='${owner}'
and search_key__repo='${repo}'
and in_dir='${dir}/'
${dateRangeClause}
group by email_domain
order by count desc
  `;

  //   return `
  //   select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     email_domain,
  //     COUNT() alter_file_count
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         splitByChar('@',\`author_email\`)[2] as email_domain,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2,email_domain ORDER by alter_file_count desc limit 20`;
}

// 给定（owner，repo，二级目录），按照email domain划分的开发者数量
export function developerCountDomainDistInSecondaryDirSql(
  owner,
  repo,
  dir,
  since,
  until,
  commitMsgFilter,
) {
  let dateRangeClause =
    since && until
      ? `and toYYYYMM(authored_date)>${dateToYearMonthInt(since)}
    and toYYYYMM(authored_date)<${dateToYearMonthInt(until)}`
      : '';
  let msgFilterClause = commitMsgFilter ? `and lowerUTF8(message) like '%${commitMsgFilter}%'` : '';
  // TODO Replace it with malin's new SQL
  return `
select search_key__owner, search_key__repo,
    in_dir,email_domain,count() contributor_count from (
    select search_key__owner,search_key__repo,email,email_domain,in_dir from
    (select search_key__owner,
        search_key__repo,

        if(author_email='',
            if(author_name like '%@%',author_name,'empty_email'),
            author_email) as email,
        multiIf(author_email='',
            if(author_name like '%@%',
                splitByChar('@',\`author_name\`)[2],'empty_domain'),
            author_email like '%@%',
            splitByChar('@',\`author_email\`)[2],
            author_email like '%\%%',
            splitByChar('%',\`author_email\`)[2],
            author_email) as email_domain,
        in_dir
    from gits_dir_label where search_key__owner = '${owner}'
and search_key__repo = '${repo}'
and in_dir = '${dir}/'
${dateRangeClause}
)
    group by search_key__owner,search_key__repo,email,email_domain,in_dir

)
group by search_key__owner, search_key__repo,
    in_dir,email_domain
order by contributor_count desc
  `;

  //   return `
  //   select search_key__owner, search_key__repo,
  //     dir_level2,email_domain,count() contributor_count from (select search_key__owner ,
  //     search_key__repo ,
  //     dir_level2 ,
  //     email_domain,
  //     author_email
  // from (
  //     select search_key__owner,
  //         search_key__repo,
  //         author_email,
  //         splitByChar('@',\`author_email\`)[2] as email_domain,
  //         author_tz ,
  //         \`files.file_name\` ,
  //             \`files.insertions\`,
  //             \`files.deletions\`,
  //             \`files.lines\` ,
  //         splitByChar('/',\`files.file_name\`) as dir_list,
  //         arrayStringConcat(arraySlice(dir_list, 1,2),'/') as dir_level2
  //     from gits
  //     array join \`files.file_name\` ,
  //         \`files.insertions\`,
  //         \`files.deletions\`,
  //         \`files.lines\`
  //     where dir_level2 = '${dir}'
  //         and search_key__owner = '${owner}'
  //         and search_key__repo = '${repo}'
  //         ${dateRangeClause}
  //         ${msgFilterClause}
  // )
  // group by search_key__owner, search_key__repo,
  //     dir_level2,email_domain,author_email)
  // group by search_key__owner, search_key__repo,
  //     dir_level2,email_domain
  // order by contributor_count desc`;
}

// 给定（owner，repo，二级目录），给出该二级目录中，开发者email，提交量，个人提交时区数量
export function developersContribInSecondaryDirSql(
  owner,
  repo,
  dir,
  since,
  until,
  commitMsgFilter,
) {
  let dateRangeClause =
    since && until
      ? `and authored_date>'${since}'
    and authored_date<'${until}'`
      : '';
  let msgFilterClause = commitMsgFilter ? `and lowerUTF8(message) like '%${commitMsgFilter}%'` : '';

  return `
  select in_dir, author_email, alter_files_count, tz_distribution
from gits_dir_contributor_tz_distribution
where search_key__owner = '${owner}'
  and search_key__repo == '${repo}'
  and in_dir == '${dir}/'
  order by alter_files_count desc
  `;

  return `
  select search_key__owner,search_key__repo,author_email,sum(alter_files_count) alter_files_count,groupArray(a) as tz_distribution
from (select search_key__owner,
             search_key__repo,
             author_email,
             alter_files_count,
             map(author_tz, alter_files_count) as a
      from (select search_key__owner, search_key__repo, author_email, author_tz, count() alter_files_count
            from (select search_key__owner,
                         search_key__repo,
                         author_email,
                         author_tz,
                         \`files.file_name\`,
                         \`files.insertions\`,
                         \`files.deletions\`,
                         \`files.lines\`,
                         splitByChar('/', \`files.file_name\`)                as dir_list,
                         arrayStringConcat(arraySlice(dir_list, 1, 2), '/') as dir_level2
                  from gits
                      array join \`files.file_name\`
                     , \`files.insertions\`
                     , \`files.deletions\`
                     , \`files.lines\`
                  where dir_level2 GLOBAL in ('${dir}')
                    and search_key__owner = '${owner}'
                    and search_key__repo = '${repo}'
                    and author_email != ''
                    ${dateRangeClause}
                    ${msgFilterClause}
                    )

            group by search_key__owner, search_key__repo, author_email, author_tz
            order by alter_files_count desc))
group by search_key__owner,search_key__repo,author_email
order by alter_files_count desc
`;
}

// 给定email，查找该开发者的GitHub Profile
export function developerGitHubProfileSql(email) {
  return `
   select *
 from github_profile
 where id != 0
   and id = (select distinct author__id
             from github_commits
             where commit__author__email = '${email}'
               and author__id != 0)
order by search_key__updated_at desc limit 1`;
}

export function developerActivitySql(owner, repo, githubLogin) {
  return `
SELECT  * from activities_mapped
WHERE owner='${owner}'
AND repo='${repo}'
AND github_login='${githubLogin}'`;
}

// 给定（owner，repo，email），给出该开发者在项目中的代码提交时区分布
export function developerContribInRepoSql(owner, repo, email) {
  return `
select search_key__owner,search_key__repo,author_email,groupArray(tz_distribution) from (select search_key__owner,
       search_key__repo,
       author_email,
       author_tz,
       count() as counts,
        map(author_tz,counts) as tz_distribution
       from(
           select search_key__owner,
               search_key__repo,
               author_email,
               author_tz
           from gits
           where search_key__owner = '${owner}'
              and search_key__repo = '${repo}'
              and author_email = '${email}'
           )
group by search_key__owner,
         search_key__repo,
         author_email,
         author_tz order by counts desc)
group by search_key__owner,search_key__repo,author_email`;
}

export function criticalityScoresSql(owner, repo) {
  return `
 select time_point,
       created_since,
       updated_since,
       contributor_count,
       org_count,
       commit_frequency,
       recent_releases_count,
       updated_issues_count,
       closed_issues_count,
       comment_frequency,
       dependents_count,
       contributor_lookback_days,
       criticality_score
from criticality_score
where owner='${owner}'
  and repo='${repo}'
order by time_point
  `;
}

const REGION_TZ_MAP = {
  NORTH_AMERICA: [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12],
  WEST_EUROPE: [0, 1, 2],
  EAST_EUROPE: [3, 4],
  INDIA: [5],
  CHINA: [8],
  JP_KR: [9],
  AUSTRALIA: [10],
};

export function ownerRepoDirRegionFileTzDistSql(owner, repo, dir, region, since, until) {
  const tzs = REGION_TZ_MAP[region]; // Array in `${var}` will be translated to var.join(',')
  const dateRangeClause =
    since && until
      ? `and toYYYYMM(authored_date) > ${dateToYearMonthInt(since)}
         and toYYYYMM(authored_date) < ${dateToYearMonthInt(until)}`
      : '';
  return `
  with '${owner}' as OWNER,
     '${repo}' as REPO,
     '${dir}/' as DIR,
     (${tzs}) as TZ
select author_tz,
       count() as alter_file_count
from gits_dir_label where
                        search_key__owner = OWNER
                        and search_key__repo = REPO
                        and in_dir = DIR
                        and author_tz global in TZ
                        ${dateRangeClause}
group by author_tz order by alter_file_count desc`;
}

export function ownerRepoDirRegionDeveloperTzDistSql(owner, repo, dir, region, since, until) {
  const tzs = REGION_TZ_MAP[region];
  const dateRangeClause =
    since && until
      ? `and toYYYYMM(authored_date) > ${dateToYearMonthInt(since)}
         and toYYYYMM(authored_date) < ${dateToYearMonthInt(until)}`
      : '';
  return `
  with '${owner}' as OWNER,
     '${repo}' as REPO,
     '${dir}/' as DIR,
     (${tzs}) as TZ
select author_tz,count() as contributor_count from (select author_tz,author_email
from gits_dir_label where
                        search_key__owner = OWNER
                        and search_key__repo = REPO
                        and in_dir = DIR
                        and author_tz global in TZ
                        ${dateRangeClause}
group by author_tz,author_email) group by author_tz order by contributor_count desc`;
}

export function ownerRepoDirDomainFileTzDistSql(owner, repo, dir, domain, since, until) {
  const dateRangeClause =
    since && until
      ? `and toYYYYMM(authored_date) > ${dateToYearMonthInt(since)}
         and toYYYYMM(authored_date) < ${dateToYearMonthInt(until)}`
      : '';
  return `
  with '${owner}' as OWNER,
     '${repo}' as REPO,
     '${dir}/' as DIR,
     '${domain}' as EMAIL_DOMAIN
select author_tz,count() as alter_file_count from (select author_email,author_tz,
       multiIf(author_email='',
               if(author_name like '%@%',
               splitByChar('@',\`author_name\`)[2],'empty_domain'),
               author_email like '%@%',
               splitByChar('@',\`author_email\`)[2],
               author_email like '%\\%%',
               splitByChar('%',\`author_email\`)[2],
               author_email) as email_domain
from gits_dir_label
where
                        search_key__owner = OWNER
                        and search_key__repo = REPO
                        and in_dir = DIR
                        and email_domain=EMAIL_DOMAIN
                        ${dateRangeClause}
                        )
group by author_tz order by alter_file_count desc`;
}

export function ownerRepoDirDomainDeveloperTzDistSql(owner, repo, dir, domain, since, until) {
  const dateRangeClause =
    since && until
      ? `and toYYYYMM(authored_date) > ${dateToYearMonthInt(since)}
         and toYYYYMM(authored_date) < ${dateToYearMonthInt(until)}`
      : '';
  return `
with '${owner}' as OWNER,
     '${repo}' as REPO,
     '${dir}/' as DIR,
     '${domain}' as EMAIL_DOMAIN
select author_tz,count() as contributor_count  from (select author_tz,author_email from (select author_email,author_tz,
       multiIf(author_email='',
               if(author_name like '%@%',
               splitByChar('@',\`author_name\`)[2],'empty_domain'),
               author_email like '%@%',
               splitByChar('@',\`author_email\`)[2],
               author_email like '%\%%',
               splitByChar('%',\`author_email\`)[2],
               author_email) as email_domain
from gits_dir_label
where
                        search_key__owner = OWNER
                        and search_key__repo = REPO
                        and in_dir = DIR
                        and email_domain=EMAIL_DOMAIN
                        ${dateRangeClause}
                        )
group by author_tz,author_email) group by author_tz order by contributor_count desc`;
}
