import { Col, DatePicker, Row } from 'antd';
import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { runSql } from '@/services/clickhouse';
import { companyListSql, dirListSql } from './sql';
import { CompaniesTable, ProjectSelector } from '@/pages/CompanyBehavior/components';
import { pathsToTree } from '@/pages/ContribDistribution/DataProcessors';
import SecondaryDirSelector from '@/pages/ContribDistribution/SecondaryDirSelector';
import { secondaryDirSql } from '@/pages/ContribDistribution/DataSQLs';

const { RangePicker } = DatePicker;

export default class CompanyBehavior extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      project: {},
    };

    this.onProjectSelect = this.onProjectSelect.bind(this);
    this.onDateRangeChanged = this.onDateRangeChanged.bind(this);
    // this.onCompanySelect = this.onCompanySelect.bind(this);
    this.onDirSelect = this.onDirSelect.bind(this);
  }

  onProjectSelect(owner, repo) {
    this.setState({
      project: {
        owner,
        repo,
      },
    });

    // runSql(dirListSql(owner, repo)).then((result) => {
    runSql(secondaryDirSql(owner, repo)).then((result) => {
      const dirData = pathsToTree(result.data.map((item) => item[0]));
      console.log('ouyyyya', dirData);
      this.setState({
        dirData,
      });
    });
  }

  onDirSelect() {
    console.log('dir selected', arguments);
  }

  onDateRangeChanged(_, dateStrs: string[]) {
    // Format '%YYYY-%MM' in clickhouse doesn't work, add the 'day one' suffix

    const { owner, repo } = this.state.project;
    // From '2021-01' to 202101
    const from = parseInt(dateStrs[0].replaceAll('-', ''));
    const to = parseInt(dateStrs[0].replaceAll('-', ''));

    this.setState({
      loadingCompanies: true,
      dateRange: dateStrs,
      companies: [],
      company: undefined,
      from,
      to,
    });
    const dateRange = {
      from,
      to,
    };
    runSql(companyListSql(owner, repo, dateRange, '', 'commit_count')).then((result) => {
      const companyList = result.data.map((item) => {
        return { company: item[2], contributor_count: item[3], commit_count: item[4] };
      });
      this.setState({
        // loadingCompanies: false,
        companies: companyList,
      });
    });
  }

  // onCompanySelect(company: string) {
  //   this.setState({
  //     company,
  //   });
  //   const { owner, repo } = this.state.project;
  //   const { from, to } = this.state;
  //
  //   runSql(dirCommitsSql(owner, repo, from, to, company)).then((result) => {
  //     console.log('result:', result);
  //     this.setState({
  //       commits: result.data.map((item: any[]) => {
  //         return {
  //           authorName: item[0],
  //           authorEmail: item[1],
  //           authoredDate: item[2],
  //           sha: item[3],
  //           // dirs: item[3].join(',  '),
  //         };
  //       }),
  //     });
  //   });
  // }

  render() {
    return (
      <PageContainer>
        <Row align={'left'} gutter={4}>
          <Col span={6}>
            <Row>
              <ProjectSelector onProjectSelect={this.onProjectSelect} />
            </Row>

            <Row>
              {!!this.state.project && (
                <RangePicker
                  onChange={this.onDateRangeChanged}
                  picker="month"
                  // value={
                  //   this.state.dateRangeSelection && this.since && this.until
                  //     ? [moment(this.since), moment(this.until)]
                  //     : [null, null]
                  // }
                />
              )}
            </Row>

            <Row>
              {/*{!!this.state.project && (*/}
              <SecondaryDirSelector
                dirData={this.state.dirData}
                onDirSelect={this.onDirSelect}
                // repo={this.state.repo}
                // selectedDirs={this.state.selectedDirs}
              />
              {/*)}*/}
            </Row>
          </Col>

          <Col span={18}>
            {/*{!!this.state.companies && (*/}
            <CompaniesTable
              companies={this.state.companies}
              owner={this.state.project.owner}
              repo={this.state.project.repo}
              dateRange={{ from: this.state.from, to: this.state.to }}
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
