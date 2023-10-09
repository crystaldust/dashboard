import React, { useEffect, useRef } from 'react';
import G6 from '@antv/g6';
import { getPageRanking } from '@/services/influence_metrics/contribution';

const Index = () => {
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

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }} />;
};

export default Index;
