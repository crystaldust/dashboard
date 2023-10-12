import React, { useEffect, useRef } from 'react';
import G6 from '@antv/g6';
import { getNetworkBaseGraph } from '@/services/influence_metrics/contribution';

const BaseGraph = () => {
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

  return <div ref={containerRef} style={{ width: '100%', height: '1000px' }} />;
};

export default BaseGraph;
