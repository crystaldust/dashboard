import React from 'react';
import { Avatar, Card, Col, Modal, Row } from 'antd';
import Meta from 'antd/es/card/Meta';

export class DeveloperCard extends React.Component<any, any> {
  developerName = 'Developer';
  influence = {
    contribution: 97.8,
    social: 77.9,
    power: 81,
  };

  constructor(props) {
    super(props);

    if (props.hasOwnProperty('developerInfo')) {
      this.developerName = props.developerInfo.name;
      this.influence = props.developerInfo.influence;
    }
    this.onClick = this.onClick.bind(this);
    // handleCommunityCardOpen={this.communityCardOpen}
  }

  onClick() {
    if (this.props.hasOwnProperty('handleClick')) {
      this.props.handleClick(this.props.developerInfo);
    }
  }

  render() {
    return (
      <Card hoverable={true} onClick={this.onClick}>
        <Meta title={this.developerName} avatar={<Avatar src={'icons/coding.png'} />} />
        <div>Contribution: {this.influence.contribution}</div>
        <div>Social: {this.influence.social}</div>
        <div>Power: {this.influence.power}</div>
      </Card>
    );
  }
}

export class DeveloperWindow extends React.Component<any, any> {
  render() {
    let content = <div />;
    if (this.props.developerInfo.hasOwnProperty('influence')) {
      content = (
        <div>
          <b>Influence</b>
          <div>Contribution: {this.props.developerInfo.influence.contribution}</div>
          <div>Social: {this.props.developerInfo.influence.social}</div>
          <div>Power: {this.props.developerInfo.influence.power}</div>
        </div>
      );
    }
    return (
      <Modal
        closable={true}
        title={`${this.props.developerInfo.name} Community Stats`}
        visible={this.props.visible}
        onOk={this.props.onOk}
        onCancel={this.props.onCancel}
        width={'100%'}
        footer={null}
      >
        {content}
      </Modal>
    );
  }
}

export class DeveloperTab extends React.Component<any, any> {
  developers = [
    {
      name: 'John Smith',
      influence: {
        contribution: 93.1,
        social: 18.8,
        power: 71.2,
      },
    },
    {
      name: 'Peter Laun',
      influence: {
        contribution: 72.1,
        social: 88.6,
        power: 31.9,
      },
    },
    {
      name: 'Lance Armstrong',
      influence: {
        contribution: 22.3,
        social: 89.7,
        power: 92.9,
      },
    },
  ];

  constructor(props) {
    super(props);

    if (props.hasOwnProperty('developers')) {
      this.developers = props.developers;
    }

    this.onDeveloperCardClick = this.onDeveloperCardClick.bind(this);
    this.closeWindow = this.closeWindow.bind(this);

    this.state = {
      showDeveloperWindow: false,
      developerInfo: {},
    };
  }

  onDeveloperCardClick(developerInfo: object) {
    this.setState({
      showDeveloperWindow: true,
      developerInfo,
    });
  }

  closeWindow() {
    this.setState({
      showDeveloperWindow: false,
    });
  }

  render() {
    return (
      <div>
        <Row gutter={4}>
          {this.developers.map((developer) => {
            return (
              <Col span={3}>
                <DeveloperCard developerInfo={developer} handleClick={this.onDeveloperCardClick} />
              </Col>
            );
          })}
        </Row>
        <DeveloperWindow
          visible={this.state.showDeveloperWindow}
          developerInfo={this.state.developerInfo}
          onOk={this.closeWindow}
          onCancel={this.closeWindow}
        />
      </div>
    );
  }
}
