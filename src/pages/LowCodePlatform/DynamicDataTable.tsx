import React from 'react';
import ProTable from '@ant-design/pro-table';
type RowBase = {
  key: number;
};

type ActivityRow = RowBase & CKData.Activity;

export function parseTableData(result: { columns: [][]; data: [][] }) {
  console.log('result:', result)
  const tableColumns: object[] = result.columns.map((colInfo: string[]) => ({
    title: colInfo[0],
    dataIndex: colInfo[0],
  }));

  const tableData: object[] = result.data.map((dataItem, dataIndex) => {
    const rowData = { key: dataIndex };
    result.columns.forEach((colInfo: string[], colIndex) => {
      const colName = colInfo[0]; // colInfo[1] is col type, might be used in the future
      const colType = colInfo[1];
      // If dataVal's type is declared to 'number|string', toFixed method won't apply
      let dataVal: any = dataItem[colIndex];
      if (colType === 'Float64') {
        dataVal = parseFloat(dataVal.toFixed(2));
      }
      rowData[colName] = dataVal;
    });
    return rowData;
  });

  return { tableColumns, tableData };
}

export default class DynamicDataTable extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      tableData: [],
      columns: [],
    };

    this.handleRowClick = this.handleRowClick.bind(this);
  }

  handleRowClick(row: any) {
    if (this.props.rowClick) {
      this.props.rowClick(row);
    }
  }

  render() {
    return (
      <ProTable
        columns={this.props.columns}
        dataSource={this.props.tableData}
        search={false}
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 8 }}
        onRow={(row: ActivityRow) => {
          return {
            onClick: () => {
              this.handleRowClick(row);
            },
          };
        }}
      />
    );
  }
}
