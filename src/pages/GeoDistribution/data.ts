export function secondaryDirSql(owner, repo) {
  return `
      SELECT search_key__owner,search_key__repo, dir_level2
      FROM (
          SELECT search_key__owner,
              search_key__repo,
              splitByChar('/', \`files.file_name\`)                as dir_list,
              arrayStringConcat(arraySlice(dir_list, 1, 2), '/') as dir_level2
           FROM gits
               array join \`files.file_name\`
              , \`files.insertions\`
              , \`files.deletions\`
              , \`files.lines\`
           WHERE if_merged = 0
             AND files.file_name not like '%=>%'
             AND length(dir_list) >= 3
             AND search_key__owner = '${owner}'
             AND search_key__repo = '${repo}'

      )
      GROUP BY search_key__owner, search_key__repo, dir_level2
      ORDER BY dir_level2
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
    '欧洲西部' as area,
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
    '欧洲东部' as area,
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
    '欧洲西部' as area,
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
    '欧洲东部' as area,
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

export function commitsRegionDistSql(owner, repo) {
  return `
  select search_key__owner, search_key__repo,'北美' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12)
                                          group by search_key__owner, search_key__repo

union all
select search_key__owner, search_key__repo,'欧洲西部' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (0,1,2)
                                          group by search_key__owner, search_key__repo

union all
select search_key__owner, search_key__repo,'欧洲东部' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (3,4)
                                          group by search_key__owner, search_key__repo
union all
select search_key__owner, search_key__repo,'印度' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (5)
                                          group by search_key__owner, search_key__repo
union all
select search_key__owner, search_key__repo,'中国' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (8)
                                          group by search_key__owner, search_key__repo
union all
select search_key__owner, search_key__repo,'日韩' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (9)
                                          group by search_key__owner, search_key__repo
union all
select search_key__owner, search_key__repo,'澳洲' as area, COUNT() commit_count
                                          from gits g
                                          where if_merged = 0
                                            and search_key__owner = '${owner}'
                                            and search_key__repo = '${repo}'
                                            and author_tz global in (10)
                                          group by search_key__owner, search_key__repo`;
}

export function commitsEmailDomainDistSql(owner, repo) {
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

    group by
    \t\tsearch_key__owner ,
    \t\tsearch_key__repo ,
    \t\temail_domain
    ORDER by commit_count desc`;
}

// 给定（owner，repo，二级目录），按照区域划分的commits修改文件数量
export function alteredFileCountRegionDistInSecondaryDirSql(owner, repo, dir) {
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
    '欧洲西部' as area,
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
    '欧洲东部' as area,
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

// 给定（owner，repo，二级目录），按照区域划分的开发者数量
export function developerCountRegionDistInSecondaryDirSql(owner, repo, dir) {
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
    '欧洲西部' as area,
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
    '欧洲东部' as area,
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
    dir_level2,area`;
}

// 给定（owner，repo，二级目录），按照email domain划分的commits修改文件数量
export function alteredFileCountDomainDistInSecondaryDirSql(owner, repo, dir) {
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
    dir_level2,email_domain ORDER by alter_file_count desc limit 20`;
}

// 给定（owner，repo，二级目录），按照email domain划分的开发者数量
export function developerCountDomainDistInSecondaryDirSql(owner, repo, dir) {
  return `
  select search_key__owner, search_key__repo,
    dir_level2,email_domain,count() contributor_count from (select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    email_domain,
    author_email
from (
    select search_key__owner,
        search_key__repo,
        author_email,
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
    dir_level2,email_domain,author_email)
group by search_key__owner, search_key__repo,
    dir_level2,email_domain
order by contributor_count desc ;`;
}

// 给定（owner，repo，二级目录），给出该二级目录中，开发者email，提交量，个人提交时区数量
export function developersContribInSecondaryDirSql(owner, repo, dir) {
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
                    and author_email != '')
            group by search_key__owner, search_key__repo, author_email, author_tz
            order by alter_files_count desc))
group by search_key__owner,search_key__repo,author_email
`;
}
