import React from 'react';
import Editor from '@monaco-editor/react';

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
    console.log(value);
    this.setState({ sql: value });
  }

  handleEditorDidMount(editor, monaco) {
    this.editor = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, this.sqlReady);
  }

  render() {
    return (
      <Editor
        defaultLanguage="sql"
        height="7vh"
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
    );
  }
}
