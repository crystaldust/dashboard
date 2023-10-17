import React from 'react';
import { Col, Row } from 'antd';
import { CommunityCard } from './components';
import {
  CentralityScoreTable,
  MaximumIntensityTable,
} from '@/components/InfluenceMetrics/Contribution';

// TODO Delete the data simulation code here:
const getCommunitys = () => {
  return [
    {
      name: 'LLVM',
      description: 'The popular compiler eco system around the world',
      logo: 'https://llvm.org/img/LLVMWyvernSmall.png',
      statistics: {
        developerCount: 8391,
        totalCommits: 188831,
        numIssues: 183,
        closedIssues: 99,
        openedIssues: 84,
      },
    },
    {
      name: 'Linux Kernel',
      description: "The kernel of world's most popular(maybe) operating system",
      logo: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg',
      statistics: {
        developerCount: 1824,
        totalCommits: 11823,
      },
    },
  ];
};

// imagine there are some diff types of Components

export default class Influences extends React.Component<any, any> {
  // metrics = [];
  communityCards: any[] = [];

  constructor(props) {
    super(props);

    this.communityCardOpen = this.communityCardOpen.bind(this);
    this.communityCardClose = this.communityCardClose.bind(this);

    const communities = getCommunitys();
    this.communityCards = communities.map((community, index) => {
      return (
        <Col span={6} style={{ display: 'flex', flexGrow: 1 }} key={`community_${index}`}>
          <CommunityCard data={community} handleCommunityCardOpen={this.communityCardOpen} />
        </Col>
      );
    });

    this.state = {
      communityModalOpen: false,
      communityInfo: {},
    };
  }

  communityCardOpen(communityInfo: object) {
    this.setState({
      communityModalOpen: true,
      communityInfo,
    });
  }

  communityCardClose() {
    this.setState({
      communityModalOpen: false,
    });
  }

  render() {
    return (
      <Col>
        <Row>
          {/*<TotalFixIntensityBar />*/}
          {/*<BasicContributionGraph />*/}
          {/*<BetweennessCentrality />*/}
          {/*<PageRank />*/}

          {/*<CentralityScoreTable />*/}
          <MaximumIntensityTable />
        </Row>
        
        {/*<BetweennessCentality />*/}
        {/*<Row>*/}
        {/*  <DemoBar />;*/}
        {/*</Row>*/}
        {/*<Row>*/}
        {/*  <BaseGraph />*/}
        {/*</Row>*/}
      </Col>
    );

    // return (
    //   <>
    //     <Row gutter={18}>{this.communityCards}</Row>
    //     <CommunityWindow
    //       communityInfo={this.state.communityInfo}
    //       visible={this.state.communityModalOpen}
    //       onCancel={this.communityCardClose}
    //     >
    //       <p>some contents...</p>
    //     </CommunityWindow>
    //   </>
    // );
  }
}
