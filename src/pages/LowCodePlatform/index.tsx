import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { getActivities, getDeveloperActivities, runSql } from '@/services/clickhouse';
import { Col, Collapse, Row } from 'antd';

import DynamicDataTable, { parseTableData } from '@/pages/LowCodePlatform/DynamicDataTable';
import SQLEditor from '@/pages/LowCodePlatform/SQLEditor';
import Charts from '@/pages/LowCodePlatform/Charts';
import { message } from 'antd';

const { Panel } = Collapse;
import { parseActivities } from '@/pages/LowCodePlatform/Charts';
import { Radar } from '@ant-design/plots';

const DEFAULT_SQL =
  "SELECT * FROM activities WHERE owner='kubernetes' AND repo='kubernetes' ORDER BY code_contribution DESC LIMIT 2";

export default class Index extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    // Table related state
    this.state = {
      tableColumns: [],
      tableData: [],
    };

    // SQL Editor related callbacks
    this.runSql = this.runSql.bind(this);
    // Table related callbacks
    this.tableRowClick = this.tableRowClick.bind(this);

    // Run default SQL
    this.runSql(DEFAULT_SQL);
  }

  runSql(sql: string) {
    runSql(sql)
      .then((result) => {
        const tableResult = parseTableData(result);
        // tableResult.tableData = parseActivities(tableResult.tableData);
        this.setState({ ...tableResult });
      })
      .catch((e) => {
        // TODO If there is more code logics after fetching sql, then the error might not be caused by running sql
        message.error('Failed to execute SQL');
      });
  }

  tableRowClick(row: object) {
    if (row.owner && row.repo && row.github_login) {
      getDeveloperActivities(row.owner, row.repo, row.github_login).then((activity) => {
        this.setState({ chartData: activity });
      });
    }
  }

  render() {
    return (
      <PageContainer>
        <Row>
          <Col span={24}>
            <Collapse>
              <Panel header="SQL Editor" key="1">
                <SQLEditor defaultCode={DEFAULT_SQL} runSql={this.runSql} />
              </Panel>
            </Collapse>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DynamicDataTable
              columns={this.state.tableColumns}
              tableData={this.state.tableData}
              rowClick={this.tableRowClick}
            />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Charts data={this.state.chartData} />
          </Col>
        </Row>
      </PageContainer>
    );
  }
}
