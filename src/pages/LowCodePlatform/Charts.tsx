import { Radar } from '@ant-design/plots';
import React from 'react';

export function parseActivities(rawActivities: CKData.Activity[]) {
  let maxs: object = {};
  let mins: object = {};

  rawActivities.forEach((act) => {
    [
      'code_contribution',
      'code_tweaking',
      'issue_coordination',
      'issue_reporting',
      'knowledge_sharing',
      'progress_control',
    ].forEach((key) => {
      if (!maxs[key] || maxs[key] < act[key]) {
        maxs[key] = act[key];
      }
      if (!mins[key] || mins[key] > act[key]) {
        mins[key] = act[key];
      }
    });
  });

  const parsedActivities: object[] = rawActivities.map((act) => {
    [
      'code_contribution',
      'code_tweaking',
      'issue_coordination',
      'issue_reporting',
      'knowledge_sharing',
      'progress_control',
    ].forEach((key) => {
      const max = maxs[key];
      const min = mins[key];
      if (max == min) {
        act[key] = max;
      } else {
        act[key] = ((act[key] - min) / (max - min)) * 100;
      }
      act[key] = parseFloat(act[key].toFixed(2));
    });
    return act;
  });
  return parsedActivities;
}

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
    return <Radar data={radarData} height={300} xField={'name'} yField={'value'} />;
  }
}
