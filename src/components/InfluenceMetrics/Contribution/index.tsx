import React, { createRef } from 'react';
import { Bar } from '@ant-design/plots';
import {
  getCentrialityScore,
  getMaximumIntensity,
  getNetworkBaseGraph,
  getPageRanking,
  getTotalFixIntensity,
} from '@/services/influence_metrics/contribution';
import { Graph } from '@antv/g6';
import { Table } from 'antd';

export class TotalFixIntensityBar extends React.Component<any, any> {
  static config = {
    yField: 'email',
    xField: 'total_fix_intensity',
    width: 500,
    yAxis: {
      label: {
        autoRotate: false,
      },
    },
    // scrollbar: {
    //   type: 'vertical',
    // },
  };

  constructor(props) {
    super(props);

    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    getTotalFixIntensity()
      .then((data) => {
        this.setState({ data });
      })
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  }

  render() {
    return <Bar {...TotalFixIntensityBar.config} data={this.state.data} />;
  }
}

export class BasicContributionGraph extends React.Component<any, any> {
  graph: Graph;
  containerRef = createRef();

  constructor(props: any) {
    super(props);
  }

  refreshDragedNodePosition(e) {
    const model = e.item.get('model');
    model.fx = e.x;
    model.fy = e.y;
  }

  componentDidMount() {
    const container = this.containerRef.current;
    const width = container.scrollWidth;
    const height = container.scrollHeight || 500;

    this.graph = new Graph({
      container: container,
      width,
      height,
      layout: {
        type: 'force',
        preventOverlap: true,
        linkDistance: (d) => {
          if (d.source.id === 'node0') {
            return 100;
          }
          return 30;
        },
        nodeStrength: (d) => {
          if (d.isLeaf) {
            return -50;
          }
          return -10;
        },
        edgeStrength: (d) => {
          if (d.source.id === 'node1' || d.source.id === 'node2' || d.source.id === 'node3') {
            return 0.7;
          }
          return 0.1;
        },
      },
      defaultNode: {
        color: '#5B8FF9',
      },
      modes: {
        default: ['drag-canvas'],
      },
    });

    let graph = this.graph;
    let refreshDragedNodePosition = this.refreshDragedNodePosition;
    getNetworkBaseGraph().then((data) => {
      const nodes = data.nodes;

      // randomize the node size
      // nodes.forEach((node) => {
      //   node.size = Math.random() * 30 + 5;
      // });

      graph.data({
        nodes,
        edges: data.edges.map((edge, i) => {
          edge.id = 'edge' + i;
          return Object.assign({}, edge);
        }),
      });

      graph.render();
      graph.on('node:dragstart', (e) => {
        graph.layout();
        refreshDragedNodePosition(e);
      });
      graph.on('node:drag', (e) => {
        refreshDragedNodePosition(e);
      });
      graph.on('node:dragend', (e) => {
        e.item.get('model').fx = null;
        e.item.get('model').fy = null;
      });
    });
  }

  render() {
    return <div ref={this.containerRef} style={{ width: '100%', height: '1000px' }} />;
  }

  // window.onresize = () => {
  //   if (!graph || graph.get('destroyed')) return;
  //   if (!container || !container.scrollWidth || !container.scrollHeight) return;
  //   graph.changeSize(container.scrollWidth, container.scrollHeight);
  // };
}

export class BetweennessCentrality extends React.Component<any, any> {
  containerRef = createRef(null);

  refreshDragedNodePosition(e) {
    const model = e.item.get('model');
    model.fx = e.x;
    model.fy = e.y;
  }

  componentDidMount() {
    const container = this.containerRef.current;
    const width = container.scrollWidth;
    const height = container.scrollHeight || 500;
    const graph = new Graph({
      container: container,
      width,
      height,
      linkDistance: 10,
      clusterEdgeDistance: 10,
      layout: {
        type: 'force',
        preventOverlap: true,
      },
      modes: {
        default: ['zoom-canvas', 'drag-canvas', 'drag-node'],
      },
    });

    const refreshDragedNodePosition = this.refreshDragedNodePosition;
    getNetworkBaseGraph().then((data) => {
      const nodes = data.nodes;
      // randomize the node size
      // nodes.forEach((node) => {
      //   node.size = Math.random() * 30 + 5;
      // });
      graph.data({
        nodes,
        edges: data.edges.map(function (edge, i) {
          edge.id = 'edge' + i;
          return Object.assign({}, edge);
        }),
      });
      graph.render();

      graph.on('node:dragstart', function (e) {
        graph.layout();
        refreshDragedNodePosition(e);
      });
      graph.on('node:drag', function (e) {
        const forceLayout = graph.get('layoutController').layoutMethods[0];
        forceLayout.execute();
        refreshDragedNodePosition(e);
      });
      graph.on('node:dragend', function (e) {
        e.item.get('model').fx = null;
        e.item.get('model').fy = null;
      });
    });
  }

  // window.onresize = () => {
  //   if (!graph || graph.get('destroyed')) return;
  //   if (!container || !container.scrollWidth || !container.scrollHeight) return;
  //   graph.changeSize(container.scrollWidth, container.scrollHeight);
  // };

  render() {
    return <div ref={this.containerRef} style={{ width: '100%', height: '600px' }} />;
  }
}

export class PageRank extends React.Component<any, any> {
  containerRef = createRef();

  componentDidMount() {
    const container = this.containerRef.current;
    const width = container.scrollWidth;
    const height = container.scrollHeight || 500;
    const graph = new Graph({
      container: container,
      width,
      height,
      modes: {
        default: ['zoom-canvas', 'drag-canvas', 'drag-node'],
      },
      layout: {
        type: 'circular',
      },
      animate: true,
      defaultNode: {
        size: 20,
      },
    });

    // fetch('http://127.0.0.1:5000/metric/get_page_rank_top_10')
    getPageRanking().then((data) => {
      graph.data(data);
      graph.render();
    });
  }

  // window.onresize = () => {
  //   if (!graph || graph.get('destroyed')) return;
  //   if (!container || !container.scrollWidth || !container.scrollHeight) return;
  //   graph.changeSize(container.scrollWidth, container.scrollHeight);
  // };
  render() {
    return <div ref={this.containerRef} style={{ width: '100%', height: '600px' }} />;
  }
}

export class CentralityScoreTable extends React.Component<any, any> {
  // row['repo'], row['page_rank'], row['betweenness_centrality'], row['closeness_centrality'], row['total_score']
  static columns = [
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

  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  // const [dataSource, setData] = useState([]);
  componentDidMount() {
    getCentrialityScore().then((data) => {
      this.setState({ data });
    });
  }

  render() {
    return <Table dataSource={this.state.data} columns={CentralityScoreTable.columns} />;
  }
}

export class MaximumIntensityTable extends React.Component<any, any> {
  // row['repo'], row['page_rank'], row['betweenness_centrality'], row['closeness_centrality'], row['total_score']
  static columns = [
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

  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  // const [dataSource, setData] = useState([]);
  componentDidMount() {
    getMaximumIntensity().then((data) => {
      this.setState({ data });
    });
  }

  render() {
    return (
      <div>
        <Table dataSource={this.state.data} columns={MaximumIntensityTable.columns} />;
      </div>
    );
  }
}
