import React from 'react';
import SecondaryDir from '@/pages/GeoDistribution/SecondaryDir';
import { runSql } from '@/services/clickhouse';
import OwnerRepoSelector from '@/pages/GeoDistribution/OwnerRepoSelector';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Collapse, Row } from 'antd';

const FETCH_DATA_SQL = `
SELECT search_key__owner,search_key__repo,
                dir_level2
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
                       AND search_key__owner = '{0}'
                       AND search_key__repo = '{1}'

                )
    GROUP BY search_key__owner, search_key__repo, dir_level2
    ORDER BY dir_level2
`;

export default class GeoDistribution extends React.Component<any, any> {
  constructor(props) {
    super(props);
    // TODO Steps:
    // 1. Get owner, repo list and construct the drop down list
    // 2. Given owner, repo, fetch secondary dirs and statistics
    this.state = {
      owner: 'DPDK',
      repo: 'dpdk',
      dirData: [],
      ownerRepoMap: {},
    };

    // this.fetchData = this.fetchData.bind(this);
    // this.fetchData();
    this.ownerRepoSelected = this.ownerRepoSelected.bind(this);
    this.onDirSelect = this.onDirSelect.bind(this);
  }

  ownerRepoSelected(owner: string, repo: string) {
    this.setState({ owner, repo });
    const getSecondaryDirsSql = `
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

    runSql(getSecondaryDirsSql).then((data: { columns: any; data: any }) => {
      const allDirPaths = data.data.map((item: string[]) => item[2]);
      const dirData: object = {};
      allDirPaths.forEach((path: string) => {
        const parts = path.split('/');
        const primary = parts[0];
        const secondary = parts[1];
        if (dirData.hasOwnProperty(primary)) {
          dirData[primary].push(secondary);
        } else {
          dirData[primary] = [secondary];
        }
      });
      const stateDirData = [];
      let pIndex = 0;
      for (const primary in dirData) {
        const dirItem: object = {
          title: primary,
          children: [],
          key: `${pIndex}`,
        };
        let sIndex = 0;
        dirData[primary].forEach((secondary) => {
          dirItem.children.push({
            title: secondary,
            key: `${pIndex}-${sIndex}`,
          });
          ++sIndex;
        });
        stateDirData.push(dirItem);
        ++pIndex;
      }
      this.setState({ dirData: stateDirData });
    });
  }

  onDirSelect(keys, selectedDirs) {
    const firstKey = keys[0];
    if (firstKey.indexOf('-') == -1) {
      return;
    }

    const parts = firstKey.split('-');
    const primaryIndex = parseInt(parts[0]);
    const secondaryIndex = parseInt(parts[1]);
    const primaryDir = this.state.dirData[primaryIndex].title;
    const secondaryDir = this.state.dirData[primaryIndex].children[secondaryIndex].title;
    const fullDir = `${primaryDir}/${secondaryDir}`;

    const getAlteredFileCountSql = `
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
         WHERE dir_level2 = '${fullDir}'
           AND search_key__owner = '${this.state.owner}'
           AND search_key__repo = '${this.state.repo}'
         )
GROUP BY search_key__owner, search_key__repo, dir_level2
    `;
    runSql(getAlteredFileCountSql).then((result) => {
      console.log('alter file count data:', result.data);
    });

    const getAlteredFileCountByEmailDomainSql = `
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
    where dir_level2 = '${fullDir}'
        and search_key__owner = '${this.state.owner}'
        and search_key__repo = '${this.state.repo}'
)
group by search_key__owner, search_key__repo,
    dir_level2,email_domain ORDER by alter_file_count desc limit 20
    `;
    runSql(getAlteredFileCountByEmailDomainSql).then((result) => {
      console.log('getAlteredFileCountByEmailDomainSql.data:', result.data);
    });

    const getAlterFileCountByGeoDist = `
    select search_key__owner ,
    search_key__repo ,
    dir_level2 ,
    author_tz,
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
    where dir_level2 = '${fullDir}'
        and search_key__owner = '${this.state.repo}'
        and search_key__repo = '${this.state.owner}'
)
group by search_key__owner, search_key__repo,
    dir_level2,author_tz
order by alter_file_count desc
    `;
    runSql(getAlterFileCountByGeoDist).then((result) => {
      console.log('getAlterFileCountByGeoDist.data:', result.data);
    });
  }

  render() {
    return (
      <PageContainer>
        <Row>
          <Col span={24}>
            <OwnerRepoSelector onOwnerRepoSelected={this.ownerRepoSelected} />
          </Col>
        </Row>
        <Row>
          <SecondaryDir dirData={this.state.dirData} onDirSelect={this.onDirSelect} />
        </Row>
      </PageContainer>
    );
  }
}
