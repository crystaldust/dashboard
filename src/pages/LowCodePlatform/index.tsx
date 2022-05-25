import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { runSql } from '@/services/clickhouse';
import { Col, Collapse, Row } from 'antd';

import DynamicDataTable, { parseTableData } from '@/pages/LowCodePlatform/DynamicDataTable';
import SQLEditor from '@/pages/LowCodePlatform/SQLEditor';
import Charts from '@/pages/LowCodePlatform/Charts';
import { message } from 'antd';

const { Panel } = Collapse;
import { parseActivities } from '@/pages/LowCodePlatform/Charts';
import { getIntl } from 'umi';

const intl = getIntl();

const DEFAULT_SQL =
  "SELECT * FROM activities_mapped WHERE owner='torvalds' AND repo='linux' ORDER BY code_contribution DESC LIMIT 100";
// "SELECT * FROM activities WHERE owner='kubernetes' AND repo='kubernetes' ORDER BY code_contribution DESC LIMIT 2";

export default class Index extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    // Table related state
    this.state = {
      tableColumns: [],
      tableData: [],
      fetchActivities: false,
    };

    // SQL Editor related callbacks
    this.runSql = this.runSql.bind(this);
    // Table related callbacks
    this.tableRowClick = this.tableRowClick.bind(this);
  }

  componentDidMount() {
    // Run default SQL
    this.runSql(DEFAULT_SQL);
  }

  runSql(sql: string) {
    const fetchActivities: boolean = sql.toLowerCase().indexOf(' from activities_mapped ') != -1;
    this.setState({ fetchActivities, chartData: null });

    runSql(sql)
      .then((result) => {
        const tableResult = parseTableData(result);
        // if (fetchActivities) {
        //   tableResult.tableData = parseActivities(tableResult.tableData);
        // }
        this.setState({ ...tableResult });
      })
      .catch((e) => {
        // TODO If there is more code logics after fetching sql, then the error might not be caused by running sql
        message.error('Failed to execute SQL');
      });
  }

  tableRowClick(row: object) {
    if (row.owner && row.repo && row.github_login && this.state.fetchActivities) {
      this.setState({
        chartData: {
          codeContribution: row.code_contribution,
          codeTweaking: row.code_tweaking,
          githubId: row.github_id,
          githubLogin: row.github_login,
          issueCoordination: row.issue_coordination,
          issueReporting: row.issue_reporting,
          knowledgeSharing: row.knowledge_sharing,
          owner: row.owner,
          progressControl: row.progress_control,
          repo: row.repo,
        },
      });
    }
  }

  render() {
    return (
      <PageContainer>
        <Row>
          <Col span={24}>
            <Collapse>
              <Panel header={intl.formatMessage({ id: 'lowcodePlatform.sqlEditor' })} key="1">
                <div style={{ fontSize: 14, color: '#555555' }}>
                  {intl.formatMessage({ id: 'lowcodePlatform.sqlEditorIntro' })}
                </div>
                <SQLEditor defaultCode={DEFAULT_SQL} runSql={this.runSql} />
              </Panel>
            </Collapse>
          </Col>
        </Row>
        <Row align="middle">
          <Col span={18}>
            <DynamicDataTable
              columns={this.state.tableColumns}
              tableData={this.state.tableData}
              rowClick={this.tableRowClick}
            />
          </Col>

          {this.state.fetchActivities && !!this.state.chartData && (
            <Col span={6}>
              <Charts data={this.state.chartData} />
            </Col>
          )}
        </Row>
      </PageContainer>
    );
  }
}
