import React from 'react';
import { Divider, Tree } from 'antd';
import styles from '@/pages/ContribDistribution/index.less';
import { getIntl } from 'umi';

const intl = getIntl();
const { DirectoryTree } = Tree;

export default class SecondaryDirSelector extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(keys: React.Key[], event: any) {
    if (this.props.onDirSelect) {
      this.props.onDirSelect(keys, event);
    }
  }

  //   const primaryDirs = keys.filter((dir) => dir.indexOf('-') == -1);
  //   primaryDirs.forEach(primaryDir => {
  //   const selectedPrimaryChildren = keys.filter(key => key.indexOf(`${primaryDir}-`) == 0)
  //   if (selectedPrimaryChildren.length != )
  // })

  // onSelect(keys: React.Key[], info: any) {
  //   const selectedNodes: object[] = info;
  //   const selectionMap: object; // Key: primary dir, values: children and selected children
  //   selectedNodes.forEach((node) => {
  //     if (node.key.indexOf('-') == -1) {
  //       // Primary node
  //       selectionMap[node.key] = {
  //         children: node.children, // node.children should exist
  //       };
  //     } else {
  //       const parts = node.key.split('-');
  //       const primary = parts[0];
  //       const secondary = parts[1];
  //       if (!selectionMap.hasOwnProperty(primary)) {
  //         selectionMap[primary] = {
  //           selectedChildren: [node.key],
  //         };
  //       } else {
  //       }
  //     }
  //   });
  // }

  onExpand() {
    console.log('tree expanded');
  }

  render() {
    return (
      <div>
        {!!this.props.repo && (
          <div>
            <Divider>{intl.formatMessage({ id: 'contribDist.dirTree' })}</Divider>
            {/*<span className={styles.componentIntro} style={{ color: '#999999' }}>*/}
            <span className={styles.componentIntro}>
              {intl.formatMessage({ id: 'contribDist.dirTree.desc' })}
            </span>
          </div>
        )}
        <DirectoryTree
          height={400}
          multiple
          defaultExpandAll
          onSelect={this.onSelect}
          onExpand={this.onExpand}
          treeData={this.props.dirData}
          expandAction={false}
          selectedKeys={this.props.selectedDirs}
        />
      </div>
    );
  }
}
