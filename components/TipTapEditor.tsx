import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

interface TipTapEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  style?: ViewStyle;
}

interface EditorMessage {
  type: 'content-change' | 'editor-ready';
  html?: string;
}

const EDITOR_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.5; }

    #toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 8px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .tb-btn {
      padding: 5px 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 13px;
      line-height: 1;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }

    .tb-btn:active { background: #d0d0d0; }
    .tb-btn.is-active { background: #dbeafe; border-color: #3b82f6; color: #1d4ed8; }

    #editor {
      padding: 16px;
      min-height: 250px;
      outline: none;
    }

    .ProseMirror { outline: none; min-height: 200px; }
    .ProseMirror > * + * { margin-top: 0.75em; }
    .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: #aaa;
      float: left;
      height: 0;
      pointer-events: none;
    }
    .ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; }
    .ProseMirror h1 { font-size: 1.5em; font-weight: 700; }
    .ProseMirror h2 { font-size: 1.25em; font-weight: 700; }
    .ProseMirror blockquote { border-left: 3px solid #ccc; padding-left: 1em; color: #555; font-style: italic; }
    .ProseMirror code { background: #f0f0f0; padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.9em; font-family: 'Courier New', monospace; }
    .ProseMirror pre { background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 4px; overflow-x: auto; }
    .ProseMirror pre code { background: none; color: inherit; padding: 0; font-size: 0.85em; }
    .ProseMirror strong { font-weight: 700; }
    .ProseMirror em { font-style: italic; }
    .ProseMirror s { text-decoration: line-through; }
    .ProseMirror hr { border: none; border-top: 2px solid #e0e0e0; margin: 1em 0; }
  </style>
</head>
<body>
  <div id="toolbar">
    <button class="tb-btn" id="btn-bold" onclick="cmd('bold')"><b>B</b></button>
    <button class="tb-btn" id="btn-italic" onclick="cmd('italic')"><i>I</i></button>
    <button class="tb-btn" id="btn-strike" onclick="cmd('strike')"><s>S</s></button>
    <button class="tb-btn" id="btn-code" onclick="cmd('code')">&lt;/&gt;</button>
    <button class="tb-btn" id="btn-h1" onclick="cmd('h1')">H1</button>
    <button class="tb-btn" id="btn-h2" onclick="cmd('h2')">H2</button>
    <button class="tb-btn" id="btn-ul" onclick="cmd('ul')">&#8226; List</button>
    <button class="tb-btn" id="btn-ol" onclick="cmd('ol')">1. List</button>
    <button class="tb-btn" id="btn-blockquote" onclick="cmd('blockquote')">&ldquo;&rdquo;</button>
  </div>
  <div id="editor"></div>

  <script type="module">
    import { Editor } from 'https://esm.sh/@tiptap/core@2';
    import StarterKit from 'https://esm.sh/@tiptap/starter-kit@2';

    let editor;

    function updateToolbar() {
      if (!editor) return;
      document.getElementById('btn-bold').classList.toggle('is-active', editor.isActive('bold'));
      document.getElementById('btn-italic').classList.toggle('is-active', editor.isActive('italic'));
      document.getElementById('btn-strike').classList.toggle('is-active', editor.isActive('strike'));
      document.getElementById('btn-code').classList.toggle('is-active', editor.isActive('code'));
      document.getElementById('btn-h1').classList.toggle('is-active', editor.isActive('heading', { level: 1 }));
      document.getElementById('btn-h2').classList.toggle('is-active', editor.isActive('heading', { level: 2 }));
      document.getElementById('btn-ul').classList.toggle('is-active', editor.isActive('bulletList'));
      document.getElementById('btn-ol').classList.toggle('is-active', editor.isActive('orderedList'));
      document.getElementById('btn-blockquote').classList.toggle('is-active', editor.isActive('blockquote'));
    }

    function postToNative(payload) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }

    editor = new Editor({
      element: document.getElementById('editor'),
      extensions: [StarterKit],
      content: '<p></p>',
      editorProps: {
        attributes: { 'data-placeholder': 'Start typing...' },
      },
      onUpdate({ editor }) {
        postToNative({ type: 'content-change', html: editor.getHTML() });
        updateToolbar();
      },
      onSelectionUpdate: () => updateToolbar(),
      onCreate: () => {
        updateToolbar();
        postToNative({ type: 'editor-ready' });
      },
    });

    window.cmd = function (action) {
      if (!editor) return;
      const chain = editor.chain().focus();
      switch (action) {
        case 'bold':        chain.toggleBold().run(); break;
        case 'italic':      chain.toggleItalic().run(); break;
        case 'strike':      chain.toggleStrike().run(); break;
        case 'code':        chain.toggleCode().run(); break;
        case 'h1':          chain.toggleHeading({ level: 1 }).run(); break;
        case 'h2':          chain.toggleHeading({ level: 2 }).run(); break;
        case 'ul':          chain.toggleBulletList().run(); break;
        case 'ol':          chain.toggleOrderedList().run(); break;
        case 'blockquote':  chain.toggleBlockquote().run(); break;
      }
      updateToolbar();
    };

    function handleNativeMessage(raw) {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === 'set-content' && typeof msg.html === 'string') {
          editor.commands.setContent(msg.html, false);
        }
      } catch (_) {}
    }

    // Android fires on document; iOS fires on window
    document.addEventListener('message', (e) => handleNativeMessage(e.data));
    window.addEventListener('message', (e) => handleNativeMessage(e.data));
  </script>
</body>
</html>`;

export function TipTapEditor({ initialContent, onChange, style }: TipTapEditorProps) {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg: EditorMessage = JSON.parse(event.nativeEvent.data);
        if (msg.type === 'content-change' && onChange && msg.html !== undefined) {
          onChange(msg.html);
        }
      } catch (_) {}
    },
    [onChange],
  );

  const handleEditorReady = useCallback(() => {
    if (initialContent) {
      webViewRef.current?.postMessage(
        JSON.stringify({ type: 'set-content', html: initialContent }),
      );
    }
  }, [initialContent]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg: EditorMessage = JSON.parse(event.nativeEvent.data);
        if (msg.type === 'editor-ready') {
          handleEditorReady();
          return;
        }
      } catch (_) {}
      handleMessage(event);
    },
    [handleMessage, handleEditorReady],
  );

  return (
    <View testID="tiptap-editor-container" style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: EDITOR_HTML }}
        originWhitelist={['*']}
        onMessage={onMessage}
        style={styles.webView}
        keyboardDisplayRequiresUserAction={false}
        scrollEnabled
        allowsInlineMediaPlayback
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
});
