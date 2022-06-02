import React from 'react';
import { Col, Divider, Row } from 'antd';
import { Pie, G2 } from '@ant-design/plots';
import { getIntl } from 'umi';

const intl = getIntl();
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
  const group = new G.Group({});
  group.addShape({
    type: 'circle',
    attrs: {
      x: 0,
      y: 0,
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
      text: `${data[keyField]}(${data.value}) ${percentStr}`,
      fill: mappingData.color,
    },
  });

  return group;
}

export default class ProjectDistPies extends React.Component<any, any> {
  render() {
    let totalCommitsByRegionDist = 0;
    this.props.regionCommitsDist.forEach((item) => {
      totalCommitsByRegionDist += item.value;
    });

    let totalCommitsByDomainDist = 0;
    this.props.emailDomainCommitsDist.forEach((item) => {
      totalCommitsByDomainDist += item.value;
    });

    return (
      <Row gutter={18} align={'middle'}>
        <Col span={11}>
          {!!this.props.regionCommitsDist.length && (
            <>
              <Divider> {intl.formatMessage({ id: 'contribDist.commitsRegionDist' })} </Divider>
              <div style={{ textAlign: 'center' }}>
                {intl.formatMessage({ id: 'contribDist.commitDist.total' })}:{' '}
                {totalCommitsByRegionDist}
              </div>
            </>
          )}

          <Pie
            angleField={'value'}
            colorField={'region'}
            data={this.props.regionCommitsDist}
            legend={{
              layout: 'horizontal',
              position: 'bottom',
              flipPage: false,
            }}
            // animation has to be turned off to avoid re-render when label formatter is specifed
            animation={false}
            label={{
              type: 'spider',
              labelHeight: 40,
              formatter: (data, mappingData) => {
                return generateLabelGroup(data, mappingData, 'region');
              },
            }}
            radius={0.9}
            theme={{
              colors10: COLORS10_ELEGENT,
            }}
          />
        </Col>
        <Col span={13}>
          {!!this.props.emailDomainCommitsDist.length && (
            <>
              <Divider>{intl.formatMessage({ id: 'contribDist.commitsEmailDomainDist' })}</Divider>
              <div style={{ textAlign: 'center' }}>
                {intl.formatMessage({ id: 'contribDist.commitDist.total' })}:{' '}
                {totalCommitsByDomainDist}
              </div>
            </>
          )}
          <Pie
            angleField={'value'}
            colorField={'domain'}
            data={this.props.emailDomainCommitsDist}
            animation={false}
            legend={{
              layout: 'horizontal',
              position: 'bottom',
              flipPage: false,
            }}
            label={{
              type: 'spider',
              labelHeight: 40,
              formatter: (data, mappingData) => {
                return generateLabelGroup(data, mappingData, 'domain');
              },
            }}
            radius={0.9}
            theme={{
              colors10: COLORS10_ELEGENT,
            }}
          />
        </Col>
      </Row>
    );
  }
}
