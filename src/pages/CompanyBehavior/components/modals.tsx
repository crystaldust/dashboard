import React from 'react';
import { Modal, Table } from 'antd';

export interface CommitsDataProps {
  commits: object[];
}

interface CommitsModalProps extends CommitsDataProps {
  onCancel: () => void;
  visible: boolean;

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
    {
      title: 'Timezone',
      dataIndex: 'authorTZ',
      key: 'authorTZ',
    },
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
        visible={this.props.visible}
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
  visible: boolean;

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
        visible={this.props.visible}
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
