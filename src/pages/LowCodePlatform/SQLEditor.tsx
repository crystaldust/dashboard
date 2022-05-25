import React from 'react';
import Editor from '@monaco-editor/react';
import { Button, Col, Row } from 'antd';
import { PlaySquareOutlined } from '@ant-design/icons';
import { getIntl } from 'umi';

const intl = getIntl();

export default class SQLEditor extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.state = { sql: this.props.defaultCode };

    this.handleEditorDidMount = this.handleEditorDidMount.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.sqlReady = this.sqlReady.bind(this);
  }

  sqlReady() {
    if (this.props.runSql) {
      this.props.runSql(this.state.sql);
    } else {
      console.log('no runSql callback specified');
    }
  }

  handleEditorChange(value, event) {
    this.setState({ sql: value });
  }

  handleEditorDidMount(editor, monaco) {
    this.editor = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, this.sqlReady);
  }

  render() {
    return (
      <Row>
        <Col span={20}>
          <Editor
            defaultLanguage="sql"
            height="40vh"
            defaultValue={this.props.defaultCode}
            onChange={this.handleEditorChange}
            onMount={this.handleEditorDidMount}
            options={{
              automaticLayout: true,
              autoClosingBrackets: true,
              autoClosingQuotes: true,
              autoIndent: true,
              formatOnPaste: true,
              formatOnType: true,
              formatDocument: true,
            }}
          />
        </Col>
        <Col span={4}>
          <Button type="primary" icon={<PlaySquareOutlined />} onClick={this.sqlReady}>
            {intl.formatMessage({ id: 'lowcodePlatform.executeSQL' })}
          </Button>
        </Col>
      </Row>
    );
  }
}
