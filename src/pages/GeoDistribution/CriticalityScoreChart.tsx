import React from 'react';
import { Line, G2 } from '@ant-design/plots';
import { Divider } from 'antd';

import { getIntl } from 'umi';
const intl = getIntl();

const config = {
  xField: 'time_point',
  yField: 'criticality_score',
  yAxis: {
    max: 1,
  },
  label: {
    content: (data: object) => {
      return data.criticality_score.toFixed(2);
    },
  },
  tooltip: {
    fields: ['org_count', 'contributor_count', 'commit_frequency', 'recent_releases_count'],
    // customContent: (title: any, items: any) => {
    //   console.log(title, items);
    //
    //   return <div>Hello</div>;
    // },
    // formatter: (dataum) => {
    //   console.log(dataum);
    //   // return { criticality_score: 100, time_point: '2022-01-08' };
    //   return dataum;
    // },
  },
  point: {
    size: 5,
    shape: 'diamond',
    style: {
      fill: 'white',
      stroke: '#5B8FF9',
      lineWidth: 2,
    },
  },
  state: {
    active: {
      style: {
        shadowBlur: 4,
        stroke: '#000',
        fill: 'red',
      },
    },
  },
  interactions: [
    {
      type: 'marker-active',
    },
  ],
};
export class CriticalityScoreChart extends React.Component<any, any> {
  render() {
    return (
      <div>
        {!!this.props.criticalityScores.length && (
          <div>
            <Divider>{intl.formatMessage({ id: 'geodist.criticalityScore' })}</Divider>
            <Line height={200} {...config} data={this.props.criticalityScores} />;
          </div>
        )}
      </div>
    );
  }
}
