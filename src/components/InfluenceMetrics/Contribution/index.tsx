import React, {useEffect, useRef, useState} from 'react';
import {Bar} from '@ant-design/plots';
import {getNetworkBaseGraph, getPageRanking, getTotalFixIntensity} from '@/services/influence_metrics/contribution';
import G6 from "@antv/g6";


const TotalFixIndensityBar = (props) => {
  const [data, setData] = useState([]);

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  useEffect(() => {
    asyncFetch();
  }, []);
  const {api, metrics} = props;

  const asyncFetch = () => {
    getTotalFixIntensity()
      .then((json) => {
        console.log(json.slice(100));
        setData(json.slice(100));
        console.log(json);
      })
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  const config = {
    data,
    yField: 'email',
    xField: metrics,
    width: 500,
    yAxis: {
      label: {
        autoRotate: false,
      },
    },
    scrollbar: {
      type: 'vertical',
    },
  };

  return <Bar {...config} />;
};

// ReactDOM.render(<DemoBar />, document.getElementById('container'));

const BasicContributionGraph = () => {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    const width = container.scrollWidth;
    const height = container.scrollHeight || 500;
    const graph = new G6.Graph({
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

    // fetch('http://127.0.0.1:5000/metric/get_basic_graph')
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
        refreshDragedNodePosition(e);
      });
      graph.on('node:dragend', function (e) {
        e.item.get('model').fx = null;
        e.item.get('model').fy = null;
      });
    });
  }, []);

  // window.onresize = () => {
  //   if (!graph || graph.get('destroyed')) return;
  //   if (!container || !container.scrollWidth || !container.scrollHeight) return;
  //   graph.changeSize(container.scrollWidth, container.scrollHeight);
  // };

  function refreshDragedNodePosition(e) {
    const model = e.item.get('model');
    model.fx = e.x;
    model.fy = e.y;
  }

  return <div ref={containerRef} style={{width: '100%', height: '1000px'}}/>;
};

const BetweennessCentrality = (props) => {
  const containerRef = useRef();
  const {api_path} = props;

  useEffect(() => {
    const container = containerRef.current;
    const width = container.scrollWidth;
    const height = container.scrollHeight || 500;
    const graph = new G6.Graph({
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

    // fetch('http://127.0.0.1:5000'+'/metric/get_basic_graph')
    getNetworkBaseGraph()
      .then((data) => {
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
  }, []);

  window.onresize = () => {
    if (!graph || graph.get('destroyed')) return;
    if (!container || !container.scrollWidth || !container.scrollHeight) return;
    graph.changeSize(container.scrollWidth, container.scrollHeight);
  };

  function refreshDragedNodePosition(e) {
    const model = e.item.get('model');
    model.fx = e.x;
    model.fy = e.y;
  }

  return <div ref={containerRef} style={{width: '100%', height: '600px'}}/>;
};

const PageRank = () => {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    const width = container.scrollWidth;
    const height = container.scrollHeight || 500;
    const graph = new G6.Graph({
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
    getPageRanking()
      .then((res) => res.json())
      .then((data) => {
        graph.data(data);
        graph.render();
      });
  }, []);

  window.onresize = () => {
    if (!graph || graph.get('destroyed')) return;
    if (!container || !container.scrollWidth || !container.scrollHeight) return;
    graph.changeSize(container.scrollWidth, container.scrollHeight);
  };

  return <div ref={containerRef} style={{width: '100%', height: '600px'}}/>;
};
export  TotalFixIndensityBar;
export  BasicContributionGraph;
export  BetweennessCentrality;
export  PageRank;
