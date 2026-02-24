# Monaco Editor Plugins on jsDelivr

A comprehensive reference of npm packages and extensions for Monaco Editor, all available via `cdn.jsdelivr.net`.

---

## The Core Package

| Package | jsDelivr URL | Description |
|---|---|---|
| `monaco-editor` | `https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js` | The core editor — syntax highlighting, IntelliSense, themes, 60+ languages |

**Basic setup:**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/editor/editor.main.css">
<script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js"></script>
<script>
  require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
  require(['vs/editor/editor.main'], () => {
    monaco.editor.create(document.getElementById('editor'), {
      value: '// Hello World',
      language: 'javascript',
      theme: 'vs-dark'
    });
  });
</script>
```

---

## Themes

### monaco-themes
Pre-built theme JSON files compatible with `monaco.editor.defineTheme()`. Includes Monokai, Dracula, Solarized, Nord, GitHub, and 30+ more.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-themes/`
- **License:** MIT

**Usage — load a theme directly from jsDelivr:**
```javascript
fetch('https://cdn.jsdelivr.net/npm/monaco-themes/themes/Monokai.json')
  .then(r => r.json())
  .then(data => {
    monaco.editor.defineTheme('monokai', data);
    monaco.editor.setTheme('monokai');
  });
```

**Available themes (load by name):**
```
Active4D · All Hallows Eve · Amy · Birds of Paradise · Blackboard
Brilliance Black · Brilliance Dull · Chrome DevTools · Clouds Midnight
Clouds · Cobalt · Cobalt2 · Dawn · Dracula · Dreamweaver · Eiffel
Espresso Libre · GitHub Dark · GitHub Light · IDLE · iPlastic
Katzenmilch · krTheme · Kuroir Theme · LAZY · MagicWB (Amiga)
Merbivore Soft · Merbivore · monoindustrial · Monokai Bright · Monokai
Night Owl · Nord · Oceanic Next · Pastels on Dark · Slush and Poppies
Solarized-dark · Solarized-light · SpaceCadet · Sunburst · Textmate
Tomorrow-Night-Blue · Tomorrow-Night-Bright · Tomorrow-Night-Eighties
Tomorrow-Night · Tomorrow · Twilight · Upstream Sunburst · Vibrant Ink
Xcode-default · Zenburnesque · iplastic · idlefingers · krtheme · monoindustrial
```

---

## Language Extensions

### monaco-yaml
Full YAML language support: validation, auto-completion via JSON Schema, hover documentation, and error reporting.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-yaml/`
- **License:** MIT
- **Note:** Requires a bundler for full integration; `monaco-yaml-prebuilt` is the pre-compiled CDN-ready version.

### monaco-yaml-prebuilt
Pre-compiled, CDN-ready build of monaco-yaml for direct browser use without a bundler.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-yaml-prebuilt/`
- **License:** MIT

### monaco-graphql
Official GraphQL language mode for Monaco. Provides syntax highlighting, validation, autocomplete, and hover for GraphQL schemas and queries.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-graphql/`
- **GitHub:** graphql/graphiql (official)
- **License:** MIT

**Usage:**
```javascript
import { initializeMode } from 'https://cdn.jsdelivr.net/npm/monaco-graphql/esm/initializeMode.js';
initializeMode({ schemas: [{ uri: 'schema.graphql', schema: mySchema }] });
```

### monaco-sql-languages
Multiple SQL dialect support for Monaco: MySQL, PostgreSQL, Hive, SparkSQL, Flink SQL, Trino, and more. Includes autocomplete and syntax validation.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-sql-languages/`
- **GitHub:** DTStack/monaco-sql-languages
- **License:** Apache 2.0

### @popsql/monaco-sql-languages
Bundle of SQL languages for Monaco Editor, including standard SQL, MySQL, PostgreSQL, and SQLite.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/@popsql/monaco-sql-languages/`
- **License:** MIT

### monaco-languages
The official bundle of all additional language grammars for Monaco (beyond what's built in). Includes Apex, ABAP, Cameligo, Flow9, Lexon, M3, PascaLIGO, Postiats, and more.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-languages/`
- **GitHub:** microsoft/monaco-languages
- **License:** MIT

---

## Keybinding Extensions

### monaco-vim
Vim keybindings for Monaco Editor. Implements Normal, Insert, Visual, and Command-line modes using the CodeMirror Vim adapter.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-vim/dist/monaco-vim.js`
- **License:** MIT

**Usage:**
```html
<script src="https://cdn.jsdelivr.net/npm/monaco-vim/dist/monaco-vim.js"></script>
<script>
  // After creating editor:
  const vimMode = MonacoVim.initVimMode(editor, document.getElementById('status-bar'));
  // To disable:
  // vimMode.dispose();
</script>
```

### monaco-emacs
Emacs keybindings for Monaco Editor. Implements core Emacs motion, editing, and search commands.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-emacs/dist/monaco-emacs.js`
- **License:** MIT

**Usage:**
```html
<script src="https://cdn.jsdelivr.net/npm/monaco-emacs/dist/monaco-emacs.js"></script>
<script>
  const emacsMode = MonacoEmacs.initEmacsMode(editor);
  // To disable:
  // emacsMode.dispose();
</script>
```

---

## Framework Wrappers

### @monaco-editor/react
Official React wrapper for Monaco Editor. Handles setup, lifecycle, and CDN loading automatically. No webpack config required.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/@monaco-editor/react/`
- **npm:** `npm install @monaco-editor/react`
- **License:** MIT

```jsx
import Editor from '@monaco-editor/react';

function App() {
  return (
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      defaultValue="// Hello World"
      theme="vs-dark"
    />
  );
}
```

### @guolao/vue-monaco-editor
Monaco Editor for Vue 2 and Vue 3. CDN-loaded, no bundler configuration needed.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/@guolao/vue-monaco-editor/`
- **License:** MIT

```javascript
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor';
app.use(VueMonacoEditorPlugin, {
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }
});
```

### react-monaco-editor
Monaco Editor component for React (older, widely used alternative to `@monaco-editor/react`).

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/react-monaco-editor/`
- **License:** MIT

### monaco-editor-vue3
Monaco Editor component specifically for Vue 3.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-editor-vue3/`
- **License:** MIT

---

## Editor Enhancement Packages

### monaco-editor-ex
Extends Monaco with features typically only available in VS Code:
- Auto close tag (HTML/JSX)
- CSS color preview and inline color picker
- JavaScript/CSS completions inside HTML `<script>` and `<style>` tags
- UnoCSS support
- Better formatting

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-editor-ex/dist/monaco-editor-ex.iife.js`
- **License:** MIT

**Usage:**
```html
<script src="https://cdn.jsdelivr.net/npm/monaco-editor-ex/dist/monaco-editor-ex.iife.js"></script>
<script>
  require(['vs/editor/editor.main'], () => {
    MonacoEditorEx.useMonacoEx(monaco);
    const editor = monaco.editor.create(el, { language: 'html' });
  });
</script>
```

### @monaco-editor/loader
Standalone loader utility for Monaco Editor. Handles CDN path configuration and loading without requiring AMD require.js setup.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/@monaco-editor/loader/`
- **License:** MIT

```javascript
import loader from '@monaco-editor/loader';
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
const monaco = await loader.init();
```

---

## Language Server Protocol (LSP)

### monaco-languageclient
Connects Monaco Editor to external Language Servers via the Language Server Protocol over WebSocket or Web Worker. Enables production-grade IntelliSense, go-to-definition, find-references, and diagnostics for any language with an LSP server.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-languageclient/`
- **GitHub:** TypeFox/monaco-languageclient
- **License:** MIT
- **Note:** Requires a running LSP server (local or remote). Not a pure CDN drop-in.

### monaco-editor-wrapper
High-level wrapper that combines Monaco Editor with `monaco-languageclient` and `@codingame/monaco-vscode-api`. Supports both classic Monaco config and VSCode-compatible extension mode.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-editor-wrapper/`
- **License:** MIT

### @codingame/monaco-vscode-api
Implements the VS Code API surface on top of Monaco, enabling VS Code extensions and services (file system, language extensions, themes) to run in the browser.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/@codingame/monaco-vscode-api/`
- **License:** MIT

---

## Diff Editor

Monaco includes a built-in diff editor. No extra package required.

```javascript
monaco.editor.createDiffEditor(document.getElementById('container'), {
  theme: 'vs-dark',
  renderSideBySide: true,
});
diffEditor.setModel({
  original: monaco.editor.createModel(originalCode, 'javascript'),
  modified: monaco.editor.createModel(modifiedCode, 'javascript'),
});
```

---

## Utilities

### jszip
Used alongside Monaco to compress and download multiple editor files as a `.zip` archive.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js`
- **License:** MIT

### monaco-editor-esm
ESM (ES Module) build of Monaco Editor for use with modern bundlers. Not a separate CDN script — use when building with Vite, Rollup, or esbuild.

- **jsDelivr:** `https://cdn.jsdelivr.net/npm/monaco-editor-esm/`
- **License:** MIT

---

## Quick CDN Reference

| Package | CDN Script URL |
|---|---|
| Core editor loader | `https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js` |
| Core editor CSS | `https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/editor/editor.main.css` |
| monaco-vim | `https://cdn.jsdelivr.net/npm/monaco-vim/dist/monaco-vim.js` |
| monaco-emacs | `https://cdn.jsdelivr.net/npm/monaco-emacs/dist/monaco-emacs.js` |
| monaco-editor-ex | `https://cdn.jsdelivr.net/npm/monaco-editor-ex/dist/monaco-editor-ex.iife.js` |
| jszip (for downloads) | `https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js` |
| Monokai theme JSON | `https://cdn.jsdelivr.net/npm/monaco-themes/themes/Monokai.json` |
| Dracula theme JSON | `https://cdn.jsdelivr.net/npm/monaco-themes/themes/Dracula.json` |
| Nord theme JSON | `https://cdn.jsdelivr.net/npm/monaco-themes/themes/Nord.json` |
| Night Owl theme JSON | `https://cdn.jsdelivr.net/npm/monaco-themes/themes/Night%20Owl.json` |

---

## Built-in Languages (no extra packages needed)

Monaco ships with full support for these languages out of the box:

`javascript` · `typescript` · `html` · `css` · `scss` · `less` · `json` · `jsonc` · `xml`  
`markdown` · `yaml` · `sql` · `python` · `go` · `rust` · `c` · `cpp` · `java`  
`csharp` · `fsharp` · `kotlin` · `swift` · `ruby` · `php` · `shell` · `powershell`  
`dockerfile` · `graphql` · `handlebars` · `ini` · `lua` · `perl` · `r` · `redis`  
`restructuredtext` · `dart` · `julia` · `scala` · `vb` · `bat` · `apex` · `abap`  
`twig` · `pug` · `razor` · `tcl` · `systemverilog` · `solidity` · `pascal` · `elixir`

---

## Loading GitHub Files via jsDelivr

Any file from a public GitHub repo can be fetched directly:

```
https://cdn.jsdelivr.net/gh/{user}/{repo}@{branch}/{path/to/file}
```

**Examples:**
```
https://cdn.jsdelivr.net/gh/twbs/bootstrap@main/scss/_variables.scss
https://cdn.jsdelivr.net/gh/vuejs/vue@main/src/core/index.ts
https://cdn.jsdelivr.net/gh/torvalds/linux@master/README
```

**Browse repo file tree via jsDelivr API:**
```
https://data.jsdelivr.com/v1/packages/gh/{user}/{repo}@{branch}/flat
```

---

*Last updated: February 2026*
