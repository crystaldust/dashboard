import {Table} from "antd";
import React,{useState,useEffect} from 'react';
import {request} from "@@/plugin-request/request";


const Index = (props) => {
  // row['repo'], row['page_rank'], row['betweenness_centrality'], row['closeness_centrality'], row['total_score']
  const {api_path} = props

  const [dataSource,setData] = useState([]);
  useEffect(()=>{
    request('http://127.0.0.1:5000'+'/metric/get_centrality_score').then(
      (json)=>{
        setData(json)
      }
    )
  },[])
  const columns = [
    {
      title: 'repo',
      dataIndex: 'repo',
      key: 'repo',
    },
    {
      title: 'page_rank',
      dataIndex: 'page_rank',
      key: 'page_rank',
    },
    {
      title: 'betweenness_centrality',
      dataIndex: 'betweenness_centrality',
      key: 'betweenness_centrality',
    },
    {
      title: 'closeness_centrality',
      dataIndex: 'closeness_centrality',
      key: 'closeness_centrality',
    },
    {
      title: 'total_score',
      dataIndex: 'total_score',
      key: 'total_score',
    },
  ];

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} />;
    </div>
  );
};

export default Index;



