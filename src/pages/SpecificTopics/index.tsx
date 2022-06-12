import React from 'react';
import { runSql } from '@/services/clickhouse';
import {
  authorCountOfMonthSql,
  commitCountOfMonthSql,
  firstCommitDateSql,
} from '@/pages/SpecificTopics/DataSQLs';
import { Col, Divider, Row } from 'antd';
import LineChart from '@ant-design/plots/es/components/line';
import { dateToYearMonthInt } from '@/pages/ContribDistribution/DataProcessors';
import { G2, Line, Pie } from '@ant-design/plots';
import {
  getAuthorAndCommitCount,
  getDomainCommitsDist,
  getDomainSeries,
} from '@/pages/SpecificTopics/DataProcessing';

const COLORS10_ELEGENT = [
  '#3682be',
  '#45a776',
  '#f05326',
  '#a69754',
  '#334f65',
  '#b3974e',
  '#38cb7d',
  '#ddae33',
  '#844bb3',
  '#93c555',
  '#5f6694',
  '#df3881',
];
const G = G2.getEngine('canvas');

function generateLabelGroup(data, mappingData, keyField) {
  console.log('key:', keyField);
  const group = new G.Group({});
  group.addShape({
    type: 'circle',
    attrs: {
      x: 0,
      y: 2,
      width: 40,
      height: 50,
      r: 5,
      fill: mappingData.color,
    },
  });

  const percent = Math.round(data.percent * 100);
  let percentStr = `${percent}%`;
  if (percent < 1) {
    percentStr = '< 1%';
  }
  group.addShape({
    type: 'text',
    attrs: {
      x: 10,
      y: 8,
      text: `${data[keyField]}(${data.totalCommitCount}) ${percentStr}`,
      fill: mappingData.color,
    },
  });

  return group;
}

export default class SpecificTopics extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      authorCommitData: [],
      domainSeriesData: [],
      domainDistData: [],
    };
    getAuthorAndCommitCount('apache', 'flink').then((result) => {
      this.setState({ authorCommitData: result });
    });

    getDomainSeries('apache', 'flink').then((allDomainSeries) => {
      this.setState({ domainSeriesData: allDomainSeries });
    });

    getDomainCommitsDist('apache', 'flink', 10).then((domainDistData) => {
      this.setState({ domainDistData });
    });
  }

  render() {
    return (
      <div>
        <Divider>Time Series of Authors and Commits</Divider>
        <Row>
          <Col span={24}>
            <Line
              xField="date"
              yField="value"
              seriesField="category"
              data={this.state.authorCommitData}
              // slider={{
              //   start: 0,
              //   end: 1,
              // }}
              annotations={[
                // {
                //   type: 'region',
                //   start: ['2015-1', 'min'],
                //   end: ['2015-2', 'max'],
                // },
                // {
                //   type: 'dataRegion',
                //   start: ['2015-1', 'min'],
                //   end: ['2015-2', 'max'],
                //   text: {
                //     content: '阿里收购',
                //   },
                // },
                {
                  type: 'dataMarker',
                  // position: ['2015-1', '0'],
                  position: (xScale, yScale) => {
                    return [
                      `${xScale.scale('2015-1') * 100}%`,
                      `${(1 - yScale.value.scale(100)) * 100}%`,
                    ];
                  },
                  text: {
                    content: '阿里收购',
                    style: {
                      textAlign: 'left',
                    },
                  },
                },
              ]}
            />
          </Col>
        </Row>

        <Row>
          <Col span={16}>
            <Divider>Time Series of Domain Commits</Divider>
            <Line
              data={this.state.domainSeriesData}
              xField="date"
              yField="value"
              seriesField="category"
              legend={{
                position: 'bottom',
                flipPage: false,
              }}
            />
          </Col>

          <Col span={8}>
            <Divider>Distributioni of Domain Commits</Divider>
            <Pie
              radius={0.5}
              angleField="totalCommitCount"
              colorField="domain"
              legend={{
                layout: 'horizontal',
                position: 'bottom',
                flipPage: false,
              }}
              // animation={false}
              label={{
                type: 'spider',
                labelHeight: 40,
                formatter: (data, mappingData) => {
                  return generateLabelGroup(data, mappingData, 'domain');
                },
              }}
              theme={{
                colors10: COLORS10_ELEGENT,
              }}
              data={this.state.domainDistData}
            />
          </Col>
        </Row>
      </div>
    );
  }
}
