import React from 'react';
import { AutoComplete, Button, Card, Col, Divider, Row, Statistic, notification } from 'antd';
import {
  allProjectsSQL,
  commitCountSql,
  developerCountSql,
  issueCountSql,
  prCountSql,
  repoCountSql,
} from '@/pages/RepositoriesManager/DataSQLs';
import { runSql } from '@/services/clickhouse';
import { PageContainer } from '@ant-design/pro-layout';
import { getIntl, Link } from 'umi';
import { addRepository } from '@/services/intelligengine';

const IS_GIT_URL_REGEX = /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/;

const intl = getIntl();

export default class RepositoriesManager extends React.Component<any, any> {
  repoFound: boolean = false;

  constructor(props) {
    super(props);
    this.state = {
      repoOptions: [],
      numRepos: -1,
      numDownloadingRepos: 0,
      numCommits: -1,
      numDevelopers: -1,
      numIssues: -1,
      numPRs: -1,
      repoFound: true,
      searchInput: '',
    };

    this.onSearch = this.onSearch.bind(this);
    this.onAddRepo = this.onAddRepo.bind(this);

    runSql(allProjectsSQL(), true).then((result) => {
      const repoOptions = result.data.map((item) => ({
        owner: item.search_key__owner,
        repo: item.search_key__repo,
        origin: item.search_key__origin,
        value: `${item.search_key__owner}/${item.search_key__repo}`,
      }));
      this.setState({ repoOptions });
    });

    runSql(repoCountSql()).then((result) => {
      const numRepos = result.data[0][0];
      this.setState({ numRepos });
    });

    runSql(commitCountSql()).then((result) => {
      const numCommits = result.data[0][0];
      this.setState({ numCommits });
    });

    runSql(developerCountSql()).then((result) => {
      const numDevelopers = result.data[0][0];
      this.setState({ numDevelopers });
    });

    runSql(issueCountSql()).then((result) => {
      const numIssues = result.data[0][0];
      this.setState({ numIssues });
    });

    runSql(prCountSql())
      .then((result) => {
        const numPRs = result.data[0][0];
        this.setState({ numPRs });
      })
      .catch((err) => {
        this.setState({ numPRs: 0 });
      });
  }

  onSearch(inputValue) {
    // this.repoFound is assigned in a single option match scope, it's NOT accurate
    // we should check it here!
    let repoFound = false;
    for (let i = 0; i < this.state.repoOptions.length; ++i) {
      const option = this.state.repoOptions[i];
      if (
        option!.owner.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 ||
        option!.repo.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 ||
        option!.origin.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
      ) {
        repoFound = true;
        break;
      }
    }
    this.setState({ repoFound, searchInput: inputValue });
  }

  onAddRepo() {
    addRepository(this.state.searchInput)
      .then((result) => {
        notification.info({
          message: 'Repo added!',
          description: `Repo ${this.state.searchInput} is added to download list`,
          placement: 'top',
        });
      })
      .catch((e) => {
        let description = `Failed to add ${this.state.searchInput}`;
        switch (e.response.status) {
          case 409:
            description = `${description}: repo already exists`;
            break;
          default:
            description = `${description}: ${e}`;
        }
        notification.error({
          message: 'Failed to add repo!',
          description,
          placement: 'top',
        });
      });
  }

  render() {
    return (
      <PageContainer>
        <Row>
          <Col span={7}>
            <AutoComplete
              style={{ width: 400 }}
              options={this.state.repoOptions}
              placeholder={intl.formatMessage({ id: 'repositoriesManager.inputTip' })}
              filterOption={(inputValue, option) => {
                return (
                  option!.owner.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 ||
                  option!.repo.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 ||
                  option!.origin.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                );
              }}
              onSearch={this.onSearch}
            />
          </Col>
          <Col span={4}>
            {!this.state.repoFound && <Button onClick={this.onAddRepo}>Add</Button>}
          </Col>
        </Row>

        <Divider>{intl.formatMessage({ id: 'repositoriesManager.statistics' })}</Divider>
        <Row>
          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesManager.repositories' })}
                value={this.state.numRepos}
                loading={this.state.numRepos == -1}
              />
            </Card>
          </Col>

          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesManager.repositoriesDownloading' })}
                value={this.state.numDownloadingRepos}
                loading={this.state.numDownloadingRepos == -1}
              />
            </Card>
          </Col>

          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesManager.gitCommits' })}
                value={this.state.numCommits}
                loading={this.state.numCommits == -1}
              />
            </Card>
          </Col>

          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesManager.developers' })}
                value={this.state.numDevelopers}
                loading={this.state.numDevelopers == -1}
              />
            </Card>
          </Col>

          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesManager.githubIssues' })}
                value={this.state.numIssues}
                loading={this.state.numIssues == -1}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesManager.githubPullRequests' })}
                value={this.state.numPRs}
                loading={this.state.numPRs == -1}
              />
            </Card>
          </Col>
        </Row>

        <Divider>{intl.formatMessage({ id: 'repositoriesManager.repositories' })}</Divider>
        <Row gutter={[10, 10]}>
          {this.state.repoOptions.map((option, index) => {
            const { owner, repo } = option;
            const colKey = `col__${owner}__${repo}`;
            return (
              <Col span={4} key={colKey}>
                <Link
                  to={{
                    pathname: '/contrib_distribution',
                    search: `?owner=${owner}&repo=${repo}`,
                  }}
                >
                  <Card style={{ height: 90 }} hoverable>
                    {option.value}
                  </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
      </PageContainer>
    );
  }
}
