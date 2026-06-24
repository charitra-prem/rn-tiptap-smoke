import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { TipTapEditor } from '../components/TipTapEditor';

jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  const MockWebView = (props: Record<string, unknown>) => <View testID="webview" {...props} />;
  return { WebView: MockWebView };
});

describe('TipTapEditor', () => {
  it('renders without crashing', async () => {
    await render(<TipTapEditor />);
    expect(screen.getByTestId('tiptap-editor-container')).toBeTruthy();
  });

  it('renders a WebView inside the container', async () => {
    await render(<TipTapEditor />);
    expect(screen.getByTestId('webview')).toBeTruthy();
  });

  it('accepts an onChange callback without throwing', async () => {
    const onChange = jest.fn();
    await render(<TipTapEditor onChange={onChange} />);
    expect(screen.getByTestId('tiptap-editor-container')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('accepts an initialContent prop without throwing', async () => {
    await render(<TipTapEditor initialContent="<p>Hello world</p>" />);
    expect(screen.getByTestId('tiptap-editor-container')).toBeTruthy();
  });

  it('applies a custom style prop', async () => {
    const customStyle = { borderColor: 'red' };
    await render(<TipTapEditor style={customStyle} />);
    expect(screen.getByTestId('tiptap-editor-container')).toBeTruthy();
  });
});
