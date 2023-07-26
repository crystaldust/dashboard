import { Col, DatePicker, Row, Select } from 'antd';
import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { runSql } from '@/services/clickhouse';
import { companyListSql, dirCommitsSql } from './sql';
import {
  CommitsTable,
  CompanyContribSummary,
  ProjectSelector,
} from '@/pages/CompanyBehavior/components';

const { RangePicker } = DatePicker;

export default class CompanyBehavior extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      loadingData: false,
      commits: undefined,
    };

    this.onProjectSelect = this.onProjectSelect.bind(this);
    this.onDateRangeChanged = this.onDateRangeChanged.bind(this);
    this.onCompanySelect = this.onCompanySelect.bind(this);
  }

  onProjectSelect(owner, repo) {
    this.setState({
      project: {
        owner,
        repo,
      },
    });
    console.log('selected: ', owner, repo);
  }

  onDateRangeChanged(_, dateStrs: string[]) {
    // Format '%YYYY-%MM' in clickhouse doesn't work, add the 'day one' suffix
    console.log(dateStrs);

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

    runSql(companyListSql(owner, repo, from, to)).then((result) => {
      const companyList = result.data.map((item) => {
        return { value: item[0], label: item[0] };
      });
      console.log('companyList:', companyList);
      this.setState({
        loadingCompanies: false,
        companies: companyList,
      });
    });
  }

  onCompanySelect(company: string) {
    this.setState({
      company,
    });
    const { owner, repo } = this.state.project;
    const { from, to } = this.state;

    runSql(dirCommitsSql(owner, repo, from, to, company)).then((result) => {
      console.log('result:', result);
      this.setState({
        commits: result.data.map((item: any[]) => {
          return {
            authorName: item[0],
            authorEmail: item[1],
            authoredDate: item[2],
            sha: item[3],
            // dirs: item[3].join(',  '),
          };
        }),
      });
    });
  }

  render() {
    return (
      <PageContainer>
        <Row align={'middle'}>
          <Col span={6.5}>
            Select project:
            <ProjectSelector onProjectSelect={this.onProjectSelect} />
          </Col>

          <Col span={4}>
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
          </Col>

          <Col span={4}>
            {!!this.state.dateRange && (
              <Select
                loading={this.state.loadingCompanies}
                showSearch
                style={{ width: '200px' }}
                options={this.state.companies}
                onSelect={this.onCompanySelect}
                value={this.state.company || undefined}
                // placeholder={intl.formatMessage({ id: 'contribDist.placeholder.owner' })}
                // onChange={this.onOwnerChange}
                // onSelect={this.onOwnerSelect}
                // filterOption={this.autoCompleteFilter}
                // value={this.state.owner || undefined}
              />
            )}
          </Col>
        </Row>

        {!!this.state.commits && (
          <Row>
            <Col span={24}>
              <CompanyContribSummary
                company={this.state.company}
                dateRange={this.state.dateRange}
                numCommits={this.state.commits.length}
                numAuthors={100}
                numAddedLoC={100}
                numDeletedLoC={100}
                numFiles={20}
              />
            </Col>
          </Row>
        )}
        {!!this.state.commits && (
          <Row>
            <Col span={24}>
              <CommitsTable commits={this.state.commits} />
            </Col>
          </Row>
        )}
      </PageContainer>
    );
  }
}
