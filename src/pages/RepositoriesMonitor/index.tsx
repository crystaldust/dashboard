import React from 'react';
import { AutoComplete, Card, Col, Divider, Row, Statistic } from 'antd';
import {
  allProjectsSQL,
  commitCountSql,
  developerCountSql,
  issueCountSql,
  prCountSql,
  repoCountSql,
} from '@/pages/RepositoriesMonitor/DataSQLs';
import { runSql } from '@/services/clickhouse';
import { PageContainer } from '@ant-design/pro-layout';
import { getIntl } from 'umi';

const intl = getIntl();

export default class AddRepository extends React.Component<any, any> {
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
    };

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

  onSearch(value) {
    console.log('onSearch.value:', value);
  }

  render() {
    return (
      <PageContainer>
        <Row>
          <Col span={20}>
            <AutoComplete
              style={{ width: 400 }}
              options={this.state.repoOptions}
              placeholder={intl.formatMessage({ id: 'repositoriesMonitor.inputTip' })}
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
        </Row>

        <Divider>{intl.formatMessage({ id: 'repositoriesMonitor.statistics' })}</Divider>
        <Row>
          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesMonitor.repositories' })}
                value={this.state.numRepos}
                loading={this.state.numRepos == -1}
              />
            </Card>
          </Col>

          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesMonitor.repositoriesDownloading' })}
                value={this.state.numDownloadingRepos}
                loading={this.state.numDownloadingRepos == -1}
              />
            </Card>
          </Col>

          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesMonitor.gitCommits' })}
                value={this.state.numCommits}
                loading={this.state.numCommits == -1}
              />
            </Card>
          </Col>

          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesMonitor.developers' })}
                value={this.state.numDevelopers}
                loading={this.state.numDevelopers == -1}
              />
            </Card>
          </Col>

          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesMonitor.githubIssues' })}
                value={this.state.numIssues}
                loading={this.state.numIssues == -1}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title={intl.formatMessage({ id: 'repositoriesMonitor.githubPullRequests' })}
                value={this.state.numPRs}
                loading={this.state.numPRs == -1}
              />
            </Card>
          </Col>
        </Row>

        <Divider>{intl.formatMessage({ id: 'repositoriesMonitor.repositories' })}</Divider>
        <Row>
          {this.state.repoOptions.map((option) => {
            return (
              <Col span={4}>
                <a href={option.origin} target={'_blank'}>
                  <Card>{option.value}</Card>
                </a>
              </Col>
            );
          })}
        </Row>
      </PageContainer>
    );
  }
}