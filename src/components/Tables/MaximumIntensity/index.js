import { Table } from 'antd';
import React, { useState, useEffect } from 'react';
import { request } from '@@/plugin-request/request';
import { getMaximumIntensity } from '@/services/influence_metrics/contribution';

const Index = (props) => {
  // row['repo'], row['page_rank'], row['betweenness_centrality'], row['closeness_centrality'], row['total_score']
  const { api_path } = props;

  const [dataSource, setData] = useState([]);
  useEffect(() => {
    // request('http://127.0.0.1:5000'+'/metric/get_person_metrics')
    getMaximumIntensity().then((json) => {
      setData(json);
    });
  }, []);
  const columns = [
    {
      title: 'email',
      dataIndex: 'email',
      key: 'email',
      // render:(text)=>{
      //   <a onClick={}></a>
      // }
    },
    {
      title: 'total_fix_commit_count',
      dataIndex: 'total_fix_commit_count',
      key: 'total_fix_commit_count',
    },
    {
      title: 'maximum_fix_commit_count',
      dataIndex: 'maximum_fix_commit_count',
      key: 'maximum_fix_commit_count',
    },
    {
      title: 'fist_year_joined_repo_count',
      dataIndex: 'fist_year_joined_repo_count',
      key: 'fist_year_joined_repo_count',
    },
  ];

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} />;
    </div>
  );
};

export default Index;
