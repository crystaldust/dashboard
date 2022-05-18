import React from 'react';
import { Divider, Table, Tag } from 'antd';
import styles from '@/pages/GeoDistribution/index.less';
import { getIntl } from 'umi';

const intl = getIntl();
const SECONDARY_DIR_TABLE_COLS = [
  {
    title: intl.formatMessage({ id: 'geodist.secondaryDirTable.colname.selectedDirs' }),
    dataIndex: 'secondaryDir',
  },
  {
    title: intl.formatMessage({ id: 'geodist.secondaryDirTable.colname.fileRegionDist' }),
    dataIndex: 'fileRegionDist',
    render: secondaryDirTableCellRender,
  },
  {
    title: intl.formatMessage({ id: 'geodist.secondaryDirTable.colname.fileEmailDist' }),
    dataIndex: 'fileEmailDist',
    render: secondaryDirTableCellRender,
  },
  {
    title: intl.formatMessage({ id: 'geodist.secondaryDirTable.colname.developerRegionDist' }),
    dataIndex: 'developerRegionDist',
    render: secondaryDirTableCellRender,
  },
  {
    title: intl.formatMessage({ id: 'geodist.secondaryDirTable.colname.developerEmailDist' }),
    dataIndex: 'developerEmailDist',
    render: secondaryDirTableCellRender,
  },
];

function secondaryDirTableCellRender(cellData, rowData, index) {
  return cellData.map((regionInfo, index) => {
    const { region, value } = regionInfo;
    const line = `${region}: ${value}`;
    const key = `${rowData.secondaryDir}-${region}-${line}`;
    // TODO It's super weried that JS always complain 'each children in list should have uniq key'
    // TODO while it's really 'uniq' enough
    return (
      // <div key={key}>
      <Tag key={key} color={'volcano'}>
        {line}
      </Tag>
      // </div>
    );
  });
}

export default class SecondaryDirsTable extends React.Component<any, any> {
  render() {
    return (
      <div>
        {!!this.props.secondaryDirsTableData.length && (
          <div>
            <Divider>
              {intl.formatMessage({ id: 'geodist.secondaryDirTable.header.secondaryDir' })}
            </Divider>
            <span className={styles.componentIntro}>
              {intl.formatMessage({ id: 'geodist.secondaryDirTable.desc' })}
            </span>
            <Table
              columns={SECONDARY_DIR_TABLE_COLS}
              dataSource={this.props.secondaryDirsTableData}
              onRow={(row) => {
                return {
                  onClick: () => {
                    if (this.props.onSecondaryDirRowClicked) {
                      this.props.onSecondaryDirRowClicked(row);
                    }
                  },
                };
              }}
            />
          </div>
        )}
      </div>
    );
  }
}
