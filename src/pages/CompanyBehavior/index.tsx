import { Col, DatePicker, Row } from 'antd';
import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { runSql } from '@/services/clickhouse';
import { commitsCountSql, companyListSql } from './sql';
import { CompaniesTable, ProjectSelector } from '@/pages/CompanyBehavior/components';
import { pathsToTree } from '@/pages/ContribDistribution/DataProcessors';
import SecondaryDirSelector from '@/pages/ContribDistribution/SecondaryDirSelector';
import { secondaryDirSql } from '@/pages/ContribDistribution/DataSQLs';

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

    function companyListPromise() {
      return runSql(companyListSql(owner, repo, dateRange, dir, order)).then((result) => {
        const companyList = result.data.map((item) => {
          const companyInfo = {};
          result.columns.forEach((col: string[], index: number) => {
            companyInfo[col[0]] = item[index];
          });
          companyInfo.key = `company__${companyInfo.author_company}`;
          return companyInfo;
        });

        return companyList;
      });
    }

    function commitCountPromise() {
      return runSql(commitsCountSql(owner, repo, dateRange, dir)).then((result) => {
        return result.data[0][0];
      });
    }

    Promise.all([companyListPromise(), commitCountPromise()]).then((result) => {
      const companyList = result[0];
      const commitsCount = result[1];
      const totalCount = companyList.reduce((result, concurrent) => {
        return result + concurrent.commit_count;
      }, 0);

      let coverage = ((totalCount / commitsCount) * 100).toFixed(2);
      let coverageIntro = `The statistics is computed by ${coverage}% of total commits(${totalCount}/${commitsCount})`;
      if (dir) {
        coverageIntro += `on ${dir}/`;
      }
      if (dateRange) {
        coverageIntro += `, from ${dateRange.from} to ${dateRange.to}`;
      }

      if (!commitsCount || !totalCount) {
        coverageIntro = ''; // If there are no commits, the intro text is not displayed either
      }

      this.setState({
        companies: companyList,
        loading: false,
        coverageIntro,
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
            {this.state.coverageIntro}
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
