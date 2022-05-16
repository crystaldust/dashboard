import React, { createRef } from 'react';
import { Button, Col, Progress, Row, Slider } from 'antd';
import { Line } from '@ant-design/plots';
import { runSql } from '@/services/clickhouse';
import { getIntl } from 'umi';
import { WaterMark } from '@ant-design/pro-layout';
import {
  exportComponentAsJPEG,
  exportComponentAsPDF,
  exportComponentAsPNG,
} from 'react-component-export-image';
import { StatefulLineChart } from '@/pages/CriticalityScoreDownload/StatefulLineChart';

const intl = getIntl();

const config = {
  xField: 'time_point',
  yField: 'criticality_score',
  // annotations: {
  //   criticality_score: [
  //     {
  //       type: 'text',
  //       content: 'empty',
  //     },
  //   ],
  // },
  yAxis: {
    max: 1.5,
  },
  // seriesField: 'contributor_lookback_days',
  label: {
    content: (data: object) => {
      return data.criticality_score.toFixed(2);
    },
  },
  point: {
    size: 5,
    shape: 'round',
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
  // interactions: [
  //   {
  //     type: 'marker-active',
  //   },
  // ],
};

function getDataSql(owner, repo) {
  return `
 select time_point,
       created_since,
       updated_since,
       contributor_count,
       org_count,
       commit_frequency,
       recent_releases_count,
       updated_issues_count,
       closed_issues_count,
       comment_frequency,
       dependents_count,
       criticality_score
from criticality_score
where owner='${owner}'
  and repo='${repo}'
  and contributor_lookback_days=180

order by time_point
  `;
}

export default class CriticalityScoreDownload extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.lineRef = createRef();

    this.buttonClick = this.buttonClick.bind(this);
    this.onLineReady = this.onLineReady.bind(this);
    this.fetchAndDownload = this.fetchAndDownload.bind(this);
    this.updateLineChartWidth = this.updateLineChartWidth.bind(this);
    this.updateLineChartHeight = this.updateLineChartHeight.bind(this);

    this.state = {
      criticalityScores: [],
      progress: 0,
      lineChartWidth: 16,
      lineChartHeight: 250,
    };
  }

  componentDidMount() {
    console.log('did mount');
  }

  fetchAndDownload(owner, repo) {
    runSql(getDataSql(owner, repo)).then((scoreResult) => {
      const criticalityScores: any[] = [];
      scoreResult.data.forEach((values: []) => {
        const score: object = {};
        scoreResult.columns.forEach((col: [], colIndex: number) => {
          const keyName: string = col[0];
          const value = values[colIndex];
          if (keyName == 'time_point') {
            // sampple time_point: 2020-06-01 00:00:00.000
            score[keyName] = value.slice(0, 10);
          }
          // else if (keyName == 'contributor_lookback_days') {
          //   let content = 'Contributors ';
          //   if (value == 0) {
          //     content += ' all the time';
          //   } else {
          //     content += ` look back at ${value} days`;
          //   }
          //   score[keyName] = content;
          // }
          else {
            score[keyName] = value;
          }
        });
        criticalityScores.push(score);
      });
      this.setState({ criticalityScores, owner, repo });

      // this.forceUpdate(() => {});
      setTimeout(() => {
        // console.log(this.lineRef);
        const lineChart = this.lineRef.current.getChart();
        lineChart.render();
        lineChart.downloadImage(`${owner}___${repo}.jpg`, 'jpg');
        // console.log(lineChart);
        // lineChart.addAnnotations([
        //   {
        //     type: 'text',
        //     content: 'just tttt',
        //     x: 100,
        //     y: 50,
        //     style: {
        //       fontSize: 50,
        //     },
        //   },
        // ]);
        // console.log(lineChart.chart.views);
        // lineChart.chart.views[0 || 1].annotation().text({
        //   content: `${owner}/${repo}`,
        //   x: 100,
        //   y: 50,
        //   style: {
        //     fontSize: 20,
        //   },
        // });
        // lineChart.annotations = [
        //   {
        //     type: 'text',
        //     content: `${owner}/${repo}`,
        //     x: 100,
        //     y: 50,
        //     style: {
        //       fontSize: 20,
        //     },
        //   },
        // ];
        // lineChart.render();
        // lineChart.downloadImage(`${owner}___${repo}.jpg`, 'jpg');
        // lineChart.toDataURL();
        // exportComponentAsJPEG(this.lineRef.chart);
        // console.log(this.lineRef);
        // console.log(this.lineRef.current.getChart());
        // exportComponentAsJPEG(this.lineRef.chartRef);
        // exportComponentAsJPEG(this.waterMarkRef);
      }, 300);
    });
  }

  buttonClick() {
    runSql('SELECT distinct(owner, repo) from criticality_score').then((result) => {
      let i = 0;
      const numProjects = result.data.length;
      // const numProjects = 2;

      const interval = setInterval(() => {
        const item = result.data[i];
        const owner = item[0][0];
        const repo = item[0][1];
        const progress = Math.round((i / numProjects) * 100);
        this.setState({ progress });
        this.forceUpdate();
		if (owner == 'docker' && repo=='roadmap'){
        	this.fetchAndDownload(owner, repo);
		}
        ++i;
        if (i >= numProjects) {
          clearInterval(interval);
          this.setState({ progress: 100 });
        }
      }, 350);
    });
  }
  onLineReady(plot) {
    this.lineRef.current = plot;
  }
  updateLineChartWidth(width) {
    this.setState({ lineChartWidth: width });
  }

  updateLineChartHeight(height) {
    this.setState({ lineChartHeight: height });
  }
  // componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {}

  render() {
    return (
      <div>
        <Button onClick={this.buttonClick}>
          {intl.formatMessage({ id: 'chartdownload.download' })}
        </Button>
        <br />
        <br />
        <br />
        <Row>
          <Col span={10}>
            <div>{intl.formatMessage({ id: 'chartdownload.chartHeight' })}</div>
            <Slider defaultValue={16} min={1} max={24} onChange={this.updateLineChartWidth} />
          </Col>
        </Row>

        <Row>
          <Col span={10}>
            <div>{intl.formatMessage({ id: 'chartdownload.chartWidth' })}</div>
            <Slider defaultValue={250} min={10} max={400} onChange={this.updateLineChartHeight} />
          </Col>
        </Row>

        {this.state.progress != 0 && (
          <Row>
            <Col span={16}>
              <Progress percent={this.state.progress} />
            </Col>
          </Row>
        )}
        <WaterMark content="IntelligEngine" zIndex={110}>
          <Row>
            <Col span={this.state.lineChartWidth} style={{ height: this.state.lineChartHeight }}>
              <Line
                data={this.state.criticalityScores}
                ref={this.lineRef}
                {...config}
                interactions={[{ type: 'tooltip', enable: false }]}
                animation={false}
                onReady={this.onLineReady}
                theme={{
                  styleSheet: {
                    backgroundColor: 'white',
                  },
                }}
              />
            </Col>
          </Row>
        </WaterMark>
      </div>
    );
  }
}
