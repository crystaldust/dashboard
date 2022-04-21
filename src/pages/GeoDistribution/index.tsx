import React from 'react';
import SecondaryDir from '@/pages/GeoDistribution/SecondaryDir';
import { runSql } from '@/services/clickhouse';

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
    };

    this.fetchData = this.fetchData.bind(this);
    this.fetchData();
  }

  fetchData() {
    const sql = `
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
                             AND search_key__owner = '${this.state.owner}'
                             AND search_key__repo = '${this.state.repo}'

                      )
          GROUP BY search_key__owner, search_key__repo, dir_level2
          ORDER BY dir_level2
      `;
    runSql(sql).then((data) => {
      console.log(data);
      const allDirPaths = data.data.map((item) => item[2]);
      console.log(allDirPaths);
      let dirData = {};
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
      let stateDirData = [];
      let pIndex = 0;
      for (const primary in dirData) {
        let dirItem = {
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
      console.log(stateDirData);
      this.setState({ dirData: stateDirData });
    });
  }

  render() {
    return <SecondaryDir dirData={this.state.dirData} />;
  }
}
