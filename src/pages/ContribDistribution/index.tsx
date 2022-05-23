import React, { BaseSyntheticEvent } from 'react';
import SecondaryDirSelector from '@/pages/ContribDistribution/SecondaryDirSelector';
import { runSql } from '@/services/clickhouse';
import OwnerRepoSelector from '@/pages/ContribDistribution/OwnerRepoSelector';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Row, Spin, Input, Space, Button } from 'antd';
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
import ProjectDistPies from '@/pages/ContribDistribution/ProjectDistPies';
import SecondaryDirsTable from '@/pages/ContribDistribution/SecondaryDirsTable';
import DirDeveloperContribTable from '@/pages/ContribDistribution/DirDeveloperContribTable';
import { DeveloperInfoTable } from '@/pages/ContribDistribution/DeveloperInfoTable';
import { parseGithubProfile, pathsToTree } from '@/pages/ContribDistribution/DataProcessors';
import { CriticalityScoreChart } from '@/pages/ContribDistribution/CriticalityScoreChart';
import moment from 'moment';
import { getIntl } from 'umi';

const MAX_DOMAIN_LEGENDS = 10;
const MAX_DOMAIN_TAGS = 200;
export default class ContribDistribution extends React.Component<any, any> {
  owner: string;
  repo: string;
  since: string;
  until: string;
  commitMessageFilter: string;

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

      selectedDirs: [],
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
    this.commitMessageFilter = '';

    this.updateRepoRelatedData = this.updateRepoRelatedData.bind(this);
    this.ownerRepoSelected = this.ownerRepoSelected.bind(this);
    this.onDirSelect = this.onDirSelect.bind(this);
    this.onDeveloperRowClicked = this.onDeveloperRowClicked.bind(this);
    this.onSecondaryDirRowClicked = this.onSecondaryDirRowClicked.bind(this);
    this.onDateRangeChanged = this.onDateRangeChanged.bind(this);
    this.filterCommitMessage = this.filterCommitMessage.bind(this);
    this.onSearchInputChange = this.onSearchInputChange.bind(this);
  }

  componentDidMount() {
    const { owner, repo } = this.props.location.query;
    if (owner && repo) {
      console.log('we should load ', owner, repo);
      this.ownerRepoSelected(owner, repo);
    }
  }

  updateRepoRelatedData(owner, repo, since, until, commitMsgFilter = '') {
    this.setState({
      selectedDirs: [],
      secondaryDirsTableData: [],
      developerContribInSecondaryDirData: [],
      developerInfoData: [],
    });

    runSql(secondaryDirSql(owner, repo)).then((result: { columns: any; data: any }) => {
      const allDirPaths = result.data.map((item: string[]) => item[0]);
      const dirTree = pathsToTree(allDirPaths);
      this.setState({ dirData: dirTree });
    });
    runSql(commitsRegionDistSql(owner, repo, since, until, commitMsgFilter)).then((result) => {
      const regionCommitsDist = result.data
        .map((item) => ({
          region: item[2],
          value: item[3],
        }))
        .sort((a: object, b: object) => b.value - a.value);
      this.setState({ regionCommitsDist });
    });
    runSql(commitsEmailDomainDistSql(owner, repo, since, until, commitMsgFilter)).then((result) => {
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

    if (this.commitMessageFilter) {
      // Clear the commit message filter input
      this.commitMessageFilter = '';
    }
    this.setState({ commitMsgFilter: '' });

    this.owner = owner;
    this.repo = repo;
    this.updateRepoRelatedData(this.owner, this.repo, this.since, this.until);
  }

  onDateRangeChanged(_, dateStrs: string[]) {
    // Format '%YYYY-%MM' in clickhouse doesn't work, add the 'day one' suffix
    let since = dateStrs[0];
    let until = dateStrs[1];
    if (this.since == since + '-01' && this.until == until + '-01') {
      return;
    }

    if (since && until) {
      // If clear button is clicked, both until and since are empty string, when we shouldn't update the
      // picker's value
      this.setState({ dateRangeSelection: true });
    }

    if (since) {
      since += '-01';
    }
    if (until) {
      until += '-01';
    }

    this.since = since;
    this.until = until;

    this.updateRepoRelatedData(
      this.owner,
      this.repo,
      this.since,
      this.until,
      this.commitMessageFilter,
    );
  }

  onDirSelect(selectedDirs, event) {
    this.setState({
      // Since secondaryDirsTableData will be update, don't change the state too frequently
      // Or the web page will have great performance side effect
      // secondaryDirsTableData: [],
      selectedDirs,
      developerContribInSecondaryDirData: [],
      developerInfoData: [],
    });

    const owner = this.owner;
    const repo = this.repo;
    const since = this.since;
    const until = this.until;
    const commitMsgFilter = this.commitMessageFilter;

    if (selectedDirs.length == 0) {
      return;
    }

    this.setState({ loadingSecondaryDirsTableData: true });
    const ep = EventProxy.create();
    ep.on(
      selectedDirs.map((dir) => `${dir}-ready`),
      (...rowDatas) => {
        this.setState({ secondaryDirsTableData: rowDatas });
        this.setState({ loadingSecondaryDirsTableData: false });
      },
    );

    selectedDirs.forEach((secondaryDir) => {
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
        alteredFileCountRegionDistInSecondaryDirSql(
          owner,
          repo,
          secondaryDir,
          since,
          until,
          commitMsgFilter,
        ),
      ).then((result) => {
        const fileCountRegionDist = result.data.map((item: any[]) => {
          return {
            key: item[1],
            value: item[0],
            type: 'file_region_dist',
            owner: this.owner,
            repo: this.repo,
          };
        });
        ep.emit(`${secondaryDir}-regionFileCount-ready`, fileCountRegionDist);
      });
      runSql(
        developerCountRegionDistInSecondaryDirSql(
          owner,
          repo,
          secondaryDir,
          since,
          until,
          commitMsgFilter,
        ),
      ).then((result) => {
        const developerRegionDist = result.data.map((item: any[]) => {
          return {
            key: item[1],
            value: item[0],
            type: 'developer_region_dist',
            owner: this.owner,
            repo: this.repo,
          };
        });
        ep.emit(`${secondaryDir}-regionDeveloper-ready`, developerRegionDist);
      });
      runSql(
        alteredFileCountDomainDistInSecondaryDirSql(
          owner,
          repo,
          secondaryDir,
          since,
          until,
          commitMsgFilter,
        ),
      ).then((result) => {
        const fileCountEmailDomainDist = result.data.slice(0, MAX_DOMAIN_TAGS).map((item) => {
          return {
            key: item[1],
            value: item[0],
            type: 'file_domain_dist',
            owner: this.owner,
            repo: this.repo,
          };
        });
        ep.emit(`${secondaryDir}-domainFileCount-ready`, fileCountEmailDomainDist);
      });
      runSql(
        developerCountDomainDistInSecondaryDirSql(
          owner,
          repo,
          secondaryDir,
          since,
          until,
          commitMsgFilter,
        ),
      ).then((result) => {
        const developerEmailDomainDist = result.data.slice(0, MAX_DOMAIN_TAGS).map((item) => {
          return {
            key: item[1],
            value: item[0],
            type: 'developer_domain_dist',
            owner: this.owner,
            repo: this.repo,
          };
        });
        ep.emit(`${secondaryDir}-domainDeveloper-ready`, developerEmailDomainDist);
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
      developersContribInSecondaryDirSql(
        owner,
        repo,
        secondaryDir,
        this.since,
        this.until,
        this.commitMessageFilter,
      ),
      true,
    ).then((result) => {
      const developerContribInSecondaryDirData = result.data.map((item) => {
        return {
          secondaryDir: item.in_dir,
          developerEmail: item.author_email,
          fileCount: item.alter_files_count,
          tzDist: item.tz_distribution,
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

  filterCommitMessage(value: string) {
    this.commitMessageFilter = value.toLowerCase();

    this.updateRepoRelatedData(
      this.owner,
      this.repo,
      this.since,
      this.until,
      this.commitMessageFilter,
    );
  }

  onSearchInputChange(event: BaseSyntheticEvent) {
    this.setState({ commitMsgFilter: event.target.value });
  }

  render() {
    return (
      <PageContainer>
        <Row align={'middle'}>
          <Col span={8}>
            <OwnerRepoSelector onOwnerRepoSelected={this.ownerRepoSelected} />
          </Col>
          <Col span={4}>
            {!!this.state.repo && (
              <RangePicker
                onChange={this.onDateRangeChanged}
                picker="month"
                value={
                  this.state.dateRangeSelection && this.since && this.until
                    ? [moment(this.since), moment(this.until)]
                    : [null, null]
                }
              />
            )}
          </Col>
          <Space />
          <Space />
          <Col span={1.6}>
            {!!this.state.repo && (
              <span>{getIntl().formatMessage({ id: 'contribDist.filterCommitMessage' })} </span>
            )}
          </Col>
          <Col span={6}>
            {!!this.state.repo && (
              <Input.Search
                // placeholder={'Filter Commit Message'}
                onSearch={this.filterCommitMessage}
                onChange={this.onSearchInputChange}
                value={this.state.commitMsgFilter}
                enterButton
                allowClear
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
              selectedDirs={this.state.selectedDirs}
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
