import React, { useEffect, useRef } from 'react';
import G6 from '@antv/g6';
import { getNetworkBaseGraph } from '@/services/influence_metrics/contribution';

const Index = (props) => {
  const containerRef = useRef();
  const { api_path } = props;

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
      .then((res) => res.json())
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

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }} />;
};

export default Index;
