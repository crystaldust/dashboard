import { Radar } from '@ant-design/plots';
import React from 'react';

function activityToRadarData(activity: CKData.Activity): object[] {
  return [
    'codeContribution',
    'codeTweaking',
    'issueCoordination',
    'issueReporting',
    'knowledgeSharing',
    'progressControl',
  ].map((key) => {
    return {
      name: key,
      value: activity[key],
    };
  });
}

export default class Charts extends React.Component<any, any> {
  constructor(props) {
    super(props);
    // this.state = { data: props.data ? props.data : [] };
  }
  render() {
    let radarData: object[] = [];
    if (this.props.data) {
      radarData = activityToRadarData(this.props.data);
    }
    return <Radar data={radarData} height={200} xField={'name'} yField={'value'} />;
  }
}
