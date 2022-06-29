import React from 'react';
import { runSql } from '@/services/clickhouse';
import {
  authorCountOfMonthSql,
  commitCountOfMonthSql,
  firstCommitDateSql,
} from '@/pages/SpecificTopics/DataSQLs';
import { Col, Divider, Row } from 'antd';
import LineChart from '@ant-design/plots/es/components/line';
import { dateToYearMonthInt, pathsToTree } from '@/pages/ContribDistribution/DataProcessors';

import { Tree } from 'antd';

import { G2, Line, Pie } from '@ant-design/plots';

import {
  getAuthorAndCommitCount,
  getDirSeries,
  getDomainAuthorsDist,
  getDomainAuthorsSeries,
  getDomainCommitsDist,
  getDomainCommitsSeries,
  getEmailSeries,
  getFirstCommitDate,
  getIssuesSeries,
  getPullRequestsSeries,
  getRegionAuthorsSeries,
  getRegionCommitsSeries,
} from '@/pages/SpecificTopics/DataProcessing';
import { secondaryDirSql } from '@/pages/ContribDistribution/DataSQLs';

const { DirectoryTree } = Tree;
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

const ANNOTATIONS = [
  {
    type: 'region',
    start: [201404, 'min'],
    end: [201405, 'max'],
  },
  {
    type: 'dataRegion',
    start: [201404, 'min'],
    end: [201405, 'max'],
    // position: (xScale, yScale) => {
    //   return [`${xScale.scale(201404) * 100}%`, `${(1 - yScale.value.scale(50)) * 100}%`];
    // },
    text: {
      content: '捐赠给Apache',
    },
  },

  {
    type: 'region',
    start: [201412, 'min'],
    end: [201501, 'max'],
  },
  {
    type: 'dataRegion',
    start: [201412, 'min'],
    end: [201501, 'max'],
    text: {
      content: '成为\nApache顶级项目',
    },
  },

  {
    type: 'region',
    start: [201601, 'min'],
    end: [201608, 'max'],
  },
  {
    type: 'dataRegion',
    start: [201601, 'min'],
    end: [201608, 'max'],
    text: {
      content: 'Pre-A',
    },
  },

  {
    type: 'region',
    start: [201801, 'min'],
    end: [201802, 'max'],
  },
  {
    type: 'dataRegion',
    start: [201801, 'min'],
    end: [201802, 'max'],
    text: {
      content: 'Round B,阿里疑似入局',
    },
  },

  {
    type: 'region',
    start: [201901, 'min'],
    end: [201902, 'max'],
  },
  {
    type: 'dataRegion',
    start: [201901, 'min'],
    end: [201902, 'max'],
    text: {
      content: '阿里收购\nData Artisan更名为Ververica',
    },
  },
];

function generateLabelGroup(data, mappingData, keyField, countKey) {
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
  const keyStr = data[keyField];
  const countStr = data[countKey];
  group.addShape({
    type: 'text',
    attrs: {
      x: 10,
      y: 8,
      text: `${keyStr}(${countStr}) ${percentStr}`,
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
      domainCommitsSeriesData: [],
      domainAuthorsSeriesData: [],
      domainCommitDistData: [],
      domainAuthorsDistData: [],
      emailSeriesData: [],
      regionCommitsSeriesData: [],
      regionAuthorsSeriesData: [],
      issuesSeriesData: [],
      pullRequestsSeriesData: [],
      dirSeriesDatas: [],
    };

    this.onDirSelect = this.onDirSelect.bind(this);
    const OWNER = 'apache';
    const REPO = 'flink';

    getFirstCommitDate(OWNER, REPO).then((firstCommitDate) => {
      const now = new Date();

      getAuthorAndCommitCount(OWNER, REPO, firstCommitDate, now).then((result) => {
        this.setState({ authorCommitData: result });
      });

      getDomainCommitsSeries(OWNER, REPO, firstCommitDate, now).then((allDomainSeries) => {
        console.log('DEBUG:', allDomainSeries);
        this.setState({ domainCommitsSeriesData: allDomainSeries });
      });

      getDomainCommitsDist('apache', 'flink', 10).then((domainCommitDistData) => {
        this.setState({ domainCommitDistData });
      });

      getDomainAuthorsSeries('apache', 'flink', 10).then((domainAuthorsSeries) => {
        this.setState({ domainAuthorsSeriesData: domainAuthorsSeries });
      });

      getDomainAuthorsDist('apache', 'flink', 10).then((domainAuthorsDistData) => {
        this.setState({ domainAuthorsDistData });
      });

      getEmailSeries('apache', 'flink').then((allEmailSeries) => {
        this.setState({ emailSeriesData: allEmailSeries });
      });

      getRegionCommitsSeries('apache', 'flink').then((regionSeries) => {
        this.setState({ regionCommitsSeriesData: regionSeries });
      });

      getRegionAuthorsSeries('apache', 'flink').then((regionAuthorsSeries) => {
        this.setState({ regionAuthorsSeriesData: regionAuthorsSeries });
      });

      getIssuesSeries('apache', 'flink').then((issuesSeries) => {
        this.setState({ issuesSeriesData: issuesSeries });
      });

      getPullRequestsSeries('apache', 'flink').then((prsSeries) => {
        this.setState({ pullRequestsSeriesData: prsSeries });
      });

      runSql(secondaryDirSql('apache', 'flink')).then((result: { columns: any; data: any }) => {
        const allDirPaths = result.data.map((item: string[]) => item[0]);
        const dirTree = pathsToTree(allDirPaths);
        this.setState({ dirData: dirTree });
      });
    });
  }

  makeupMissingDates(startDate: Date, dataMap, endDate: Date) {
    const madeUpArray = [];
    // const firstDateInt = array[0][3];
    // const firstDate = new Date(parseInt(firstDateInt / 100), firstDateInt % 100);
    let iterDate = new Date(startDate.getFullYear(), startDate.getMonth());

    function fillEmptyDateItem(dateInt: Number) {
      madeUpArray.push({
        category: 'authorCount',
        date: dateInt,
        value: 0,
      });
      madeUpArray.push({
        category: 'committerCount',
        date: dateInt,
        value: 0,
      });
      madeUpArray.push({
        category: 'alterFileCount',
        date: dateInt,
        value: 0,
      });
    }

    while (iterDate < endDate) {
      const iterDateInt = dateToYearMonthInt(iterDate.toISOString());
      if (dataMap.hasOwnProperty(iterDateInt)) {
        madeUpArray.push({
          category: 'authorCount',
          date: iterDateInt,
          value: dataMap[iterDateInt].authorCount,
        });
        madeUpArray.push({
          category: 'committerCount',
          date: iterDateInt,
          value: dataMap[iterDateInt].committerCount,
        });
        madeUpArray.push({
          category: 'alterFileCount',
          date: iterDateInt,
          value: dataMap[iterDateInt].alterFileCount,
        });
      } else {
        fillEmptyDateItem(iterDateInt);
      }
      iterDate = new Date(iterDate.getFullYear(), iterDate.getMonth() + 1);
    }

    // dataMap.forEach((item) => {
    //   const date = item[3];
    //   const authorCount = item[4];
    //   const committerCount = item[5];
    //   const alterFileCount = item[6];
    //   madeUpArray.push({
    //     category: 'authorCount',
    //     date,
    //     value: authorCount,
    //   });
    //   madeUpArray.push({
    //     category: 'committerCount',
    //     date,
    //     value: committerCount,
    //   });
    //   madeUpArray.push({
    //     category: 'alterFileCount',
    //     date,
    //     value: alterFileCount,
    //   });
    // });
    //
    // const lastDateInt = dataMap[dataMap.length - 1][3];
    // const lastDate = new Date(parseInt(lastDateInt / 100), lastDateInt % 100);
    // iterDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1);
    // while (iterDate <= endDate) {
    //   fillEmptyDateItem(iterDate);
    //   // madeUpArray.push({
    //   //   category: 'authorCount',
    //   //   date: dateToYearMonthInt(iterDate.toISOString()),
    //   //   value: 0,
    //   // });
    //   // madeUpArray.push({
    //   //   category: 'committerCount',
    //   //   date: dateToYearMonthInt(iterDate.toISOString()),
    //   //   value: 0,
    //   // });
    //   // madeUpArray.push({
    //   //   category: 'alterFileCount',
    //   //   date: dateToYearMonthInt(iterDate.toISOString()),
    //   //   value: 0,
    //   // });
    //   iterDate = new Date(iterDate.getFullYear(), iterDate.getMonth() + 1);
    return madeUpArray;
  }

  onDirSelect(selectedDirs) {
    const dirPromises = selectedDirs.map((dir) => {
      return getDirSeries('apache', 'flink', dir + '/');
    });
    dirPromises.push(runSql(firstCommitDateSql('apache', 'flink')));

    Promise.all(dirPromises).then((results) => {
      const firstCommitDateResult = results.pop();
      const firstCommitDate = new Date(firstCommitDateResult.data[0][0]);
      const now = new Date();

      const dirSeriesDatas = results.map((result) => {
        const dataMap = {};
        result.data.forEach((item) => {
          const dateInt = item[3];
          const authorCount = item[4];
          const committerCount = item[5];
          const alterFileCount = item[6];
          dataMap[dateInt] = {
            authorCount,
            committerCount,
            alterFileCount,
          };
        });
        return {
          data: this.makeupMissingDates(firstCommitDate, dataMap, now),
          dir: result.data[0][2],
        };
      });

      console.log(dirSeriesDatas);
      this.setState({ dirSeriesDatas });
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
              annotations={ANNOTATIONS}
            />
          </Col>
        </Row>

        <Row>
          <Col span={16}>
            <Divider>Time Series of Domain Commits</Divider>
            <Line
              data={this.state.domainCommitsSeriesData}
              annotations={ANNOTATIONS}
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
            <Divider>Distribution of top 10 Domain Commits</Divider>
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
                  return generateLabelGroup(data, mappingData, 'domain', 'totalCommitCount');
                },
              }}
              theme={{
                colors10: COLORS10_ELEGENT,
              }}
              data={this.state.domainCommitDistData}
            />
          </Col>
        </Row>

        <Row>
          <Col span={16}>
            <Divider>Time Series of Domain Authors</Divider>
            <Line
              data={this.state.domainAuthorsSeriesData}
              annotations={ANNOTATIONS}
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
            <Divider>Distribution of top 10 Domain Authors</Divider>
            <Pie
              radius={0.5}
              angleField="authorCount"
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
                  return generateLabelGroup(data, mappingData, 'domain', 'authorCount');
                },
              }}
              theme={{
                colors10: COLORS10_ELEGENT,
              }}
              data={this.state.domainAuthorsDistData}
            />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Divider>Time Series of Top 10 Author Commits</Divider>
            <Line
              data={this.state.emailSeriesData}
              xField="date"
              yField="value"
              seriesField="category"
              legend={{
                position: 'bottom',
                flipPage: false,
              }}
              annotations={ANNOTATIONS}
            />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Divider>Time Series of Regions Commits</Divider>
            <Line
              data={this.state.regionCommitsSeriesData}
              xField="date"
              yField="value"
              seriesField="category"
              legend={{
                position: 'bottom',
                flipPage: false,
              }}
              annotations={ANNOTATIONS}
            />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Divider>Time Series of Regions Authors</Divider>
            <Line
              data={this.state.regionAuthorsSeriesData}
              xField="date"
              yField="value"
              seriesField="category"
              legend={{
                position: 'bottom',
                flipPage: false,
              }}
              annotations={ANNOTATIONS}
            />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Divider>Time Series of Issues</Divider>
            <Line
              data={this.state.issuesSeriesData}
              xField="date"
              yField="value"
              seriesField="category"
              legend={{
                position: 'bottom',
                flipPage: false,
              }}
              annotations={ANNOTATIONS}
            />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Divider>Time Series of Pull Requests</Divider>
            <Line
              data={this.state.pullRequestsSeriesData}
              xField="date"
              yField="value"
              seriesField="category"
              legend={{
                position: 'bottom',
                flipPage: false,
              }}
              annotations={ANNOTATIONS}
            />
          </Col>
        </Row>

        <Row>
          <Col span={4}>
            <DirectoryTree
              height={400}
              multiple
              defaultExpandAll
              onSelect={this.onDirSelect}
              // onExpand={this.onExpand}
              treeData={this.state.dirData}
              expandAction={false}
              // selectedKeys={this.props.selectedDirs}
            />
          </Col>
        </Row>

        <Row>
          {this.state.dirSeriesDatas.map((dirSeriesData) => {
            console.log('single data:', dirSeriesData);
            const key = `${parseInt(Math.random() * 0xffffff)}`;
            return (
              <Col span={24}>
                <Divider>{dirSeriesData.dir}</Divider>
                <Line
                  key={key}
                  data={dirSeriesData.data}
                  xField="date"
                  yField="value"
                  seriesField="category"
                  annotations={ANNOTATIONS}
                />
              </Col>
            );
          })}
        </Row>
      </div>
    );
  }
}
