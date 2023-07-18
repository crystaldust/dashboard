import { Column, Line } from '@ant-design/plots';
import React from 'react';

// TODO Delete these demo data:
//  the data is not strictly correct, but enough for demo
const now = new Date();
const startYear = now.getFullYear();
const startMonth = now.getMonth() - 3;
const DEMO_COMMITS_DATA = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(startYear, startMonth, i + 1);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return {
    date: `${year}-${month}-${day}`,
    // date: i,
    numCommits: Math.floor(Math.random() * 0xf0),
  };
});

function genDemoFeatureData(valueKey: string) {
  return Array.from({ length: 90 }, (_, i) => {
    const date = new Date(startYear, startMonth, i + 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const item = {
      date: `${year}-${month}-${day}`,
    };
    item[valueKey] = Math.floor(Math.random() * 0x12);
    return item;
  });
}

const DEMO_FEAT_DATA = genDemoFeatureData('numFeats');
export const DEMO_CORE_FEAT_DATA = genDemoFeatureData('numFeats');

export class RecentCommitChart extends React.Component<any, any> {
  render() {
    return (
      <div>
        <div>
          <b>Recent commits</b>
        </div>
        <Line data={DEMO_COMMITS_DATA} xField="date" yField="numCommits" />
      </div>
    );
  }
}

export class RecentFeatureChart extends React.Component<any, any> {
  render() {
    return (
      <div>
        <div>
          <b>{this.props.title || 'Recent features'}</b>
        </div>
        <Column
          data={this.props.data || DEMO_FEAT_DATA}
          xField="date"
          yField="numFeats"
          color={this.props.color || '#6395fa'}
        />
      </div>
    );
  }
}
