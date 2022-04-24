import React from 'react';
import SecondaryDir from '@/pages/GeoDistribution/SecondaryDir';
import { runSql } from '@/services/clickhouse';
import OwnerRepoSelector from '@/pages/GeoDistribution/OwnerRepoSelector';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Row, Table, Tag } from 'antd';
import { Pie } from '@ant-design/plots';
import EventProxy from '@dking/event-proxy';
import {
  alteredFileCountDomainDistInSecondaryDirSql,
  alteredFileCountRegionDistInSecondaryDirSql,
  commitsEmailDomainDistSql,
  commitsRegionDistSql,
  developerContribInRepoSql,
  developerCountDomainDistInSecondaryDirSql,
  developerCountRegionDistInSecondaryDirSql,
  developerGitHubProfileCompoundSql,
  developerGitHubProfileSql,
  developersContribInSecondaryDirSql,
  secondaryDirSql,
} from './data';

import { getIntl } from 'umi';

const { Column, ColumnGroup } = Table;

const intl = getIntl();

function secondaryDirTableCellRender(cellData, rowData, index) {
  const numItems: integer = cellData.length; // TODO If numItems is not a big number, return a <div>
  return cellData.map((regionInfo, index) => {
    const region = regionInfo[3];
    const data = regionInfo[4];
    const line = `${region}: ${data}`;
    const key = `${rowData.secondaryDir}-${region}-${line}`;
    // TODO It's super weried that JS always complain 'each children in list should have uniq key'
    // TODO while it's really 'uniq' enough
    return (
      // <div key={key}>
      <Tag key={key} color={'volcano'}>
        {line}
      </Tag>
      // </div>
    );
  });
}

const SECONDARY_DIR_TABLE_COLS = [
  {
    title: intl.formatMessage({ id: 'geodist.secondaryDirTable.colname.secondaryDir' }),
    dataIndex: 'secondaryDir',
  },
  {
    title: intl.formatMessage({ id: 'geodist.secondaryDirTable.colname.fileRegionDist' }),
    dataIndex: 'fileRegionDist',
    render: secondaryDirTableCellRender,
  },
  {
    title: intl.formatMessage({ id: 'geodist.secondaryDirTable.colname.fileEmailDist' }),
    dataIndex: 'fileEmailDist',
    render: secondaryDirTableCellRender,
  },
  {
    title: intl.formatMessage({ id: 'geodist.secondaryDirTable.colname.developerRegionDist' }),
    dataIndex: 'developerRegionDist',
    render: secondaryDirTableCellRender,
  },
  {
    title: intl.formatMessage({ id: 'geodist.secondaryDirTable.colname.developerEmailDist' }),
    dataIndex: 'developerEmailDist',
    render: secondaryDirTableCellRender,
  },
];

const DEVELOPER_CONTRIB_IN_SECONDARY_DIR_COLS = [
  {
    title: intl.formatMessage({ id: 'geodist.secondaryDirTable.colname.secondaryDir' }),
    dataIndex: 'secondaryDir',
  },
  {
    title: intl.formatMessage({
      id: 'geodist.developerContribInSecondaryDirTable.colname.developerEmail',
    }),
    dataIndex: 'developerEmail',
  },
  {
    title: intl.formatMessage({
      id: 'geodist.developerContribInSecondaryDirTable.colname.fileCount',
    }),
    dataIndex: 'fileCount',
  },
  {
    title: intl.formatMessage({ id: 'geodist.developerContribInSecondaryDirTable.colname.tzDist' }),
    dataIndex: 'tzDist',
    render: (cellData) => {
      return cellData.map((item) => {
        for (const tz in item) {
          const count = item[tz];
          let key = tz;
          if (parseInt(tz) > 0) {
            key = `+${tz}`;
          }
          const content = `${key}: ${count}`;
          return <Tag key={key}>{content}</Tag>;
        }
      });
    },
  },
];

// 'geodist.developerInfoTable.colname.owner': 'Owner',
//   'geodist.developerInfoTable.colname.repo': 'Repo',
//   'geodist.developerInfoTable.colname.email': '邮箱',
//   'geodist.developerInfoTable.colname.githubProfile': 'GitHub个人信息',
//   'geodist.developerInfoTable.colname.contribTzDist': '代码贡献时区分布',
//
// owner: contribTzDist.owner,
//   repo: contribTzDist.repo,
//   email: contribTzDist.email,
//   githubProfile,
//   dist: contribTzDist.dist,
const DEVELOPER_INFO_COLS = [
  {
    title: intl.formatMessage({ id: 'geodist.developerInfoTable.colname.owner' }),
    dataIndex: 'owner',
  },
  {
    title: intl.formatMessage({ id: 'geodist.developerInfoTable.colname.repo' }),
    dataIndex: 'repo',
  },
  {
    title: intl.formatMessage({ id: 'geodist.developerInfoTable.colname.email' }),
    dataIndex: 'email',
  },
  {
    title: intl.formatMessage({ id: 'geodist.developerInfoTable.colname.githubProfile' }),
    dataIndex: 'githubProfile',
    render: (profile) => {
      if (!profile) {
        return <div>No GitHub Profile found</div>;
      }
      return (
        <div>
          <img src={profile.avatarUrl} width={100} height={100} />
          <div>{profile.name != '' ? profile.name : profile.login}</div>
          <a href={profile.htmlUrl} target={'_blank'}>
            @{profile.login}
          </a>
        </div>
      );
    },
  },
  {
    title: intl.formatMessage({ id: 'geodist.developerInfoTable.colname.contribTzDist' }),
    dataIndex: 'dist',
    render: (dist) => {
      return dist.map((item) => {
        for (const tz in item) {
          const count = item[tz];
          const tzStr = parseInt(tz) > 0 ? `+${tz}` : tz;
          const content = `${tzStr}: ${count}`;
          return (
            <div key={Math.random()}>
              <Tag key={Math.random()}>{content}</Tag>
            </div>
          );
        }
      });
    },
  },
];
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

      regionCommitsDist: [],
      emailDomainCommitsDist: [],

      selectedDirsFileDeveloperData: [],
      selectedDirDeveloperContributionData: [],

      secondaryDirsTableData: [],

      developerContribInSecondaryDirData: [],

      developerInfoData: [],
    };

    this.ownerRepoSelected = this.ownerRepoSelected.bind(this);
    this.onDirSelect = this.onDirSelect.bind(this);
    this.onDeveloperRowClicked = this.onDeveloperRowClicked.bind(this);
  }

  ownerRepoSelected(owner: string, repo: string) {
    this.setState({ owner, repo });

    this.setState({
      secondaryDirsTableData: [],
      developerContribInSecondaryDirData: [],
      developerInfoData: [],
    });

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
    runSql(commitsRegionDistSql(owner, repo)).then((result) => {
      const regionCommitsDist = result.data.map((item) => ({
        region: item[2],
        value: item[3],
      }));
      this.setState({ regionCommitsDist });
    });
    runSql(commitsEmailDomainDistSql(owner, repo)).then((result) => {
      const emailDomainCommitsDist = result.data.map((item) => ({
        domain: item[2],
        value: item[3],
      }));
      this.setState({ emailDomainCommitsDist });
    });
  }

  onDirSelect(keys, selectedDirs) {
    this.setState({
      // Since secondaryDirsTableData will be update, don't change the state too frequently
      // Or the web page will have great performance side effect
      // secondaryDirsTableData: [],
      developerContribInSecondaryDirData: [],
      developerInfoData: [],
    });

    const owner = this.state.owner;
    const repo = this.state.repo;
    const secondaryDirs = keys
      .filter((key: string) => key.indexOf('-') != -1)
      .map((key: string) => {
        const parts = key.split('-');
        const primaryIndex = parseInt(parts[0]);
        const secondaryIndex = parseInt(parts[1]);
        const primaryDir = this.state.dirData[primaryIndex].title;
        const secondaryDir = this.state.dirData[primaryIndex].children[secondaryIndex].title;
        return `${primaryDir}/${secondaryDir}`;
      });
    if (secondaryDirs.length == 0) {
      return;
    }

    const ep = EventProxy.create();
    ep.on(
      secondaryDirs.map((dir) => `${dir}-ready`),
      (...rowDatas) => {
        this.setState({ secondaryDirsTableData: rowDatas });
      },
    );

    secondaryDirs.forEach((secondaryDir) => {
      ep.on(
        ['regionFileCount', 'regionDeveloper', 'domainFileCount', 'domainDeveloper'].map(
          (dataIndex) => `${secondaryDir}-${dataIndex}-ready`,
        ),
        (regionFileCount, regionDeveloper, domainFileCount, domainDeveloper) => {
          ep.emit(`${secondaryDir}-ready`, {
            secondaryDir,
            fileRegionDist: regionFileCount,
            fileEmailDist: domainFileCount,
            developerRegionDist: regionDeveloper,
            developerEmailDist: domainDeveloper,
          });
        },
      );

      runSql(alteredFileCountRegionDistInSecondaryDirSql(owner, repo, secondaryDir)).then(
        (result) => {
          const sortedData = result.data.sort((a, b) => {
            // a and b look like this:
            // [
            //     "envoyproxy",
            //     "envoy",
            //     "api/bazel",
            //     "日韩",
            //     8
            // ]
            return b[4] - a[4];
          });
          ep.emit(`${secondaryDir}-regionFileCount-ready`, sortedData);
        },
      );
      runSql(developerCountRegionDistInSecondaryDirSql(owner, repo, secondaryDir)).then(
        (result) => {
          const sortedDeveloperRegion = result.data.sort((a, b) => {
            // a and b look like this:
            // [
            //     "envoyproxy",
            //     "envoy",
            //     "api/bazel",
            //     "日韩",
            //     8
            // ]
            return b[4] - a[4];
          });
          ep.emit(`${secondaryDir}-regionDeveloper-ready`, sortedDeveloperRegion);
        },
      );
      runSql(alteredFileCountDomainDistInSecondaryDirSql(owner, repo, secondaryDir)).then(
        (result) => {
          const sortedFileCount = result.data.sort((a, b) => {
            // a and b look like this:
            // [
            //     "envoyproxy",
            //     "envoy",
            //     "api/bazel",
            //     "gmail.com",
            //     8
            // ]
            return b[4] - a[4];
          });
          ep.emit(`${secondaryDir}-domainFileCount-ready`, sortedFileCount);
        },
      );
      runSql(developerCountDomainDistInSecondaryDirSql(owner, repo, secondaryDir)).then(
        (result) => {
          const sortedDeveloperCount = result.data.sort((a, b) => {
            // a and b look like this:
            // [
            //     "envoyproxy",
            //     "envoy",
            //     "api/bazel",
            //     "gmail.com",
            //     8
            // ]
            return b[4] - a[4];
          });
          ep.emit(`${secondaryDir}-domainDeveloper-ready`, sortedDeveloperCount);
        },
      );
    });
  }

  onSecondaryDirRowClicked(row: any) {
    this.setState({
      // Since developerContribInSecondaryDirData will be update, don't change the state too frequently
      // Or the web page will have great performance side effect
      // developerContribInSecondaryDirData: [],
      developerInfoData: [],
    });
    const owner = this.state.owner;
    const repo = this.state.repo;
    const secondaryDir = row.secondaryDir;
    runSql(developersContribInSecondaryDirSql(owner, repo, secondaryDir)).then((result) => {
      const developerContribInSecondaryDirData = result.data.map((item) => {
        return {
          secondaryDir: secondaryDir,
          developerEmail: item[2],
          fileCount: item[3],
          tzDist: item[4],
        };
      });
      this.setState({ developerContribInSecondaryDirData });
    });
  }

  onDeveloperRowClicked(row: object) {
    const owner = this.state.owner;
    const repo = this.state.repo;
    const email = row.developerEmail;
    const ep = EventProxy.create();
    ep.on(['githubProfileReady', 'contribTzDistReady'], (githubProfile, contribTzDist) => {
      const developerInfoData = [
        {
          owner: contribTzDist.owner,
          repo: contribTzDist.repo,
          email: contribTzDist.email,
          githubProfile,
          dist: contribTzDist.dist,
        },
      ];
      this.setState({
        developerInfoData,
      });
    });
    runSql(developerGitHubProfileSql(email)).then((result) => {
      let profile = null;
      if (result.data.length) {
        const profileData = result.data[0];
        profile = {
          id: profileData[2],
          login: profileData[1],
          name: profileData[19],
          avatarUrl: profileData[4],
          htmlUrl: profileData[7],
        };
      }
      ep.emit('githubProfileReady', profile);
    });
    runSql(developerContribInRepoSql(owner, repo, email)).then((result) => {
      const distData = result.data[0];
      const contribTzDist = {
        owner: distData[0],
        repo: distData[1],
        email: distData[2],
        dist: distData[3],
      };
      ep.emit('contribTzDistReady', contribTzDist);
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
          <Col span={6}>
            <SecondaryDir dirData={this.state.dirData} onDirSelect={this.onDirSelect} />
          </Col>
          <Col span={6}>
            <div>
              {this.state.regionCommitsDist.length
                ? intl.formatMessage({ id: 'geodist.commitsRegionDist' })
                : ''}
            </div>
            <Pie
              angleField={'value'}
              colorField={'region'}
              data={this.state.regionCommitsDist}
              label={{
                type: 'inner',
              }}
              radius={0.9}
            />
          </Col>
          <Col span={6}>
            <div>
              {this.state.emailDomainCommitsDist.length
                ? intl.formatMessage({ id: 'geodist.commitsEmailDomainDist' })
                : ''}
            </div>
            <Pie
              angleField={'value'}
              colorField={'domain'}
              data={this.state.emailDomainCommitsDist}
              label={{
                type: 'inner',
              }}
              radius={0.9}
            />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            {!!this.state.secondaryDirsTableData.length && (
              <Table
                columns={SECONDARY_DIR_TABLE_COLS}
                dataSource={this.state.secondaryDirsTableData}
                onRow={(row) => {
                  return {
                    onClick: () => {
                      this.onSecondaryDirRowClicked(row);
                    },
                  };
                }}
              />
            )}
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            {!!this.state.developerContribInSecondaryDirData.length && (
              <Table
                columns={DEVELOPER_CONTRIB_IN_SECONDARY_DIR_COLS}
                dataSource={this.state.developerContribInSecondaryDirData}
                onRow={(row) => {
                  return {
                    onClick: () => {
                      this.onDeveloperRowClicked(row);
                    },
                  };
                }}
              />
            )}
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            {!!this.state.developerInfoData.length && (
              <Table
                columns={DEVELOPER_INFO_COLS}
                dataSource={this.state.developerInfoData}
                // onRow={(row) => {
                //   return {
                //     onClick: () => {
                //       this.onDeveloperRowClicked(row);
                //     },
                //   };
                // }}
              />
            )}
          </Col>
        </Row>
      </PageContainer>
    );
  }
}
