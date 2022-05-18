import React from 'react';
import { Divider, Table, Tag } from 'antd';
import styles from '@/pages/GeoDistribution/index.less';
import { getIntl } from 'umi';

const intl = getIntl();

const DEVELOPER_CONTRIB_IN_SECONDARY_DIR_COLS = [
  {
    title: intl.formatMessage({ id: 'geodist.secondaryDirTable.colname.selectedDirs' }),
    dataIndex: 'secondaryDir',
  },
  {
    title: intl.formatMessage({
      id: 'geodist.developerContribInSecondaryDirTable.colname.developerEmail',
    }),
    dataIndex: 'developerEmail',
  },
  {
    title: intl.formatMessage({
      id: 'geodist.developerContribInSecondaryDirTable.colname.fileCount',
    }),
    dataIndex: 'fileCount',
  },
  {
    title: intl.formatMessage({ id: 'geodist.developerContribInSecondaryDirTable.colname.tzDist' }),
    dataIndex: 'tzDist',
    render: (cellData) => {
      return cellData.map((item) => {
        for (const tz in item) {
          const count = item[tz];
          let key = tz;
          if (parseInt(tz) > 0) {
            key = `+${tz}`;
          }
          const content = `${key}: ${count}`;
          return <Tag key={key}>{content}</Tag>;
        }
      });
    },
  },
];

export default class DirDeveloperContribTable extends React.Component<any, any> {
  render() {
    return (
      <div>
        {!!this.props.developerContribInSecondaryDirData.length && (
          <div>
            <Divider>
              {intl.formatMessage({
                id: 'geodist.developerContribInSecondaryDirTable.header.developerInfo',
              })}
            </Divider>
            <span className={styles.componentIntro}>
              {intl.formatMessage({
                id: 'geodist.developerContribInSecondaryDirTable.desc',
              })}
            </span>
            <Table
              columns={DEVELOPER_CONTRIB_IN_SECONDARY_DIR_COLS}
              dataSource={this.props.developerContribInSecondaryDirData}
              onRow={(row) => {
                return {
                  onClick: () => {
                    if (this.props.onDeveloperRowClicked) {
                      this.props.onDeveloperRowClicked(row);
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
