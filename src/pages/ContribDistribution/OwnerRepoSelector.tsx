import React from 'react';

import { Select } from 'antd';
import { runSql } from '@/services/clickhouse';
import { getIntl } from 'umi';

export const UNIQ_OWNER_REPO_SQL =
  'SELECT DISTINCT(search_key__owner , search_key__repo) FROM gits ORDER BY (search_key__owner , search_key__repo)';

const intl = getIntl();

export default class OwnerRepoSelector extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      ownerRepoMap: {},
      owners: [],
      repos: [],
      owner: '',
      repo: '',
    };

    this.onOwnerChange = this.onOwnerChange.bind(this);
    this.onOwnerSelect = this.onOwnerSelect.bind(this);
    this.onRepoSelect = this.onRepoSelect.bind(this);
  }

  async componentDidMount() {
    const result = await runSql(UNIQ_OWNER_REPO_SQL);
    const ownerRepoMap: object = {};
    result.data.forEach((pair: any) => {
      const owner = pair[0][0];
      const repo = pair[0][1];
      if (ownerRepoMap.hasOwnProperty(owner)) {
        ownerRepoMap[owner].push(repo);
      } else {
        ownerRepoMap[owner] = [repo];
      }
    });
    const owners: string[] = Object.keys(ownerRepoMap).map((owner) => ({ value: owner }));

    this.setState({ ownerRepoMap, owners });
  }

  onOwnerChange() {}

  ownerRepoSelected(owner, repo) {
    if (this.props.onOwnerRepoSelected) {
      this.props.onOwnerRepoSelected(owner, repo);
    }
  }

  onOwnerSelect(owner: string /*, option: object*/) {
    const repos = this.state.ownerRepoMap[owner].map((repo) => ({ value: repo }));
    this.setState({ repos, owner: owner });
    if (repos.length > 0) {
      const defaultRepo = repos[0].value;
      this.setState({ repo: defaultRepo });
      this.ownerRepoSelected(owner, defaultRepo);
    }
  }

  onRepoSelect(repo: string /*, option: object*/) {
    this.setState({ repo });
    // Notify the parent component with parent's callback
    this.ownerRepoSelected(this.state.owner, repo);
  }

  autoCompleteFilter(inputValue, option) {
    return option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
  }

  updateOwnerRepo(owner, repo) {
    this.setState({ owner, repo });
  }

  render() {
    return (
      <span>
        <Select
          showSearch
          style={{ width: '200px' }}
          options={this.state.owners}
          placeholder={intl.formatMessage({ id: 'contribDist.placeholder.owner' })}
          onChange={this.onOwnerChange}
          onSelect={this.onOwnerSelect}
          filterOption={this.autoCompleteFilter}
          value={this.state.owner || undefined}
        />
        <Select
          showSearch
          style={{ width: '200px' }}
          options={this.state.repos}
          placeholder={intl.formatMessage({ id: 'contribDist.placeholder.repo' })}
          value={this.state.repo || undefined}
          onSelect={this.onRepoSelect}
          // onChange={this.onOwnerChange}
          filterOption={this.autoCompleteFilter}
          defaultActiveFirstOption
          // value={this.state.repo}
        />
      </span>
    );
  }
}
