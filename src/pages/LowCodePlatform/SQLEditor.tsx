import React, { createRef } from 'react';
import Editor from '@monaco-editor/react';

export default class SQLEditor extends React.Component<any, any> {
  DEFAULT_SQL: string = 'SELECT * FROM some_table LIMIT 10';
  constructor(props) {
    super(props);
    this.state = { sql: this.DEFAULT_SQL };

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
    console.log(typeof editor);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, this.sqlReady);
  }

  // formatDocument() {
  //   this.editor.current.getAction('editor.action.formatDocument').run();
  // }

  render() {
    console.log('sql editor render');
    return (
      <Editor
        // ref={::this.editorRef}
        defaultLanguage="sql"
        height="30vh"
        defaultValue={this.DEFAULT_SQL}
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
