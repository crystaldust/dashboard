function secondaryDirSql(owner, repo) {
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

function alteredFileTZSql(owner, repo, dir) {
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

function alteredFileEmailDomainSql(owner, repo, dir) {
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

function alteredFileCountSql(owner, repo, dir) {
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
