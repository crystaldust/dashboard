import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { runSql } from '@/services/clickhouse';
import { Col, Collapse, Row } from 'antd';

import DynamicDataTable, { parseTableData } from '@/pages/LowCodePlatform/DynamicDataTable';
import SQLEditor from '@/pages/LowCodePlatform/SQLEditor';
import { message } from 'antd';

const { Panel } = Collapse;

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
  }

  runSql(sql: string) {
    runSql(sql)
      .then((result) => {
        const tableResult = parseTableData(result);
        this.setState({ ...tableResult });
      })
      .catch(() => {
        message.error('Failed to execute SQL');
      });
  }

  render() {
    return (
      <PageContainer>
        <Row>
          <Col span={24}>
            <Collapse>
              <Panel header="SQL Editor" key="1">
                <SQLEditor runSql={this.runSql} />
              </Panel>
            </Collapse>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DynamicDataTable columns={this.state.tableColumns} tableData={this.state.tableData} />
          </Col>
        </Row>

        <Row>
          <Col span={24}>Charts here</Col>
        </Row>
      </PageContainer>
    );
  }
}
