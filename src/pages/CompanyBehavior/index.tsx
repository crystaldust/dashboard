import { Col, DatePicker, Row } from 'antd';
import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { runSql } from '@/services/clickhouse';
import { companyListSql } from './sql';
import { CompaniesTable, ProjectSelector } from '@/pages/CompanyBehavior/components';
import { pathsToTree } from '@/pages/ContribDistribution/DataProcessors';
import SecondaryDirSelector from '@/pages/ContribDistribution/SecondaryDirSelector';
import { secondaryDirSql } from '@/pages/ContribDistribution/DataSQLs';
import moment from 'moment';

import { Divider, Tree } from 'antd';

const { DirectoryTree } = Tree;
const { RangePicker } = DatePicker;

export default class CompanyBehavior extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      // project: {},
      selectedDir: '',
      selectedDirs: [],
      loading: false,
    };

    this.onProjectSelect = this.onProjectSelect.bind(this);
    this.onDateRangeChanged = this.onDateRangeChanged.bind(this);
    this.onDirSelect = this.onDirSelect.bind(this);
    this.loadCompanies = this.loadCompanies.bind(this);
    this.setLoadingState = this.setLoadingState.bind(this);
  }

  setLoadingState(loading: boolean = false) {
    this.setState({
      loading,
    });
  }

  onProjectSelect(owner, repo) {
    this.setState({
      project: {
        owner,
        repo,
      },
      selectedDir: '',
      selectedDirs: [],
    });

    // runSql(dirListSql(owner, repo)).then((result) => {
    runSql(secondaryDirSql(owner, repo)).then((result) => {
      const dirData = pathsToTree(result.data.map((item) => item[0]));
      this.setState({
        dirData,
      });
    });
    this.loadCompanies(owner, repo, this.state.dateRange, '');
  }

  loadCompanies(owner, repo, dateRange, dir, order = 'commit_count') {
    // TODO mark as loading
    this.setState({
      loading: true,
    });
    runSql(companyListSql(owner, repo, dateRange, dir, order)).then((result) => {
      const companyList = result.data.map((item) => {
        return {
          key: `company__${item[2]}`,
          company: item[2],
          contributor_count: item[3],
          commit_count: item[4],
          last_active_time: moment(item[5]).format('YYYY-MM-DD HH:mm:ss'),
          insertions: item[6],
          deletions: item[7],
          loc: item[8],
        };
      });
      this.setState({
        companies: companyList,
        loading: false,
      });
    });
  }

  onDirSelect(selectedDirs: string[]) {
    // The state update on selectedDirs is just used for dir tree display(show selection)
    this.setState({
      selectedDirs,
      selectedDir: selectedDirs.length ? selectedDirs[0] : '',
    });
    const { owner, repo } = this.state.project;
    this.loadCompanies(owner, repo, this.state.dateRange, selectedDirs[0]);
  }

  onDateRangeChanged(_, dateStrs: string[]) {
    const { owner, repo } = this.state.project;
    const from = parseInt(dateStrs[0].replaceAll('-', ''));
    const to = parseInt(dateStrs[1].replaceAll('-', ''));
    const dateRange = isNaN(from) || isNaN(to) ? null : { from, to };

    this.setState({
      dateRange,
      companies: [],
      company: undefined,
      from,
      to,
    });

    this.loadCompanies(owner, repo, dateRange, this.state.selectedDir);
  }

  render() {
    return (
      <PageContainer>
        <Row align={'left'}>
          <Col span={5}>
            <Row>
              <Col span={24}>
                <ProjectSelector onProjectSelect={this.onProjectSelect} />
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                {!!this.state.project && (
                  <RangePicker
                    onChange={this.onDateRangeChanged}
                    picker="month"
                    style={{ width: '75%' }}
                  />
                )}
              </Col>
            </Row>

            <Row>
              <Col span={18}>
                {!!this.state.project && (
                  <SecondaryDirSelector
                    multiple={false}
                    dirData={this.state.dirData}
                    onDirSelect={this.onDirSelect}
                    // repo={this.state.repo}
                    selectedDirs={this.state.selectedDirs}
                  />
                )}
              </Col>
            </Row>
          </Col>

          <Col span={18}>
            {/*{!!this.state.companies && (*/}
            <CompaniesTable
              companies={this.state.companies}
              owner={this.state.project && this.state.project.owner}
              repo={this.state.project && this.state.project.repo}
              dateRange={this.state.dateRange}
              dir={this.state.selectedDir}
              loading={this.state.loading}
              setLoadingState={this.setLoadingState}
            />
            {/*)}*/}
          </Col>
        </Row>

        {/*{!!this.state.commits && (*/}
        {/*  <Row>*/}
        {/*    <Col span={24}>*/}
        {/*      <CompanyContribSummary*/}
        {/*        company={this.state.company}*/}
        {/*        dateRange={this.state.dateRange}*/}
        {/*        numCommits={this.state.commits.length}*/}
        {/*        numAuthors={100}*/}
        {/*        numAddedLoC={100}*/}
        {/*        numDeletedLoC={100}*/}
        {/*        numFiles={20}*/}
        {/*      />*/}
        {/*    </Col>*/}
        {/*  </Row>*/}
        {/*)}*/}
        {/*{!!this.state.commits && (*/}
        {/*  <Row>*/}
        {/*    <Col span={24}>*/}
        {/*      <CommitsTable commits={this.state.commits} />*/}
        {/*    </Col>*/}
        {/*  </Row>*/}
        {/*)}*/}
      </PageContainer>
    );
  }
}
