import React from 'react';
import { Tree } from 'antd';

const { DirectoryTree } = Tree;

const treeData = [
  {
    title: 'parent 0',
    key: '0-0',
    children: [
      { title: 'leaf 0-0', key: '0-0-0', isLeaf: false },
      { title: 'leaf 0-1', key: '0-0-1', isLeaf: false },
    ],
  },
  {
    title: 'parent 1',
    key: '0-1',
    children: [
      { title: 'leaf 1-0', key: '0-1-0', isLeaf: false },
      { title: 'leaf 1-1', key: '0-1-1', isLeaf: false },
    ],
  },
];

export default class SecondaryDir extends React.Component<any, any> {
  onSelect(keys: React.Key[], info: any) {
    // console.log(keys, info);
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
    console.log('on select', keys, selectedDirs);
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
