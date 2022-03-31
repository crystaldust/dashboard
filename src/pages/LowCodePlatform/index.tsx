import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { runSql } from '@/services/clickhouse';
import { Col, Collapse, Row } from 'antd';

import DynamicDataTable, { parseTableData } from '@/pages/LowCodePlatform/DynamicDataTable';
import SQLEditor from '@/pages/LowCodePlatform/SQLEditor';

const { Panel } = Collapse;

export default class Index extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      tableColumns: [],
      tableData: [],
    };

    this.sqlUpdate = this.sqlUpdate.bind(this);
  }

  sqlUpdate(newSql: string) {
    runSql(newSql).then((result) => {
      const tableResult = parseTableData(result);
      this.setState({ ...tableResult });
    });
  }

  render() {
    return (
      <PageContainer>
        <Row>
          <Col span={24}>
            <Collapse>
              <Panel header="SQL Editor" key="1">
                <SQLEditor onSqlUpdate={this.sqlUpdate} />
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
