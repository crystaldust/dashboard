import React from 'react';
import SecondaryDir from '@/pages/GeoDistribution/SecondaryDir';
import { runSql } from '@/services/clickhouse';
import OwnerRepoSelector from '@/pages/GeoDistribution/OwnerRepoSelector';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Collapse, Row } from 'antd';
import { Pie } from '@ant-design/plots';

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
      emailDomainDist: [],
      timezoneDist: [],
    };

    // this.fetchData = this.fetchData.bind(this);
    // this.fetchData();
    this.ownerRepoSelected = this.ownerRepoSelected.bind(this);
    this.onDirSelect = this.onDirSelect.bind(this);
  }

  ownerRepoSelected(owner: string, repo: string) {
    this.setState({ owner, repo });

    runSql(secondaryDirSql(owner, repo)).then((data: { columns: any; data: any }) => {
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

    runSql(alteredFileCountSql(this.state.owner, this.state.repo, fullDir)).then((result) => {
      console.log('alter file count data:', result.data);
    });

    runSql(alteredFileEmailDomainSql(this.state.owner, this.state.repo, fullDir)).then((result) => {
      const piechartData = result.data.map((item) => {
        const emailDomain = item[3];
        const fileCount = item[4];
        return {
          emailDomain: emailDomain,
          value: fileCount,
        };
      });
      this.setState({ emailDomainDist: piechartData });
    });

    runSql(alteredFileTZSql(this.state.owner, this.state.repo, fullDir)).then((result) => {
      const timezoneDist = result.data.map((item) => {
        return {
          timezone: item[3],
          value: item[4],
        };
      });
      this.setState({ timezoneDist });
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
          <Col span={8}>
            <SecondaryDir dirData={this.state.dirData} onDirSelect={this.onDirSelect} />
          </Col>
          <Col span={8}>
            <div>{this.state.emailDomainDist.length ? 'Email Domain Distribution' : ''}</div>
            <Pie
              angleField={'value'}
              colorField={'emailDomain'}
              radius={0.9}
              label={{
                type: 'inner',
                offset: '-30%',
                content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
                style: {
                  fontSize: 14,
                  textAlign: 'center',
                },
              }}
              interactions={{
                type: 'element-active',
              }}
              data={this.state.emailDomainDist}
            />
          </Col>
          <Col span={8}>
            <div>{this.state.timezoneDist.length ? 'Timezone Distribution' : ''}</div>
            <Pie
              angleField={'value'}
              colorField={'timezone'}
              radius={0.9}
              label={{
                type: 'outer',
                // offset: '-30%',
                // content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
                // style: {
                //   fontSize: 14,
                //   textAlign: 'center',
                // },
              }}
              interactions={{
                type: 'element-active',
              }}
              data={this.state.timezoneDist}
            />
          </Col>
        </Row>
      </PageContainer>
    );
  }
}
