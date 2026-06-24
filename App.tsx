import { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { TipTapEditor } from './components/TipTapEditor';

export default function App() {
  const [charCount, setCharCount] = useState(0);

  function handleChange(html: string) {
    // Strip tags to estimate character count
    const text = html.replace(/<[^>]*>/g, '');
    setCharCount(text.length);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>TipTap Editor</Text>
        <TipTapEditor
          style={styles.editor}
          onChange={handleChange}
        />
        <Text style={styles.footer}>{charCount} characters</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  editor: {
    flex: 1,
  },
  footer: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
});
