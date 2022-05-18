import React from 'react';
import { Divider, Table, Tag } from 'antd';

import { getIntl } from 'umi';

const intl = getIntl();

const DEVELOPER_INFO_COLS = [
  {
    title: intl.formatMessage({ id: 'geodist.developerInfoTable.colname.owner' }),
    dataIndex: 'owner',
  },
  {
    title: intl.formatMessage({ id: 'geodist.developerInfoTable.colname.repo' }),
    dataIndex: 'repo',
  },
  {
    title: intl.formatMessage({ id: 'geodist.developerInfoTable.colname.email' }),
    dataIndex: 'email',
  },
  {
    title: intl.formatMessage({ id: 'geodist.developerInfoTable.colname.githubProfile' }),
    dataIndex: 'githubProfile',
    render: (profile) => {
      if (!profile) {
        return <div>No GitHub Profile found</div>;
      }
      return (
        <div>
          <a href={profile.htmlUrl} target={'_blank'}>
            <img src={profile.avatarUrl} width={100} height={100} />
          </a>
          <div>{profile.name != '' ? profile.name : profile.login}</div>
          <a href={profile.htmlUrl} target={'_blank'}>
            @{profile.login}
          </a>
          <div>{profile.company != '' ? `${GHPROFILE_COMPANY}: ${profile.company}` : ''}</div>
          <div>{profile.country != '' ? `${GHPROFILE_COUNTRY}: ${profile.country}` : ''}</div>
          <div>{profile.location != '' ? `${GHPROFILE_LOCATION}: ${profile.location}` : ''}</div>
        </div>
      );
    },
  },
  {
    title: intl.formatMessage({ id: 'geodist.developerInfoTable.colname.contribTzDist' }),
    dataIndex: 'dist',
    render: (dist) => {
      return dist.map((item) => {
        for (const tz in item) {
          const count = item[tz];
          const tzStr = parseInt(tz) > 0 ? `+${tz}` : tz;
          const content = `${tzStr}: ${count}`;
          return (
            <div key={Math.random()}>
              <Tag key={Math.random()}>{content}</Tag>
            </div>
          );
        }
      });
    },
  },
];
const GHPROFILE_COMPANY = intl.formatMessage({
  id: 'geodist.developerInfoTable.githubProfile.company',
});
const GHPROFILE_LOCATION = intl.formatMessage({
  id: 'geodist.developerInfoTable.githubProfile.location',
});
const GHPROFILE_COUNTRY = intl.formatMessage({
  id: 'geodist.developerInfoTable.githubProfile.countryOrRegion',
});

export class DeveloperInfoTable extends React.Component<any, any> {
  render() {
    return (
      <div>
        {!!this.props.developerInfoData.length && (
          <div>
            <Divider>
              {intl.formatMessage({ id: 'geodist.developerInfoTable.header.developerInfo' })}
            </Divider>
            <Table
              columns={DEVELOPER_INFO_COLS}
              dataSource={this.props.developerInfoData}
              // onRow={(row) => {
              //   return {
              //     onClick: () => {
              //       this.onDeveloperRowClicked(row);
              //     },
              //   };
              // }}
            />
          </div>
        )}
      </div>
    );
  }
}
