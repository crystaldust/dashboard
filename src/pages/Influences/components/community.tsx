import React from 'react';
import { Avatar, Card, Modal, Tabs } from 'antd';
import Meta from 'antd/es/card/Meta';
import { DeveloperTab } from '@/pages/Influences/components/developer';

export class CommunityWindow extends React.Component<any, any> {
  static items = [
    {
      key: '1',
      label: `Developer Influence`,
      children: `Content of personal influence`,
      // TODO pass developers data to <DeveloperTab>
      component: <DeveloperTab />,
    },
    {
      key: '2',
      label: `Group Influence`,
      children: `Content of group influence`,
      component: <div>Content of group influence xxx</div>,
    },
    {
      key: '3',
      label: `Projects`,
      children: `Important projects of the community`,
      component: <div>Content of projects xxx</div>,
    },
  ];

  render() {
    return (
      <Modal
        closable={true}
        title={`${this.props.communityInfo.name} Community Stats`}
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        width={'100%'}
        footer={null}
      >
        <Tabs defaultActiveKey="1">
          {CommunityWindow.items.map((item, index) => {
            return (
              <Tabs.TabPane tab={item.label} key={`community_tab_item_${index}`}>
                {item.component}
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </Modal>
    );
  }
}

export class CommunityCard extends React.Component<any, any> {
  name = '';
  logo = '';
  description = '';
  statistics = {};

  constructor(props) {
    super(props);

    this.name = props.data.name;
    this.logo = props.data.logo;
    this.description = props.data.description;
    this.statistics = props.data.statistics;

    // this.state = {
    //   name: 'Community Name',
    // };

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if (this.props.hasOwnProperty('handleCommunityCardOpen')) {
      this.props.handleCommunityCardOpen({
        name: this.name,
        description: this.description,
      });
    }
  }

  render() {
    return (
      <Card hoverable={true} onClick={this.onClick}>
        <Meta
          title={this.name}
          description={this.description}
          avatar={<Avatar src={this.logo} style={{ width: '35px' }} />}
        />
        {this.statistics.developerCount}
      </Card>
    );
  }
}
