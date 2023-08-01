import React from 'react';
import { Card, Select, Table } from 'antd';
import { runSql } from '@/services/clickhouse';
import { commitsSql, contributorsSql, UNIQ_OWNER_REPOS_SQL } from '@/pages/CompanyBehavior/sql';
import { CommitsModal, ContributorsModal } from '@/pages/CompanyBehavior/components/modals';
import moment from 'moment';

export interface CompaniesTableProps {
  companies: object[];
  owner: string;
  repo: string;
  showCommits: (company: string) => void;
  showContributors: (company: string) => void;
}

export interface CompanyContribSummaryProps {
  company: string;
  dateRange: number[2];
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
      owner: '',
      repo: '',
    };
    this.onProjectChange = this.onProjectChange.bind(this);
  }

  async componentDidMount() {
    const result = await runSql(UNIQ_OWNER_REPOS_SQL);
    const options = result.data.map((item) => {
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

    this.setState({
      owner,
      repo,
    });
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

export class CompaniesTable<Props extends CompaniesTableProps> extends React.Component<Props, any> {
  static columns = [
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Commits',
      dataIndex: 'commit_count',
      key: 'commit_count',
      render: (numCommits: number) => (
        <a>{numCommits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</a>
      ),
      modal: 'showCommits',
      sorter: (a, b) => {
        return a.commit_count - b.commit_count;
      },
    },
    {
      title: 'Contributors',
      dataIndex: 'contributor_count',
      key: 'contributor_count',
      render: (numContributors: number) => (
        <a>{numContributors.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</a>
      ),
      modal: 'showContributors',
      sorter: (a, b) => {
        return a.contributor_count - b.contributor_count;
      },
    },
    {
      title: 'Last Active',
      dataIndex: 'last_active_time',
      key: 'last_active_time',
      sorter: (a, b) => {
        return moment(a.last_active_time).unix() - moment(b.last_active_time).unix();
      },
    },
    {
      title: 'Total Insertions',
      dataIndex: 'insertions',
      key: 'insertions',
      render: (numInsertions: number) => (
        <div>{numInsertions.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
      ),
      sorter: (a, b) => a.insertions - b.insertions,
    },
    {
      title: 'Total Deletions',
      dataIndex: 'deletions',
      key: 'deletions',
      render: (numDeletions: number) => (
        <div>{numDeletions.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
      ),
      sorter: (a, b) => a.deletions - b.deletions,
    },
    {
      title: 'Lines of Code',
      dataIndex: 'loc',
      key: 'loc',
      render: (loc: number) => <div>{loc.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>,
      sorter: (a, b) => a.loc - b.loc,
    },
  ];

  constructor(props: Props) {
    super(props);

    this.state = {
      showCommits: false,
      showContributors: false,
    };

    this.genCols = this.genCols.bind(this);
    this.commitsModalCb = this.commitsModalCb.bind(this);
    this.contributorsModalCb = this.contributorsModalCb.bind(this);
  }

  commitsModalCb(data) {
    {
      const { owner, repo, dateRange, dir } = this.props;
      return {
        onClick: () => {
          runSql(commitsSql(owner, repo, data.company, dateRange, dir)).then((result) => {
            const commits = result.data.map((item) => {
              return {
                authorName: item[6],
                authorEmail: item[4],
                authoredDate: item[5],
                authorTZ: item[6],
                sha: item[2],
                message: item[3],
                // github_login: item[7],
              };
            });
            this.setState({
              showCommits: true,
              showContributors: false,
              company: data.company,
              commits,
            });
          });
        },
      };
    }
  }

  contributorsModalCb(data) {
    {
      const { owner, repo, dateRange, dir } = this.props;
      return {
        onClick: () => {
          runSql(contributorsSql(owner, repo, data.company, dateRange, dir)).then((result) => {
            const contributors = result.data.map((item) => {
              const name_s = item[2];
              let name = name_s;
              const ret = {
                last_active_time: moment(item[3]).format('YYYY-MM-DD HH:mm:ss'),
                insertions: item[4],
                deletions: item[5],
                loc: item[6],
                commit_count: item[7],
              };

              try {
                name = JSON.parse(name_s.replaceAll("'", '"'))[0];
                ret.github = true;
              } catch (e) {
                console.log(e, name_s);
              }
              ret.name = name;

              return ret;
            });
            this.setState({
              showCommits: false,
              showContributors: true,
              company: data.company,
              contributors,
            });
          });
        },
      };
    }
  }

  genCols() {
    return CompaniesTable.columns.map((col) => {
      // TODO Implement onCells for different modal
      if (col.hasOwnProperty('modal')) {
        if (col.modal == 'showCommits') {
          col.onCell = this.commitsModalCb;
        } else if (col.modal == 'showContributors') {
          col.onCell = this.contributorsModalCb;
        } else {
          console.warn('Unexpected modal', col.modal);
        }
      }
      return col;
    });
  }

  render() {
    return (
      <div>
        <Table
          dataSource={this.props.companies}
          columns={this.genCols()}
          loading={this.props.loading}
        />

        <CommitsModal
          onCancel={() => {
            this.setState({ showCommits: false });
          }}
          open={this.state.showCommits}
          company={this.state.company}
          project={`${this.props.owner}/${this.props.repo}`}
          commits={this.state.commits}
        />

        <ContributorsModal
          onCancel={() => {
            this.setState({ showContributors: false });
          }}
          open={this.state.showContributors}
          company={this.state.company}
          project={`${this.props.owner}/${this.props.repo}`}
          contributors={this.state.contributors}
        />
      </div>
    );
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
