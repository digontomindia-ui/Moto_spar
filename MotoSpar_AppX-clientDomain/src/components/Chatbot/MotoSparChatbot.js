import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {N8N_CHAT_SOURCE, N8N_CHAT_WEBHOOK_URL} from '../../constants/N8NChat';

const welcomeMessage = {
  id: 'welcome',
  sender: 'bot',
  text: 'Hi! I can help you find the right MotoSpar product. Tell me your vehicle, part, or budget.',
};

const createSessionId = () =>
  `motospar-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const normaliseWebhookResponse = response => {
  const body = Array.isArray(response) ? response[0] : response;
  const payload = body?.data || body || {};
  const text =
    payload.output ||
    payload.response ||
    payload.message ||
    payload.text ||
    'I found some options for you.';
  const products = payload.products || payload.recommendations || [];

  return {
    // Never pass an unexpected webhook payload into the React Native renderer.
    text: typeof text === 'string' ? text : JSON.stringify(text) || 'I found some options for you.',
    products: Array.isArray(products)
      ? products.filter(product => product && typeof product === 'object')
      : [],
  };
};

const ProductCards = ({products}) => {
  if (!products?.length) {
    return null;
  }

  return (
    <View style={styles.productList}>
      {products.map(product => (
        <TouchableOpacity
          key={product.id || product.link || product.name}
          activeOpacity={0.85}
          disabled={!product.link}
          onPress={() => {
            if (product.link) {
              // Do not allow a bad URL supplied by a workflow to cause an
              // unhandled native Linking rejection.
              Linking.openURL(product.link).catch(() => {});
            }
          }}
          style={styles.productCard}>
          <Text numberOfLines={2} style={styles.productName}>
            {product.name}
          </Text>
          {product.price !== undefined && product.price !== null ? (
            <Text style={styles.productPrice}>₹{product.price}</Text>
          ) : null}
          <Text style={styles.productStatus}>
            {product.status === 'in_stock' || product.in_stock ? 'In stock' : 'Check availability'}
          </Text>
          {product.link ? <Text style={styles.productLink}>View product →</Text> : null}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const renderBoldText = (text, keyPrefix) =>
  text.split(/\*\*(.+?)\*\*/g).map((part, index) => (
    <Text key={`${keyPrefix}-bold-${index}`} style={index % 2 ? styles.messageBold : undefined}>
      {part}
    </Text>
  ));

const renderInlineMarkdown = (text, keyPrefix) => {
  const parts = [];
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
  let cursor = 0;
  let match;
  let index = 0;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > cursor) {
      parts.push(...renderBoldText(text.slice(cursor, match.index), `${keyPrefix}-${index}`));
    }

    const label = match[1] || match[3];
    const url = match[2] || match[3];
    parts.push(
      <Text
        key={`${keyPrefix}-link-${index}`}
        accessibilityRole="link"
        onPress={() => Linking.openURL(url).catch(() => {})}
        style={styles.messageLink}>
        {label}
      </Text>,
    );
    cursor = linkPattern.lastIndex;
    index += 1;
  }

  if (cursor < text.length || !parts.length) {
    parts.push(...renderBoldText(text.slice(cursor), `${keyPrefix}-${index}`));
  }

  return parts;
};

const FormattedBotMessage = ({text}) => {
  const blocks = [];
  let activeListItem = null;

  text.split(/\r?\n/).forEach(rawLine => {
    const line = rawLine.trim();
    const numberedMatch = line.match(/^(\d+)[.)]\s+(.*)$/);
    const bulletMatch = line.match(/^[-•*]\s+(.*)$/);

    if (numberedMatch || bulletMatch) {
      activeListItem = {
        type: numberedMatch ? 'numbered' : 'bullet',
        marker: numberedMatch?.[1],
        text: numberedMatch ? numberedMatch[2] : bulletMatch[1],
      };
      blocks.push(activeListItem);
      return;
    }

    if (!line) {
      activeListItem = null;
      return;
    }

    if (activeListItem) {
      activeListItem.text += `\n${line}`;
      return;
    }

    blocks.push({type: 'paragraph', text: line.replace(/^#{1,6}\s+/, '')});
  });

  return (
    <View>
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <Text key={`paragraph-${index}`} maxFontSizeMultiplier={1.25} style={styles.messageText}>
              {renderInlineMarkdown(block.text, `paragraph-${index}`)}
            </Text>
          );
        }

        return (
          <View key={`list-${index}`} style={styles.listItem}>
            <Text maxFontSizeMultiplier={1.25} style={styles.listMarker}>
              {block.type === 'numbered' ? `${block.marker}.` : '•'}
            </Text>
            <Text maxFontSizeMultiplier={1.25} style={styles.listItemText}>
              {renderInlineMarkdown(block.text, `list-${index}`)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const ChatMessage = ({item}) => (
  <View style={[styles.messageRow, item.sender === 'user' && styles.userMessageRow]}>
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
      {item.sender === 'bot' ? (
        <FormattedBotMessage text={item.text} />
      ) : (
        <Text maxFontSizeMultiplier={1.25} style={[styles.messageText, styles.userMessageText]}>
          {item.text}
        </Text>
      )}
      <ProductCards products={item.products} />
    </View>
  </View>
);

const MotoSparChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([welcomeMessage]);
  const [isSending, setIsSending] = useState(false);
  const sessionId = useRef(createSessionId());
  const pulse = useRef(new Animated.Value(1)).current;
  const panelOpacity = useRef(new Animated.Value(0)).current;
  const panelTranslateY = useRef(new Animated.Value(28)).current;
  const listRef = useRef(null);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {toValue: 1.08, duration: 850, useNativeDriver: true}),
        Animated.timing(pulse, {toValue: 1, duration: 850, useNativeDriver: true}),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const openChat = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(panelOpacity, {toValue: 1, duration: 180, useNativeDriver: true}),
      Animated.spring(panelTranslateY, {toValue: 0, friction: 8, useNativeDriver: true}),
    ]).start();
  };

  const closeChat = () => {
    Animated.parallel([
      Animated.timing(panelOpacity, {toValue: 0, duration: 150, useNativeDriver: true}),
      Animated.timing(panelTranslateY, {toValue: 28, duration: 150, useNativeDriver: true}),
    ]).start(() => setIsOpen(false));
  };

  const sendMessage = async () => {
    const message = draft.trim();
    if (!message || isSending) {
      return;
    }

    if (!N8N_CHAT_WEBHOOK_URL) {
      setMessages(current => [
        ...current,
        {
          id: `config-${Date.now()}`,
          sender: 'bot',
          text: 'Chat is not configured yet. Please set N8N_CHAT_WEBHOOK_URL in the app .env file.',
        },
      ]);
      return;
    }

    const userMessage = {id: `user-${Date.now()}`, sender: 'user', text: message};
    setMessages(current => [...current, userMessage]);
    setDraft('');
    setIsSending(true);

    try {
      const response = await fetch(N8N_CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          // Chat Trigger webhooks require this payload shape. A plain
          // `message` is accepted by the webhook but produces no response.
          action: 'sendMessage',
          chatInput: message,
          sessionId: sessionId.current,
          source: N8N_CHAT_SOURCE,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }

      const responseText = await response.text();
      // Keep the app open and show a clear error if a webhook does not return
      // a chat response rather than attempting to render an absent response.
      if (!responseText.trim()) {
        throw new Error('Webhook returned an empty response');
      }
      let responseBody;
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = {text: responseText};
      }
      const reply = normaliseWebhookResponse(responseBody);
      setMessages(current => [
        ...current,
        {id: `bot-${Date.now()}`, sender: 'bot', text: reply.text, products: reply.products},
      ]);
    } catch (error) {
      const isEmptyReply = error?.message === 'Webhook returned an empty response';
      setMessages(current => [
        ...current,
        {
          id: `error-${Date.now()}`,
          sender: 'bot',
          text: isEmptyReply
            ? 'The chat service did not send a reply. Please try again in a moment.'
            : 'I am unable to connect right now. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Animated.View style={[styles.launcherWrap, {transform: [{scale: pulse}]}]}>
        <TouchableOpacity accessibilityLabel="Open MotoSpar assistant" activeOpacity={0.85} onPress={openChat} style={styles.launcher}>
          <Text style={styles.launcherIcon}>✦</Text>
          <Text style={styles.launcherLabel}>Chat</Text>
          <View style={styles.onlineDot} />
        </TouchableOpacity>
      </Animated.View>

      <Modal animationType="none" transparent visible={isOpen} onRequestClose={closeChat}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeChat} />
          <Animated.View
            style={[
              styles.panel,
              {opacity: panelOpacity, transform: [{translateY: panelTranslateY}]},
            ]}>
            <SafeAreaView style={styles.safePanel}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>MotoSpar Assistant</Text>
                  <Text style={styles.headerSubtitle}>Product recommendations, instantly</Text>
                </View>
                <TouchableOpacity accessibilityLabel="Close chatbot" onPress={closeChat} style={styles.closeButton}>
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={ChatMessage}
                contentContainerStyle={styles.messages}
                onContentSizeChange={() => listRef.current?.scrollToEnd({animated: true})}
              />

              {isSending ? (
                <View style={styles.typingRow}>
                  <ActivityIndicator size="small" color="#F95F19" />
                  <Text style={styles.typingText}>Finding the best options…</Text>
                </View>
              ) : null}

              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.composer}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    onSubmitEditing={sendMessage}
                    placeholder="Ask about a product…"
                    placeholderTextColor="#8a8a8a"
                    returnKeyType="send"
                    style={styles.input}
                  />
                  <TouchableOpacity
                    accessibilityLabel="Send message"
                    disabled={!draft.trim() || isSending}
                    onPress={sendMessage}
                    style={[styles.sendButton, (!draft.trim() || isSending) && styles.sendButtonDisabled]}>
                    <Text style={styles.sendText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  launcherWrap: {bottom: 24, elevation: 30, position: 'absolute', right: 16, zIndex: 9999},
  launcher: {alignItems: 'center', backgroundColor: '#F95F19', borderColor: '#fff', borderRadius: 30, borderWidth: 2, flexDirection: 'row', height: 60, justifyContent: 'center', paddingHorizontal: 18, shadowColor: '#000', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.3, shadowRadius: 8},
  launcherIcon: {color: '#fff', fontSize: 26, fontWeight: '700', marginRight: 6},
  launcherLabel: {color: '#fff', fontSize: 16, fontWeight: '800'},
  onlineDot: {backgroundColor: '#35C759', borderColor: '#fff', borderRadius: 7, borderWidth: 2, height: 14, position: 'absolute', right: 1, top: 1, width: 14},
  modalBackdrop: {backgroundColor: 'rgba(0,0,0,0.42)', flex: 1, justifyContent: 'flex-end'},
  panel: {backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '78%', overflow: 'hidden'},
  safePanel: {flex: 1},
  header: {alignItems: 'center', backgroundColor: '#16212E', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 17},
  headerTitle: {color: '#fff', fontSize: 18, fontWeight: '700'},
  headerSubtitle: {color: '#d8e0e7', fontSize: 12, marginTop: 3},
  closeButton: {alignItems: 'center', borderColor: '#8592A0', borderRadius: 16, borderWidth: 1, height: 32, justifyContent: 'center', width: 32},
  closeText: {color: '#fff', fontSize: 24, lineHeight: 26},
  messages: {padding: 16},
  messageRow: {alignItems: 'flex-start', flexDirection: 'row', marginBottom: 12},
  userMessageRow: {justifyContent: 'flex-end'},
  messageBubble: {borderRadius: 16, maxWidth: '86%', padding: 12},
  botBubble: {backgroundColor: '#F1F3F5', borderBottomLeftRadius: 4},
  userBubble: {backgroundColor: '#F95F19', borderBottomRightRadius: 4},
  messageText: {color: '#16212E', fontSize: 15, lineHeight: 21},
  messageBold: {fontWeight: '700'},
  messageLink: {color: '#2563EB', fontWeight: '700', textDecorationLine: 'underline'},
  userMessageText: {color: '#fff'},
  listItem: {alignItems: 'flex-start', flexDirection: 'row', marginTop: 8},
  listMarker: {color: '#16212E', fontSize: 15, lineHeight: 21, marginRight: 7, minWidth: 18},
  listItemText: {color: '#16212E', flex: 1, fontSize: 15, lineHeight: 21},
  typingRow: {alignItems: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingVertical: 8},
  typingText: {color: '#68737D', fontSize: 13},
  composer: {alignItems: 'center', borderTopColor: '#E6E9EC', borderTopWidth: 1, flexDirection: 'row', padding: 12},
  input: {backgroundColor: '#F1F3F5', borderRadius: 22, color: '#16212E', flex: 1, fontSize: 15, minHeight: 44, paddingHorizontal: 15},
  sendButton: {alignItems: 'center', backgroundColor: '#F95F19', borderRadius: 20, height: 40, justifyContent: 'center', marginLeft: 8, paddingHorizontal: 15},
  sendButtonDisabled: {backgroundColor: '#C8CDD2'},
  sendText: {color: '#fff', fontSize: 13, fontWeight: '700'},
  productList: {marginTop: 10},
  productCard: {backgroundColor: '#fff', borderColor: '#E0E4E8', borderRadius: 10, borderWidth: 1, marginTop: 7, padding: 10},
  productName: {color: '#16212E', fontSize: 13, fontWeight: '700'},
  productPrice: {color: '#F95F19', fontSize: 14, fontWeight: '700', marginTop: 3},
  productStatus: {color: '#438452', fontSize: 12, marginTop: 2},
  productLink: {color: '#2563EB', fontSize: 12, fontWeight: '600', marginTop: 5},
});

export default MotoSparChatbot;
