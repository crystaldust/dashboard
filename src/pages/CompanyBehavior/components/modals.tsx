import React from 'react';
import { Modal, Table, Typography } from 'antd';
import moment from 'moment';

const { Text } = Typography;

export interface CommitsDataProps {
  commits: object[];
}

interface CommitsModalProps extends CommitsDataProps {
  onCancel: () => void;
  open: boolean;

  company: string;
  project: string;
  owner: string;
  repo: string;
}

class CommitsTable<Props extends CommitsDataProps> extends React.Component<Props, any> {
  static columns = [
    {
      title: 'Author Name',
      dataIndex: 'author_name',
      key: 'author_name',
      render: (text, record) => {
        // TODO get login from SQL
        if (!!record.github_login) {
          return (
            <a href={`https://github.com/${record.github_login}`} target="_blank" rel="noreferrer">
              {text}
            </a>
          );
        }

        return text;
      },
    },
    {
      title: 'Author Email',
      dataIndex: 'author_email',
      key: 'author_email',
    },
    {
      title: 'Authored Date',
      dataIndex: 'authored_date',
      key: 'authored_date',
      sorter: (a, b) => {
        return moment(a.authored_date).unix() - moment(b.authored_date).unix();
      },
    },
    // {
    //   title: 'Timezone',
    //   dataIndex: 'authorTZ',
    //   key: 'authorTZ',
    // },
    {
      title: 'SHA',
      dataIndex: 'hexsha',
      key: 'hexsha',
      render: (text, record) => {
        const { search_key__owner: owner, search_key__repo: repo } = record;
        return (
          <a
            href={`https://github.com/${owner}/${repo}/commit/${text}`}
            target="_blank"
            rel="noreferrer"
          >
            {text.slice(0, 8)}
          </a>
        );
      },
    },
    {
      title: 'Commit Message',
      dataIndex: 'message',
      key: 'message',
      render: (text) => {
        return (
          <Text style={{ width: 600 }} ellipsis={{ tooltip: true }}>
            {text}
          </Text>
        );
      },
    },
  ];

  render() {
    return <Table dataSource={this.props.commits} columns={CommitsTable.columns} />;
  }
}

export class CommitsModal extends React.Component<CommitsModalProps, any> {
  render() {
    return (
      <Modal
        closable={true}
        title={`${this.props.company} Commits on ${this.props.owner}/${this.props.repo}`}
        open={this.props.open}
        onOk={this.props.onOk}
        onCancel={this.props.onCancel}
        width={'100%'}
        footer={null}
      >
        <CommitsTable
          commits={this.props.commits}
          owner={this.props.owner}
          repo={this.props.repo}
        />
      </Modal>
    );
  }
}

export interface ContributorsDataProps {
  contributors: object[];
}

interface ContributorsModalProps extends ContributorsDataProps {
  onCancel: () => void;
  open: boolean;

  company: string;
  project: string;
  owner: string;
  repo: string;
}

class ContributorsTable<Props extends ContributorsDataProps> extends React.Component<Props, any> {
  static columns = [
    {
      title: 'Developer Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        if (record.github) {
          return (
            <a href={`https://github.com/${text}`} target="_blank" rel="noreferrer">
              {text}
            </a>
          );
        }
        return text;
      },
    },
    {
      title: 'GitHub Login',
      dataIndex: 'github_login',
      key: 'github_login',
      render: (text) => {
        return text ? (
          <a href={`https://github.com/${text}`} target="_blank" rel="noreferrer">
            {text}
          </a>
        ) : (
          'Unknown'
        );
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
      sorter: (a, b) => a.total_insertions - b.total_insertions,
    },
    {
      title: 'Total Deletions',
      dataIndex: 'total_deletions',
      key: 'total_deletions',
      sorter: (a, b) => a.total_deletions - b.total_deletions,
    },
    {
      title: 'Total Commits',
      dataIndex: 'commit_count',
      key: 'commit_count',
      sorter: (a, b) => a.commit_count - b.commit_count,
    },
    {
      title: 'Committed Lines of Code',
      dataIndex: 'total_commit_lines',
      key: 'total_commit_lines',
      sorter: (a, b) => a.total_commit_lines - b.total_commit_lines,
    },
  ];

  constructor(props: Props) {
    super(props);
    this.state = {
      commits: props.contributors || [],
    };
  }

  render() {
    return <Table dataSource={this.props.contributors} columns={ContributorsTable.columns} />;
  }
}

export class ContributorsModal extends React.Component<ContributorsModalProps, any> {
  render() {
    return (
      <Modal
        closable={true}
        title={`${this.props.company} Contributors on ${this.props.owner}/${this.props.repo}`}
        open={this.props.open}
        onOk={this.props.onOk}
        onCancel={this.props.onCancel}
        width={'100%'}
        footer={null}
      >
        <ContributorsTable contributors={this.props.contributors} />
      </Modal>
    );
  }
}
