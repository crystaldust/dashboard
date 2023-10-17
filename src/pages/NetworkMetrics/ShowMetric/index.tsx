import React from 'react';
import { Col, DatePicker, Divider, Row, Statistic } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { Line } from '@ant-design/plots';
import { RangePickerProps } from 'antd/lib/date-picker';
import { runSql } from '@/services/clickhouse';
import { getPRNetworkMetrics } from '@/services/influence_metrics/pr_network';

export default class MetricPage extends React.Component<any, any> {
  chartRef = React.createRef();

  constructor(props) {
    super(props);
    const { match } = this.props;
    const { metricName, owner, repo } = match.params;
    this.state = {
      owner: owner,
      repo: repo,
      selectedData: '',
      startDate: '',
      endDate: '',
      metricData: [],
      metric_overall: 0.0,
      num_nodes: 0,
      metricName: metricName,
      selectedYear: '',
    };
    console.log('LANCE DEBUG', metricName, owner, repo);
    getPRNetworkMetrics(metricName, owner, repo).then((result) => {
      const metric_overall = result.data;
      this.setState({ metric_overall });
    });
    getPRNetworkMetrics('num_nodes', owner, repo).then((result) => {
      const num_nodes = result.data;
      this.setState({ num_nodes });
    });
  }

  onDateChange(val) {
    const promises = [];

    for (let i = 1; i <= 12; i++) {
      const time = val.format('YYYY') + i.toString().padStart(2, '0');
      console.log(time);

      promises.push(
        getPRNetworkMetrics(this.state.metricName, this.state.owner, this.state.repo, time).then(
          (result) => {
            // console.log(result.data);
            return { month: i.toString(), value: result.data };
          },
        ),
      );
    }

    Promise.all(promises)
      .then((results) => {
        this.setState({ metricData: results });
      })
      .catch((error) => {
        // 处理错误
      });

    // console.log(data);
  }

  render() {
    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
      const currentDate = current.format('YYYY-MM-DD');
      runSql(
        `SELECT min(created_at) FROM github_pull_requests WHERE search_key__owner='${this.state.owner}' and search_key__repo='${this.state.repo}'`,
      ).then((result) => {
        const startDate = result.data[0][0];
        this.setState({ startDate });
      });
      runSql(
        `SELECT max(created_at) FROM github_pull_requests WHERE search_key__owner='${this.state.owner}' and search_key__repo='${this.state.repo}'`,
      ).then((result) => {
        const endDate = result.data[0][0];
        this.setState({ endDate });
      });
      return !!currentDate && currentDate >= startDate && currentDate <= endDate;
    };
    const data = this.state.metricData;

    const config = {
      data,
      padding: 'auto',
      xField: 'month',
      yField: 'value',
      xAxis: {
        tickCount: 5,
      },
      smooth: true,
    };
    console.log(data);
    return (
      <PageContainer>
        <Divider>基本统计信息</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="Owner" value={this.state.owner} />
          </Col>
          <Col span={12}>
            <Statistic title="Repo" value={this.state.repo} />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title={this.state.metricName} value={this.state.metric_overall} />
          </Col>
          <Col span={12}>
            <Statistic title={'num_nodes'} value={this.state.num_nodes} />
          </Col>
          <Col>
            <DatePicker
              picker={'year'}
              onChange={(val: moment) => {
                this.setState({ selectedYear: val.format('YYYY') });
                this.onDateChange(val);
              }}
            />
          </Col>
        </Row>
        <Row>
          <Divider>时间曲线图</Divider>
          <Col span={24}>{data.length === 12 && <Line {...config} />}</Col>
        </Row>
      </PageContainer>
    );
  }
}
