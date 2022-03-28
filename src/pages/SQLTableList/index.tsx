import React from 'react';
import { Button, Tooltip } from 'antd';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
// import { ClickHouse } from 'services/clickhouse/typings';
import { getClickhouseResult } from '@/services/clickhouse';

const valueEnum = {
  0: 'close',
  1: 'running',
  2: 'online',
  3: 'error',
};

const tableListDataSource: ClickHouse.Activity[] = [];

for (let i = 0; i < 5; i += 1) {
  tableListDataSource.push({
    owner: 'kubernetes',
    repo: 'kubernetes',
    githubLogin: i,
    knowledgeSharing: Math.floor(Math.random() * 20),
    codeContribution: Math.floor(Math.random() * 20),
    issueCoordination: Math.floor(Math.random() * 20),
    progressControl: Math.floor(Math.random() * 20),
    codeTweaking: Math.floor(Math.random() * 20),
    issueReporting: Math.floor(Math.random() * 20),
  });
}

const columns: ProColumns<TableListItem>[] = [
  {
    title: 'Owner',
    width: 80,
    dataIndex: 'owner',
    valueType: 'select',
    request: async () => {
      let result = await getClickhouseResult('SELECT DISTINCT owner FROM activities');
      let owners = [];
      result.forEach((item) => {
        owners.push(new ClickHouse());
      });
      console.log('owners:', owners);
      return {
        data: owners,
        success: true,
      };
    },
    render: (_) => <a>{_}</a>,
  },
  {
    title: 'Repo',
    dataIndex: 'repo',
    align: 'left',
    width: 80,
    valueType: 'select',
    // valueEnum: {
    //   kubernetes: {
    //     text: 'kubernetes',
    //     status: 'kubernetes',
    //   },
    // },
    request: async () => {
      let result = await getClickhouseResult('SELECT DISTINCT repo FROM activities');
      let repos = {};
      result.forEach((item) => {
        const repo: string = item[0];
        // const act: ClickHouse.Activity = {
        //   owner: '',
        //   repo: repo,
        // };
        repos[repo] = {
          text: repo,
          status: repo,
        };
      });
      console.log('repo:', repos);
      return repos;
      // return {
      //   data: repos,
      //   success: true,
      // };
    },
    // sorter: (a, b) => a.containers - b.containers,
  },
  {
    title: 'GitHub Login',
    // width: 80,
    dataIndex: 'githubLogin',
    search: false,
  },
  {
    title: 'KnowledgeSharing',
    width: 80,
    dataIndex: 'knowledgeSharing',
    search: false,
  },
  {
    title: 'CodeContribution',
    width: 140,
    dataIndex: 'codeContribution',
    search: false,
  },
  {
    title: 'IssueCoordination',
    dataIndex: 'issueCoordination',
    search: false,
    // ellipsis: true,
    // copyable: true,
  },
  {
    title: 'ProgressControl',
    width: 180,
    key: 'progressControl',
    search: false,
    // valueType: 'option',
    // render: () => [
    //   <a key="link">链路</a>,
    //   <a key="link2">报警</a>,
    //   <a key="link3">监控</a>,
    //   <TableDropdown
    //     key="actionGroup"
    //     menus={[
    //       { key: 'copy', name: '复制' },
    //       { key: 'delete', name: '删除' },
    //     ]}
    //   />,
    // ],
  },
  {
    title: 'CodeTweaking',
    width: 180,
    key: 'codeTweaking',
    search: false,
  },
  {
    title: 'IssueReporting',
    width: 180,
    key: 'issueReporting',
    search: false,
  },
];

export default () => {
  return (
    <ProTable<ClickHouse.Activity>
      columns={columns}
      // request={() => {
      //   let result = getClickhouseResult('SELECT * FROM activities LIMIT 100');
      //   console.log('result', result);
      //   return {
      //     data: [],
      //     success: true,
      //   };
      // }}
      // request={(params, sorter, filter) => {
      //   // 表单搜索项会从 params 传入，传递给后端接口。
      //   console.log(params, sorter, filter);
      //   return Promise.resolve({
      //     data: tableListDataSource,
      //     success: true,
      //   });
      // }}
      rowKey="repo"
      pagination={{
        showQuickJumper: true,
      }}
      search={{
        optionRender: false,
        collapsed: false,
      }}
      dateFormatter="string"
      headerTitle="表格标题"
      toolBarRender={() => [
        <Button key="show">查看日志</Button>,
        <Button key="out">
          导出数据
          <DownOutlined />
        </Button>,
        <Button type="primary" key="primary">
          创建应用
        </Button>,
      ]}
    />
  );
};
