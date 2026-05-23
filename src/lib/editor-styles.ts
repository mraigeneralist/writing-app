// Notion-grade CSS injected into the tentap-editor WebView.
// All sizing/spacing values are tuned to mimic the feel of Notion's mobile editor.

export const notionEditorCss = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI Variable', 'Segoe UI', Roboto, sans-serif;
    font-size: 17px;
    line-height: 1.55;
    color: #37352F;
    background: transparent;
    padding: 0;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
    caret-color: #2EAADC;
    word-wrap: break-word;
  }

  .ProseMirror {
    outline: none !important;
    padding: 8px 0 80px;
    min-height: 100%;
  }

  .ProseMirror > * + * {
    margin-top: 0.5em;
  }

  .ProseMirror p {
    margin: 0;
    padding: 3px 2px;
    min-height: 1.55em;
  }

  .ProseMirror h1 {
    font-size: 30px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.01em;
    margin: 18px 0 4px;
    color: #37352F;
  }

  .ProseMirror h2 {
    font-size: 24px;
    font-weight: 600;
    line-height: 1.3;
    margin: 14px 0 2px;
    color: #37352F;
  }

  .ProseMirror h3 {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.3;
    margin: 10px 0 2px;
    color: #37352F;
  }

  .ProseMirror ul,
  .ProseMirror ol {
    padding-left: 24px;
    margin: 4px 0;
  }

  .ProseMirror li {
    margin: 2px 0;
    padding-left: 2px;
  }

  .ProseMirror li > p {
    padding: 0;
  }

  .ProseMirror ul[data-type="taskList"] {
    list-style: none;
    padding-left: 4px;
  }

  .ProseMirror ul[data-type="taskList"] li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .ProseMirror ul[data-type="taskList"] li > label {
    margin-top: 4px;
  }

  .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div > p {
    color: #9B9A97;
    text-decoration: line-through;
  }

  .ProseMirror blockquote {
    border-left: 3px solid #37352F;
    padding-left: 14px;
    margin: 6px 0;
    color: #5A5852;
    font-style: normal;
  }

  .ProseMirror code {
    background: rgba(135, 131, 120, 0.15);
    color: #EB5757;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'SF Mono', Menlo, Monaco, 'Roboto Mono', monospace;
  }

  .ProseMirror pre {
    background: #F7F6F3;
    border-radius: 6px;
    padding: 14px 16px;
    font-family: 'SF Mono', Menlo, Monaco, 'Roboto Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    overflow-x: auto;
    margin: 8px 0;
  }

  .ProseMirror pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    border-radius: 0;
    font-size: inherit;
  }

  .ProseMirror img {
    max-width: 100%;
    border-radius: 4px;
    margin: 8px 0;
    display: block;
  }

  .ProseMirror a {
    color: #2EAADC;
    text-decoration: underline;
    text-decoration-color: rgba(46, 170, 220, 0.5);
  }

  .ProseMirror hr {
    border: none;
    border-top: 1px solid #E0DFDB;
    margin: 14px 0;
  }

  /* Selection — Notion's soft blue */
  .ProseMirror ::selection,
  .ProseMirror *::selection {
    background: rgba(46, 170, 220, 0.22);
  }

  /* Placeholder for empty paragraphs */
  .ProseMirror p.is-empty::before {
    content: 'Type something…';
    color: #C5C4C0;
    pointer-events: none;
    float: left;
    height: 0;
  }

  .ProseMirror p.is-empty:not(:first-child)::before {
    content: '';
  }

  /* Tap highlight off on iOS, smooth touch */
  * {
    -webkit-touch-callout: none;
  }

  /* Prevent layout jump when keyboard opens */
  html, body {
    overscroll-behavior: contain;
  }

  /* Hide scrollbars — Notion doesn't show them */
  html, body, .ProseMirror {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  html::-webkit-scrollbar,
  body::-webkit-scrollbar,
  .ProseMirror::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
`;
