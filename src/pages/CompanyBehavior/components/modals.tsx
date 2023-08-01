import React from 'react';
import { Modal, Table } from 'antd';
import { Switch, Typography } from 'antd';
import moment from 'moment';

const { Paragraph, Text } = Typography;

export interface CommitsDataProps {
  commits: object[];
}

interface CommitsModalProps extends CommitsDataProps {
  onCancel: () => void;
  open: boolean;

  company: string;
  project: string;
}

class CommitsTable<Props extends CommitsDataProps> extends React.Component<Props, any> {
  static columns = [
    {
      title: 'Author Name',
      dataIndex: 'authorName',
      key: 'authorName',
      render: (text, record) => {
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
      dataIndex: 'authorEmail',
      key: 'authorEmail',
    },
    {
      title: 'Authored Date',
      dataIndex: 'authoredDate',
      key: 'authoredDate',
    },
    // {
    //   title: 'Timezone',
    //   dataIndex: 'authorTZ',
    //   key: 'authorTZ',
    // },
    {
      title: 'SHA',
      dataIndex: 'sha',
      key: 'sha',
      render: (text) => {
        return (
          <a
            href={`https://github.com/pytorch/pytorch/commit/${text}`}
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
    //                 authorName: item[6],
    //                 authorEmail: item[4],
    //                 authoredDate: item[5],
    //                 authorTZ: item[6],
    //                 sha: item[2],
    //                 message: item[3],

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

export class CommitsModal extends React.Component<CommitsModalProps, any> {
  render() {
    return (
      <Modal
        closable={true}
        title={`${this.props.company} Commits on ${this.props.project}`}
        open={this.props.open}
        onOk={this.props.onOk}
        onCancel={this.props.onCancel}
        width={'100%'}
        footer={null}
      >
        <CommitsTable commits={this.props.commits} />
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
        title={`${this.props.company} Contributors on ${this.props.project}`}
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
