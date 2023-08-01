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
  setLoadingState: (loading: boolean) => void;
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
      dataIndex: 'author_company',
      key: 'author_company',
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
      dataIndex: 'total_insertions',
      key: 'total_insertions',
      render: (numInsertions: number) => (
        <div>{numInsertions.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
      ),
      sorter: (a, b) => a.total_insertions - b.total_insertions,
    },
    {
      title: 'Total Deletions',
      dataIndex: 'total_deletions',
      key: 'total_deletions',
      render: (numDeletions: number) => (
        <div>{numDeletions.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
      ),
      sorter: (a, b) => a.total_deletions - b.total_deletions,
    },
    {
      title: 'Lines of Code',
      dataIndex: 'total_commit_lines',
      key: 'total_commit_lines',
      render: (loc: number) => <div>{loc.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>,
      sorter: (a, b) => a.total_commit_lines - b.total_commit_lines,
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
          if (this.props.hasOwnProperty('setLoadingState')) {
            this.props.setLoadingState(true);
          }
          runSql(commitsSql(owner, repo, data.author_company, dateRange, dir)).then((result) => {
            const commits = result.data.map((item) => {
              const commitInfo = {};
              result.columns.forEach((col: string[], index: number) => {
                commitInfo[col[0]] = item[index];
              });
              commitInfo.key = `commit__${commitInfo.hexsha}`;
              return commitInfo;
            });

            this.setState({
              loadingCompanies: false,
              showCommits: true,
              showContributors: false,
              company: data.company,
              commits,
            });
            if (this.props.hasOwnProperty('setLoadingState')) {
              this.props.setLoadingState(false);
            }
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
          if (this.props.hasOwnProperty('setLoadingState')) {
            this.props.setLoadingState(true);
          }
          runSql(contributorsSql(owner, repo, data.author_company, dateRange, dir)).then(
            (result) => {
              const contributors = result.data.map((item) => {
                const contributorInfo = {};
                result.columns.forEach((col: string[], index: number) => {
                  contributorInfo[col[0]] = item[index];
                });

                contributorInfo.name = contributorInfo.names[0] || 'Unknown';
                contributorInfo.github_login = contributorInfo.contributor[0] || undefined;
                contributorInfo.key = `contributor__${contributorInfo.name}__${contributorInfo.github_login}`;

                return contributorInfo;
              });

              this.setState({
                showCommits: false,
                showContributors: true,
                company: data.company,
                contributors,
              });
              if (this.props.hasOwnProperty('setLoadingState')) {
                this.props.setLoadingState(false);
              }
            },
          );
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
          // project={`${this.props.owner}/${this.props.repo}`}
          owner={this.props.owner}
          repo={this.props.repo}
          commits={this.state.commits}
        />

        <ContributorsModal
          onCancel={() => {
            this.setState({ showContributors: false });
          }}
          open={this.state.showContributors}
          company={this.state.company}
          // project={`${this.props.owner}/${this.props.repo}`}
          owner={this.props.owner}
          repo={this.props.repo}
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
