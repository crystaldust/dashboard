import React from 'react';
import { Tree } from 'antd';

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
      <DirectoryTree
        multiple
        defaultExpandAll
        onSelect={this.onSelect}
        onExpand={this.onExpand}
        treeData={this.props.dirData}
      />
    );
  }
}
