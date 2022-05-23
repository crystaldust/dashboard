import React from 'react';
import { Divider, Table, Tag } from 'antd';
import styles from '@/pages/ContribDistribution/index.less';
import { getIntl } from 'umi';

const intl = getIntl();

const DEVELOPER_CONTRIB_IN_SECONDARY_DIR_COLS = [
  {
    title: intl.formatMessage({ id: 'contribDist.secondaryDirTable.colname.selectedDirs' }),
    dataIndex: 'secondaryDir',
  },
  {
    title: intl.formatMessage({
      id: 'contribDist.developerContribInSecondaryDirTable.colname.developerEmail',
    }),
    dataIndex: 'developerEmail',
  },
  {
    title: intl.formatMessage({
      id: 'contribDist.developerContribInSecondaryDirTable.colname.fileCount',
    }),
    dataIndex: 'fileCount',
  },
  {
    title: intl.formatMessage({
      id: 'contribDist.developerContribInSecondaryDirTable.colname.tzDist',
    }),
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

let prevClickedRowRef = undefined;

export default class DirDeveloperContribTable extends React.Component<any, any> {
  render() {
    return (
      <div>
        {!!this.props.developerContribInSecondaryDirData.length && (
          <div>
            <Divider>
              {intl.formatMessage({
                id: 'contribDist.developerContribInSecondaryDirTable.header.developerInfo',
              })}
            </Divider>
            <span className={styles.componentIntro}>
              {intl.formatMessage({
                id: 'contribDist.developerContribInSecondaryDirTable.desc',
              })}
            </span>
            <Table
              rowClassName={(record, index) => {
                // console.log(record);
                return record.clicked ? styles.clickedTableRow : styles.normalTableRow;
              }}
              columns={DEVELOPER_CONTRIB_IN_SECONDARY_DIR_COLS}
              dataSource={this.props.developerContribInSecondaryDirData}
              onRow={(row) => {
                return {
                  onClick: (e) => {
                    // let tr = e.target.parentNode;
                    // console.log(tr == prevClickedRowRef);
                    // if (prevClickedRowRef && prevClickedRowRef != tr) {
                    //   prevClickedRowRef.style.backgroundColor = '';
                    // }
                    //
                    // tr.style.backgroundColor = 'rgb(115,201,236)';
                    // prevClickedRowRef = tr;
                    row.clicked = true;

                    if (this.props.onDeveloperRowClicked) {
                      this.props.onDeveloperRowClicked(row);
                    }
                  },
                  // onMouseEnter: (e) => {
                  //   console.log('hover!');
                  //   let tr = e.target.parentNode;
                  //   console.log(tr.style, tr.style.backgroundColor);
                  //   if (tr == prevClickedRowRef) {
                  //     tr.style.backgroundColor = 'rgb(115,201,236)';
                  //   }
                  // },
                };
              }}
            />
          </div>
        )}
      </div>
    );
  }
}
