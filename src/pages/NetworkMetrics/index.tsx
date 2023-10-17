import React from 'react';
import { Col, Row, Table, Select, Space, Statistic, Divider } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { Link } from 'umi';
import { runSql } from '@/services/clickhouse';
import { getPRNetworkMetrics } from '@/services/influence_metrics/pr_network';
// import { runmySql } from '@/pages/NetworkMetrics/Mysql';

const UNIQ_OWNER_REPO_SQL =
  'SELECT DISTINCT(search_key__owner,search_key__repo) FROM github_issues_timeline ORDER BY (search_key__owner,search_key__repo)';

interface DataType {
  key: number;
  metricsName: string;
  description: string;
  purpose: string;
}

const data: DataType[] = [
  {
    key: 1,
    metricsName: 'in_degree_centrality',
    description:
      'The metric is computed at the graph level as the total deviation from the maximum observed in-degree centrality score',
    purpose: 'Measures the presence of central nodes based on incoming edges.',
  },
  {
    key: 2,
    metricsName: 'out_degree_centrality',
    description:
      'The metric is computed at the graph level as the total deviation from the maximum observed out-degree centrality score',
    purpose: 'Measures the presence of central nodes based on outgoing edges.',
  },
  {
    key: 3,
    description: 'The ratio of the number of edges to the number of possible edges.',
    metricsName: 'density',
    purpose: 'Measures the sparsity of the connections in a graph.',
  },
  {
    key: 4,
    description: 'The fraction of edges which are sym- metric (reciprocal edges).',
    metricsName: 'reciprocity',
    purpose: 'Measures the likelihood of nodes in a directed graph to be mutuallylinked.',
  },
  {
    key: 5,
    description:
      'The fraction of triangles in a graph relative to the total number of connected triples of nodes in the graph.',
    purpose:
      'Measure the tendency of the nodes to cluster together. High transitivity means that the network contains communities or groups of nodes that are densely connected internally',
    metricsName: 'transitivity',
  },
  {
    key: 6,
    description: 'The number of triangles in a graph.',
    purpose: 'Measure the absolute tendency of the nodes to cluster together.',
    metricsName: 'triangles',
  },
  {
    key: 7,
    description: 'Compute the clustering coefficient for nodes.',
    purpose: 'Measure the tendency of the nodes to cluster together.',
    metricsName: 'clustering',
  },
  {
    key: 8,
    description: 'The number of weakly connected components in the graph',
    purpose:
      'Measure the tendency of the nodes to cluster together. High transitivity means that the network contains communities or groups of nodes that are densely connected internally',
    metricsName: 'components_number',
  },
  {
    key: 9,
    description: 'The average number of degrees in the graph.',
    purpose: 'Measure the average collaboration activity in the graph.',
    metricsName: 'avg_degree',
  },
];

export default class Metrics extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      ownerRepoMap: {},
      owners: [],
      repos: [],
      owner: '',
      repo: '',
      num_nodes: 0,
      num_edges: 0,
      columns: null,
    };
    this.onOwnerChange = this.onOwnerChange.bind(this);
    this.onOwnerSelect = this.onOwnerSelect.bind(this);
    this.onRepoSelect = this.onRepoSelect.bind(this);
  }

  async componentDidMount() {
    const result = await runSql(UNIQ_OWNER_REPO_SQL);
    const ownerRepoMap: object = {};
    result.data.forEach((pair: any) => {
      const owner = pair[0][0];
      const repo = pair[0][1];
      if (ownerRepoMap.hasOwnProperty(owner)) {
        ownerRepoMap[owner].push(repo);
      } else {
        ownerRepoMap[owner] = [repo];
      }
    });
    const owners: string[] = Object.keys(ownerRepoMap).map((owner) => ({ value: owner }));

    this.setState({ ownerRepoMap, owners });
  }

  ownerRepoSelected(owner, repo) {
    if (this.props.onOwnerRepoSelected) {
      this.props.onOwnerRepoSelected(owner, repo);
    }
  }

  onOwnerChange() {}

  onOwnerSelect(owner: string /*, option: object*/) {
    const repos = this.state.ownerRepoMap[owner].map((repo) => ({ value: repo }));
    this.setState({ repos, owner: owner });
    if (repos.length > 0) {
      const defaultRepo = repos[0].value;
      this.setState({ repo: defaultRepo });
      this.ownerRepoSelected(owner, defaultRepo);
    }
  }

  autoCompleteFilter(inputValue, option) {
    return option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
  }

  onRepoSelect(repo: string /*, option: object*/) {
    this.setState({ repo: repo });
    // Notify the parent component with parent's callback
    this.ownerRepoSelected(this.state.owner, repo);
    getPRNetworkMetrics('num_nodes', this.state.owner, repo).then((result) => {
      const num_nodes = result.data;
      this.setState({ num_nodes });
    });
    getPRNetworkMetrics('num_edges', this.state.owner, repo).then((result) => {
      const num_edges = result.data;
      this.setState({ num_edges });
    });
  }

  componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>) {
    if (prevState.repo != this.state.repo) {
      this.setState({
        columns: [
          {
            title: 'metricsName',
            dataIndex: 'metricsName',
            key: 'metricsName',
            render: (text, record) => (
              <Link
                to={`/networkmetric/${record.metricsName}/${this.state.owner}/${this.state.repo}`}
              >
                {text}
              </Link>
            ),
          },
          {
            title: 'description',
            dataIndex: 'description',
            key: 'description',
          },
          {
            title: 'purpose',
            dataIndex: 'purpose',
            key: 'purpose',
          },
        ],
      });
    }
  }

  render() {
    return (
      <PageContainer>
        <Row>
          <Col>
            <Space wrap>
              <Select
                showSearch
                placeholder={'owner'}
                style={{
                  width: 200,
                }}
                options={this.state.owners}
                onChange={this.onOwnerChange}
                onSelect={this.onOwnerSelect}
                filterOption={this.autoCompleteFilter}
                value={this.state.owner || undefined}
              />
              <Select
                showSearch
                placeholder={'repo'}
                onSelect={this.onRepoSelect}
                value={this.state.repo || undefined}
                filterOption={this.autoCompleteFilter}
                defaultActiveFirstOption
                style={{
                  width: 200,
                }}
                options={this.state.repos}
              />
            </Space>
          </Col>
        </Row>

        {!!this.state.repo && <Divider orientation="center">代码库信息{this.state.repo}</Divider>}

        {!!this.state.repo && (
          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="节点数量" value={this.state.num_nodes} />
            </Col>
            <Col span={12}>
              <Statistic title="边数量" value={this.state.num_edges} />
            </Col>
          </Row>
        )}

        {!!this.state.repo && (
          <Row gutter={20}>
            <Divider orientation="center">统计信息</Divider>
            <Col span={16}>
              <Table columns={this.state.columns} dataSource={data} />
            </Col>
          </Row>
        )}
      </PageContainer>
    );
  }
}
