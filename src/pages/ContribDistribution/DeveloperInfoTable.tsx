import React from 'react';
import { Divider, Table, Tag } from 'antd';
import { getIntl } from 'umi';
import { Radar } from '@ant-design/plots';

const intl = getIntl();

const DEVELOPER_INFO_COLS = [
  {
    title: intl.formatMessage({ id: 'contribDist.developerInfoTable.colname.owner' }),
    dataIndex: 'owner',
  },
  {
    title: intl.formatMessage({ id: 'contribDist.developerInfoTable.colname.repo' }),
    dataIndex: 'repo',
  },
  {
    title: intl.formatMessage({ id: 'contribDist.developerInfoTable.colname.email' }),
    dataIndex: 'email',
  },
  {
    title: intl.formatMessage({ id: 'contribDist.developerInfoTable.colname.githubProfile' }),
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
    title: intl.formatMessage({ id: 'contribDist.developerInfoTable.colname.contribTzDist' }),
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
  {
    title: intl.formatMessage({ id: 'contribDist.developerInfoTable.colname.activityRadar' }),
    align: 'center',
    render: (cellData) => {
      if (cellData.activity) {
        return <ActivityRadar radarData={cellData.activity} />;
      }
      return <div></div>;
    },
  },
];
const GHPROFILE_COMPANY = intl.formatMessage({
  id: 'contribDist.developerInfoTable.githubProfile.company',
});
const GHPROFILE_LOCATION = intl.formatMessage({
  id: 'contribDist.developerInfoTable.githubProfile.location',
});
const GHPROFILE_COUNTRY = intl.formatMessage({
  id: 'contribDist.developerInfoTable.githubProfile.countryOrRegion',
});

class ActivityRadar extends React.Component<any, any> {
  constructor(props) {
    super(props);
    const { radarData } = this.props;
  }
  render() {
    return (
      <Radar
        animation={false}
        data={this.props.radarData || []}
        height={this.props.height || 225}
        xField={'name'}
        yField={'value'}
        yAxis={{ max: 100, min: 0 }}
      />
    );
  }
}

export class DeveloperInfoTable extends React.Component<any, any> {
  render() {
    return (
      <div>
        {!!this.props.developerInfoData.length && (
          <div>
            <Divider>
              {intl.formatMessage({ id: 'contribDist.developerInfoTable.header.developerInfo' })}
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
