import React from 'react';
import styles from './index.less';
import { getIntl } from 'umi';
import SecondaryDir from '@/pages/GeoDistribution/SecondaryDir';
import { runSql } from '@/services/clickhouse';
import OwnerRepoSelector from '@/pages/GeoDistribution/OwnerRepoSelector';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Divider, Row, Table, Tag, Spin } from 'antd';
import { G2, Pie } from '@ant-design/plots';
import EventProxy from '@dking/event-proxy';

import {
  alteredFileCountDomainDistInSecondaryDirSql,
  alteredFileCountRegionDistInSecondaryDirSql,
  commitsEmailDomainDistSql,
  commitsRegionDistSql,
  developerContribInRepoSql,
  developerCountDomainDistInSecondaryDirSql,
  developerCountRegionDistInSecondaryDirSql,
  developerGitHubProfileSql,
  developersContribInSecondaryDirSql,
  secondaryDirSql,
} from './data';

const G = G2.getEngine('canvas');

const intl = getIntl();
const COLORS10_ELEGENT = [
  '#3682be',
  '#45a776',
  '#f05326',
  '#a69754',
  '#334f65',
  '#b3974e',
  '#38cb7d',
  '#ddae33',
  '#844bb3',
  '#93c555',
  '#5f6694',
  '#df3881',
];
const MAX_DOMAIN_LEGENDS = 10;

function secondaryDirTableCellRender(cellData, rowData, index) {
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

const GHPROFILE_COMPANY = intl.formatMessage({
  id: 'geodist.developerInfoTable.githubProfile.company',
});
const GHPROFILE_LOCATION = intl.formatMessage({
  id: 'geodist.developerInfoTable.githubProfile.location',
});
const GHPROFILE_COUNTRY = intl.formatMessage({
  id: 'geodist.developerInfoTable.githubProfile.country',
});

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
          <div>{profile.location != '' ? `${GHPROFILE_LOCATION}: ${profile.location}` : ''}</div>
          <div>{profile.company != '' ? `${GHPROFILE_COMPANY}: ${profile.company}` : ''}</div>
          <div>
            {profile.inferedCountry != '' ? `${GHPROFILE_COUNTRY}: ${profile.inferedCountry}` : ''}
          </div>
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

function generateLabelGroup(data, mappingData, keyField) {
  const group = new G.Group({});
  group.addShape({
    type: 'circle',
    attrs: {
      x: 0,
      y: 0,
      width: 40,
      height: 50,
      r: 5,
      fill: mappingData.color,
    },
  });

  const percent = Math.round(data.percent * 100);
  let percentStr = `${percent}%`;
  if (percent < 1) {
    percentStr = '< 1%';
  }
  group.addShape({
    type: 'text',
    attrs: {
      x: 10,
      y: 8,
      text: `${data[keyField]} ${percentStr}`,
      fill: mappingData.color,
    },
  });

  return group;
}

export default class GeoDistribution extends React.Component<any, any> {
  constructor(props) {
    super(props);
    // TODO Steps:
    // 1. Get owner, repo list and construct the drop down list
    // 2. Given owner, repo, fetch secondary dirs and statistics
    this.state = {
      owner: '',
      repo: '',
      dirData: [],
      ownerRepoMap: {},

      regionCommitsDist: [],
      emailDomainCommitsDist: [],

      selectedDirsFileDeveloperData: [],
      selectedDirDeveloperContributionData: [],

      secondaryDirsTableData: [],
      loadingSecondaryDirsTableData: false,

      developerContribInSecondaryDirData: [],
      loadingDeveloperContribInSecondaryDirData: false,

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
      const regionCommitsDist = result.data
        .map((item) => ({
          region: item[2],
          value: item[3],
        }))
        .sort((a: object, b: object) => b.value - a.value);
      this.setState({ regionCommitsDist });
    });
    runSql(commitsEmailDomainDistSql(owner, repo)).then((result) => {
      let emailDomainCommitsDist = result.data
        .map((item) => ({
          domain: item[2],
          value: item[3],
        }))
        .sort((a: object, b: object) => b.value - a.value);
      if (emailDomainCommitsDist.length > MAX_DOMAIN_LEGENDS) {
        const lastDist = emailDomainCommitsDist.slice(MAX_DOMAIN_LEGENDS - 1, -1);
        const lastSum = lastDist.reduce((accumulated, dist) => accumulated + dist.value, 0);
        emailDomainCommitsDist = emailDomainCommitsDist.slice(0, MAX_DOMAIN_LEGENDS - 1);
        emailDomainCommitsDist.push({ domain: 'Other', value: lastSum });
      }
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

    this.setState({ loadingSecondaryDirsTableData: true });
    const ep = EventProxy.create();
    ep.on(
      secondaryDirs.map((dir) => `${dir}-ready`),
      (...rowDatas) => {
        this.setState({ secondaryDirsTableData: rowDatas });
        this.setState({ loadingSecondaryDirsTableData: false });
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
    this.setState({ loadingDeveloperContribInSecondaryDirData: true });
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
      this.setState({ loadingDeveloperContribInSecondaryDirData: false });
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
          company: profileData[20],
          location: profileData[22],
          // Determine the priority of infered geolocation info
          inferedCountry: profileData[35],
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
        <Row gutter={16}>
          <Col span={4}>
            {this.state.repo == '' ? (
              ''
            ) : (
              <div>
                <Divider>{intl.formatMessage({ id: 'geodist.dirTree' })}</Divider>
                {/*<span className={styles.componentIntro} style={{ color: '#999999' }}>*/}
                <span className={styles.componentIntro}>
                  {intl.formatMessage({ id: 'geodist.dirTree.desc' })}
                </span>
              </div>
            )}
            <SecondaryDir dirData={this.state.dirData} onDirSelect={this.onDirSelect} />
          </Col>
          <Col span={9}>
            <Divider>
              {this.state.regionCommitsDist.length
                ? intl.formatMessage({ id: 'geodist.commitsRegionDist' })
                : ''}
            </Divider>
            <Pie
              angleField={'value'}
              colorField={'region'}
              data={this.state.regionCommitsDist}
              legend={{
                layout: 'horizontal',
                position: 'bottom',
                flipPage: false,
              }}
              // animation has to be turned off to avoid re-render when label formatter is specifed
              animation={false}
              label={{
                type: 'spider',
                labelHeight: 40,
                formatter: (data, mappingData) => {
                  return generateLabelGroup(data, mappingData, 'region');
                },
              }}
              radius={0.9}
              theme={{
                colors10: COLORS10_ELEGENT,
              }}
            />
          </Col>
          <Col span={11}>
            <Divider>
              {this.state.emailDomainCommitsDist.length
                ? intl.formatMessage({ id: 'geodist.commitsEmailDomainDist' })
                : ''}
            </Divider>
            <Pie
              angleField={'value'}
              colorField={'domain'}
              data={this.state.emailDomainCommitsDist}
              animation={false}
              legend={{
                layout: 'horizontal',
                position: 'bottom',
                flipPage: false,
              }}
              label={{
                type: 'spider',
                labelHeight: 40,
                formatter: (data, mappingData) => {
                  return generateLabelGroup(data, mappingData, 'domain');
                },
              }}
              radius={0.9}
              theme={{
                colors10: COLORS10_ELEGENT,
              }}
            />
          </Col>
        </Row>

        <Spin spinning={this.state.loadingSecondaryDirsTableData}>
          <Row>
            <Col span={24}>
              {!!this.state.secondaryDirsTableData.length && (
                <div>
                  <Divider>
                    {intl.formatMessage({ id: 'geodist.secondaryDirTable.header.secondaryDir' })}
                  </Divider>
                  <span className={styles.componentIntro}>
                    {intl.formatMessage({ id: 'geodist.secondaryDirTable.desc' })}
                  </span>
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
                </div>
              )}
            </Col>
          </Row>
        </Spin>

        <Spin spinning={this.state.loadingDeveloperContribInSecondaryDirData}>
          <Row>
            <Col span={24}>
              {!!this.state.developerContribInSecondaryDirData.length && (
                <div>
                  <Divider>
                    {intl.formatMessage({
                      id: 'geodist.developerContribInSecondaryDirTable.header.developerInfo',
                    })}
                  </Divider>
                  <span className={styles.componentIntro}>
                    {intl.formatMessage({
                      id: 'geodist.developerContribInSecondaryDirTable.desc',
                    })}
                  </span>
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
                </div>
              )}
            </Col>
          </Row>
        </Spin>

        <Row>
          <Col span={24}>
            {!!this.state.developerInfoData.length && (
              <div>
                <Divider>
                  {intl.formatMessage({ id: 'geodist.developerInfoTable.header.developerInfo' })}
                </Divider>
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
              </div>
            )}
          </Col>
        </Row>
      </PageContainer>
    );
  }
}
