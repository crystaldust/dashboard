import React from 'react';
import { Divider, Tree } from 'antd';
import styles from '@/pages/GeoDistribution/index.less';
import { getIntl } from 'umi';

const intl = getIntl();
const { DirectoryTree } = Tree;

export default class SecondaryDir extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(keys: React.Key[], info: any) {
    const selectedDirs = {};
    info.selectedNodes.forEach((node: object) => {
      if (node.hasOwnProperty('children')) {
        node.children.forEach((child) => {
          const key = `${node.title}/${child.title}`;
          selectedDirs[key] = true;
        });
      } else {
        selectedDirs[node.title] = true;
      }
    });
    if (this.props.onDirSelect) {
      this.props.onDirSelect(keys, selectedDirs);
    }
  }

  onExpand() {
    console.log('tree expanded');
  }

  render() {
    return (
      <div>
        {this.props.repo == '' ? (
          ''
        ) : (
          <div>
            <Divider>{intl.formatMessage({ id: 'geodist.dirTree' })}</Divider>
            {/*<span className={styles.componentIntro} style={{ color: '#999999' }}>*/}
            <span className={styles.componentIntro}>
              {intl.formatMessage({ id: 'geodist.dirTree.desc' })}
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
        />
      </div>
    );
  }
}
