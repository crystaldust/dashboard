import React from 'react';
import { Card, Select, Table } from 'antd';
import { runSql } from '@/services/clickhouse';
import { UNIQ_OWNER_REPOS_SQL } from '@/pages/CompanyBehavior/sql';

export interface CommitsTableProps {
  commits: object[];
}

export interface CompanyContribSummaryProps {
  company: string;
  dateRange: string[2];
  numCommits: number;
  numAuthors: number;
  numAddedLoC: number;
  numDeletedLoC: number;
  numFiles: number;
}

export class ProjectSelector extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      projectOptions: [],
    };
    this.onProjectChange = this.onProjectChange.bind(this);
  }

  async componentDidMount() {
    const result = await runSql(UNIQ_OWNER_REPOS_SQL);
    console.log(result);
    const options = result.data.map((item) => {
      console.log('item:', item);
      return {
        label: item.join('/'),
        value: item.join('/'),
        owner: item[0],
        repo: item[1],
      };
    });
    this.setState({
      projectOptions: options,
    });
  }

  onProjectChange(_, option) {
    const { owner, repo } = option;
    if (this.props.hasOwnProperty('onProjectSelect')) {
      this.props.onProjectSelect(owner, repo);
    }
  }

  autoCompleteFilter(inputValue, option) {
    // return option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
    return option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
  }

  render() {
    return (
      <Select
        showSearch
        style={{ width: '200px' }}
        options={this.state.projectOptions}
        placeholder="Project"
        onChange={this.onProjectChange}
        filterOption={this.autoCompleteFilter}
        value={this.state.project || undefined}
      />
    );
  }
}

export class CommitsTable<Props extends CommitsTableProps> extends React.Component<Props, any> {
  static columns = [
    {
      title: 'Author Name',
      dataIndex: 'authorName',
      key: 'authorName',
    },
    {
      title: 'Author Email',
      dataIndex: 'authorEmail',
      key: 'authorEmail',
    },
    {
      title: 'Authored Date',
      dataIndex: 'authoredDate',
      key: 'authoredDate',
    },

    {
      title: 'SHA',
      dataIndex: 'sha',
      key: 'sha',
    },

    // {
    //   title: 'Dirs',
    //   dataIndex: 'dirs',
    //   key: 'dirs',
    // },
  ];

  constructor(props: Props) {
    super(props);
    this.state = {
      commits: props.commits || [],
    };
  }

  render() {
    return <Table dataSource={this.props.commits} columns={CommitsTable.columns} />;
  }
}

export class CompanyContribSummary<
  Props extends CompanyContribSummaryProps,
> extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
    this.state = {
      company: props.company,
      dateRange: props.dateRange,
      numCommits: props.numCommits,
      numAuthors: props.numAuthors,
      numAddedLoC: props.numAddedLoC,
      numDeletedLoC: props.numDeletedLoC,
      numFiles: props.numFiles,
    };

    this.summaryString = this.summaryString.bind(this);
  }

  summaryString() {
    const { company, dateRange, numCommits, numAuthors, numAddedLoC, numDeletedLoC, numFiles } =
      this.props;
    // TODO Compile the summary by string templates for different languages.
    return ` ${company}'s ${numAuthors} contributors made ${numCommits} commits from ${dateRange[0]} to
        ${dateRange[1]}, added ${numAddedLoC} lines of code, and deleted
        ${numDeletedLoC} lines of code, making changes to ${numFiles} files.`;
  }

  render() {
    return (
      <Card>
        <b>{this.summaryString()}</b>
      </Card>
    );
  }
}
