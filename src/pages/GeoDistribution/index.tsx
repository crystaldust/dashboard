import React from 'react';
import styles from './index.less';
import { getIntl } from 'umi';
import SecondaryDirSelector from '@/pages/GeoDistribution/SecondaryDirSelector';
import { runSql } from '@/services/clickhouse';
import OwnerRepoSelector from '@/pages/GeoDistribution/OwnerRepoSelector';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Divider, Row, Table, Tag, Spin } from 'antd';
import EventProxy from '@dking/event-proxy';
import { DatePicker } from 'antd';

const { RangePicker } = DatePicker;

import {
  alteredFileCountDomainDistInSecondaryDirSql,
  alteredFileCountRegionDistInSecondaryDirSql,
  commitsEmailDomainDistSql,
  commitsRegionDistSql,
  criticalityScoresSql,
  developerContribInRepoSql,
  developerCountDomainDistInSecondaryDirSql,
  developerCountRegionDistInSecondaryDirSql,
  developerGitHubProfileSql,
  developersContribInSecondaryDirSql,
  secondaryDirSql,
} from './DataSQLs';
import ProjectDistPies from '@/pages/GeoDistribution/ProjectDistPies';
import SecondaryDirsTable from '@/pages/GeoDistribution/SecondaryDirsTable';
import DirDeveloperContribTable from '@/pages/GeoDistribution/DirDeveloperContribTable';
import { DeveloperInfoTable } from '@/pages/GeoDistribution/DeveloperInfoTable';
import { parseGithubProfile } from '@/pages/GeoDistribution/DataProcessors';
import { CriticalityScoreChart } from '@/pages/GeoDistribution/CriticalityScoreChart';
import { Protocol } from 'puppeteer-core';
import moment from 'moment';

const intl = getIntl();

const MAX_DOMAIN_LEGENDS = 10;

export default class GeoDistribution extends React.Component<any, any> {
  owner: string;
  repo: string;
  since: string;
  until: string;

  constructor(props) {
    super(props);

    this.state = {
      dirData: [],
      ownerRepoMap: {},

      regionCommitsDist: [],
      emailDomainCommitsDist: [],
      criticalityScores: [],

      selectedDirsFileDeveloperData: [],
      selectedDirDeveloperContributionData: [],

      secondaryDirsTableData: [],
      loadingSecondaryDirsTableData: false,

      developerContribInSecondaryDirData: [],
      loadingDeveloperContribInSecondaryDirData: false,

      developerInfoData: [],

      dateRangeSelection: false,
    };

    this.since = '';
    this.until = '';
    this.owner = '';
    this.repo = '';

    this.updateRepoRelatedData = this.updateRepoRelatedData.bind(this);
    this.ownerRepoSelected = this.ownerRepoSelected.bind(this);
    this.onDirSelect = this.onDirSelect.bind(this);
    this.onDeveloperRowClicked = this.onDeveloperRowClicked.bind(this);
    this.onSecondaryDirRowClicked = this.onSecondaryDirRowClicked.bind(this);
    this.onDateRangeChanged = this.onDateRangeChanged.bind(this);
  }

  updateRepoRelatedData(owner, repo, since, until) {
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
    runSql(commitsRegionDistSql(owner, repo, since, until)).then((result) => {
      const regionCommitsDist = result.data
        .map((item) => ({
          region: item[2],
          value: item[3],
        }))
        .sort((a: object, b: object) => b.value - a.value);
      this.setState({ regionCommitsDist });
    });
    runSql(commitsEmailDomainDistSql(owner, repo, since, until)).then((result) => {
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
    // TODO Replace with real owner, repo
    const criticalityScores_sql = criticalityScoresSql(owner, repo);
    runSql(criticalityScores_sql).then((result) => {
      const criticalityScores: any[] = [];
      result.data.forEach((values: []) => {
        const score: object = {};
        result.columns.forEach((col: [], colIndex: number) => {
          const keyName: string = col[0];
          const value = values[colIndex];
          if (keyName == 'time_point') {
            // sampple time_point: 2020-06-01 00:00:00.000
            score[keyName] = value.slice(0, 10);
          } else if (keyName == 'contributor_lookback_days') {
            let content = 'Contributors ';
            if (value == 0) {
              content += ' all the time';
            } else {
              content += ` look back at ${value} days`;
            }
            score[keyName] = content;
          } else {
            score[keyName] = value;
          }
        });
        criticalityScores.push(score);
      });
      this.setState({ criticalityScores });
    });
  }

  ownerRepoSelected(owner: string, repo: string) {
    if (this.owner == owner && this.repo == repo) {
      return;
    }
    if (repo) {
      this.setState({ repo });
    }
    if (this.since || this.until) {
      // Clear the date range selection
      this.since = '';
      this.until = '';
      this.setState({ dateRangeSelection: false });
    }

    this.owner = owner;
    this.repo = repo;
    this.updateRepoRelatedData(this.owner, this.repo, this.since, this.until);
  }

  onDateRangeChanged(_, dateStrs: string[]) {
    const since = dateStrs[0];
    const until = dateStrs[1];
    if (this.since == since && this.until == until) {
      return;
    }

    this.since = since;
    this.until = until;
    if (since && until) {
      // If clear button is clicked, both until and since are empty string, when we shouldn't update the
      // picker's value
      this.setState({ dateRangeSelection: true });
    }
    this.updateRepoRelatedData(this.owner, this.repo, this.since, this.until);
  }

  onDirSelect(keys, selectedDirs) {
    this.setState({
      // Since secondaryDirsTableData will be update, don't change the state too frequently
      // Or the web page will have great performance side effect
      // secondaryDirsTableData: [],
      developerContribInSecondaryDirData: [],
      developerInfoData: [],
    });

    const dirKeySet = new Set<string>();
    keys.forEach((key) => {
      if (key.indexOf('-') == -1) {
        this.state.dirData[key].children.forEach((child) => dirKeySet.add(child.key));
      } else {
        dirKeySet.add(key);
      }
    });

    const owner = this.owner;
    const repo = this.repo;
    const since = this.since;
    const until = this.until;
    const secondaryDirs: string[] = [];

    dirKeySet.forEach((key: string) => {
      const parts = key.split('-');
      const primaryIndex = parseInt(parts[0]);
      const secondaryIndex = parseInt(parts[1]);
      const primaryDir = this.state.dirData[primaryIndex].title;
      const secondaryDir = this.state.dirData[primaryIndex].children[secondaryIndex].title;
      secondaryDirs.push(`${primaryDir}/${secondaryDir}`);
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

      runSql(
        alteredFileCountRegionDistInSecondaryDirSql(owner, repo, secondaryDir, since, until),
      ).then((result) => {
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
      });
      runSql(
        developerCountRegionDistInSecondaryDirSql(owner, repo, secondaryDir, since, until),
      ).then((result) => {
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
      });
      runSql(
        alteredFileCountDomainDistInSecondaryDirSql(owner, repo, secondaryDir, since, until),
      ).then((result) => {
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
      });
      runSql(
        developerCountDomainDistInSecondaryDirSql(owner, repo, secondaryDir, since, until),
      ).then((result) => {
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
      });
    });
  }

  onSecondaryDirRowClicked(row: any) {
    this.setState({
      // Since developerContribInSecondaryDirData will be update, don't change the state too frequently
      // Or the web page will have great performance side effect
      // developerContribInSecondaryDirData: [],
      developerInfoData: [],
    });
    const owner = this.owner;
    const repo = this.repo;
    const secondaryDir = row.secondaryDir;
    this.setState({ loadingDeveloperContribInSecondaryDirData: true });
    runSql(
      developersContribInSecondaryDirSql(owner, repo, secondaryDir, this.since, this.until),
    ).then((result) => {
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
    const owner = this.owner;
    const repo = this.repo;
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
    runSql(developerGitHubProfileSql(email), true).then((result) => {
      let profile = null;
      if (result.data.length) {
        const profileData = result.data[0];
        profile = parseGithubProfile(profileData);
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
          <Col span={8}>
            <OwnerRepoSelector onOwnerRepoSelected={this.ownerRepoSelected} />
          </Col>
          <Col span={4}>
            {!!this.state.repo && (
              <RangePicker
                onChange={this.onDateRangeChanged}
                value={
                  this.state.dateRangeSelection && this.since && this.until
                    ? [moment(this.since), moment(this.until)]
                    : [null, null]
                }
              />
            )}
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <CriticalityScoreChart criticalityScores={this.state.criticalityScores} />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={4}>
            <SecondaryDirSelector
              dirData={this.state.dirData}
              onDirSelect={this.onDirSelect}
              repo={this.state.repo}
            />
          </Col>
          <Col span={18}>
            <ProjectDistPies
              regionCommitsDist={this.state.regionCommitsDist}
              emailDomainCommitsDist={this.state.emailDomainCommitsDist}
            />
          </Col>
        </Row>

        <Spin spinning={this.state.loadingSecondaryDirsTableData}>
          <Row>
            <Col span={24}>
              <SecondaryDirsTable
                secondaryDirsTableData={this.state.secondaryDirsTableData}
                onSecondaryDirRowClicked={this.onSecondaryDirRowClicked}
              />
            </Col>
          </Row>
        </Spin>

        <Spin spinning={this.state.loadingDeveloperContribInSecondaryDirData}>
          <Row>
            <Col span={24}>
              <DirDeveloperContribTable
                developerContribInSecondaryDirData={this.state.developerContribInSecondaryDirData}
                onDeveloperRowClicked={this.onDeveloperRowClicked}
              />
            </Col>
          </Row>
        </Spin>

        <Row>
          <Col span={24}>
            <DeveloperInfoTable developerInfoData={this.state.developerInfoData} />
          </Col>
        </Row>
      </PageContainer>
    );
  }
}
