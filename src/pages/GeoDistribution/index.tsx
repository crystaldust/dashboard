import React from 'react';
import SecondaryDir from '@/pages/GeoDistribution/SecondaryDir';
import { runSql } from '@/services/clickhouse';
import OwnerRepoSelector from '@/pages/GeoDistribution/OwnerRepoSelector';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Collapse, Row } from 'antd';
import { Pie } from '@ant-design/plots';
import EventProxy from '@dking/event-proxy';

import {
  alteredFileCountByRegionSql,
  alteredFileCountDomainDistInSecondaryDirSql,
  alteredFileCountRegionDistInSecondaryDirSql,
  alteredFileCountSql,
  alteredFileEmailDomainSql,
  alteredFileTZSql,
  commitsEmailDomainDistSql,
  commitsRegionDistSql,
  developerCountByRegionSql,
  developerCountDomainDistInSecondaryDirSql,
  developerCountRegionDistInSecondaryDirSql,
  secondaryDirSql,
} from './data';

import { getIntl } from 'umi';

export default class GeoDistribution extends React.Component<any, any> {
  private intl: any;
  constructor(props) {
    super(props);
    this.intl = getIntl();
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
    runSql(commitsRegionDistSql(owner, repo)).then((result) => {
      console.log('commitsRegionDistSql', result.data);
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
    const owner = this.state.owner;
    const repo = this.state.repo;
    const ep = EventProxy.create();
    ep.on(
      ['regionFileCountStr', 'regionDeveloperStr', 'domainFileCountStr', 'domainDeveloperStr'],
      (regionFileCountStr, regionDeveloperStr, domainFileCountStr, domainDeveloperStr) => {
        console.log('all finished!');
        console.log(regionFileCountStr);
        console.log('------------------');
        console.log(regionDeveloperStr);
        console.log('------------------');
        console.log(domainFileCountStr);
        console.log('------------------');
        console.log(domainDeveloperStr);
        console.log('------------------');
      },
    );
    runSql(alteredFileCountRegionDistInSecondaryDirSql(owner, repo, fullDir)).then((result) => {
      let sortedFileCountStr = '';
      result.data
        .sort((a, b) => {
          // a and b look like this:
          // [
          //     "envoyproxy",
          //     "envoy",
          //     "api/bazel",
          //     "日韩",
          //     8
          // ]
          return b[4] - a[4];
        })
        .forEach((fileCountObj) => {
          sortedFileCountStr += `${fileCountObj[3]} : ${fileCountObj[4]}\n`;
        });
      ep.emit('regionFileCountStr', sortedFileCountStr);
    });
    runSql(developerCountRegionDistInSecondaryDirSql(owner, repo, fullDir)).then((result) => {
      let sortedDeveloperRegionStr = '';
      result.data
        .sort((a, b) => {
          // a and b look like this:
          // [
          //     "envoyproxy",
          //     "envoy",
          //     "api/bazel",
          //     "日韩",
          //     8
          // ]
          return b[4] - a[4];
        })
        .forEach((developerCountObj) => {
          sortedDeveloperRegionStr += `${developerCountObj[3]} : ${developerCountObj[4]}\n`;
        });
      ep.emit('regionDeveloperStr', sortedDeveloperRegionStr);
    });
    runSql(alteredFileCountDomainDistInSecondaryDirSql(owner, repo, fullDir)).then((result) => {
      let sortedFileCountStr = '';
      result.data
        .sort((a, b) => {
          // a and b look like this:
          // [
          //     "envoyproxy",
          //     "envoy",
          //     "api/bazel",
          //     "gmail.com",
          //     8
          // ]
          return b[4] - a[4];
        })
        .forEach((fileCountObj) => {
          sortedFileCountStr += `${fileCountObj[3]} : ${fileCountObj[4]}\n`;
        });
      ep.emit('domainFileCountStr', sortedFileCountStr);
    });
    runSql(developerCountDomainDistInSecondaryDirSql(owner, repo, fullDir)).then((result) => {
      let sortedDeveloperCountStr = '';
      result.data
        .sort((a, b) => {
          // a and b look like this:
          // [
          //     "envoyproxy",
          //     "envoy",
          //     "api/bazel",
          //     "gmail.com",
          //     8
          // ]
          return b[4] - a[4];
        })
        .forEach((developerCountObj) => {
          sortedDeveloperCountStr += `${developerCountObj[3]} : ${developerCountObj[4]}\n`;
        });
      ep.emit('domainDeveloperStr', sortedDeveloperCountStr);
    });
    // runSql(alteredFileCountSql(this.state.owner, this.state.repo, fullDir)).then((result) => {
    //   console.log('alter file count data:', result.data);
    // });

    // runSql(alteredFileEmailDomainSql(this.state.owner, this.state.repo, fullDir)).then((result) => {
    //   const piechartData = result.data.map((item) => {
    //     const emailDomain = item[3];
    //     const fileCount = item[4];
    //     return {
    //       emailDomain: emailDomain,
    //       value: fileCount,
    //     };
    //   });
    //   this.setState({ emailDomainDist: piechartData });
    // });

    // runSql(alteredFileTZSql(this.state.owner, this.state.repo, fullDir)).then((result) => {
    //   const timezoneDist = result.data.map((item) => {
    //     return {
    //       timezone: item[3],
    //       value: item[4],
    //     };
    //   });
    //   this.setState({ timezoneDist });
    // });

    // runSql(alteredFileCountByRegionSql(this.state.owner, this.state.repo, fullDir)).then(
    //   (result) => {
    //     console.log(result.data);
    //     console.log(result.columns);
    //     const regionFileCountDist = result.data.map((item) => {
    //       return {
    //         region: item[3],
    //         value: item[4],
    //       };
    //     });
    //     this.setState({ regionFileCountDist });
    //   },
    // );
    //
    // runSql(developerCountByRegionSql(this.state.owner, this.state.repo, fullDir)).then((result) => {
    //   console.log('developerCountByRegion:', result.data);
    //   const regionDeveloperCountDist = result.data.map((item) => ({
    //     region: item[3],
    //     value: item[4],
    //   }));
    //
    //   this.setState({ regionDeveloperCountDist });
    // });
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
                ? this.intl.formatMessage({ id: 'geodist.commitsRegionDist' })
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
                ? this.intl.formatMessage({ id: 'geodist.commitsEmailDomainDist' })
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
      </PageContainer>
    );
  }
}
