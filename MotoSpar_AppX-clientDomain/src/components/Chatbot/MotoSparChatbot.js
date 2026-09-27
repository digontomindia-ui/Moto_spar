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
    text: typeof text === 'string' ? text : JSON.stringify(text),
    products: Array.isArray(products) ? products : [],
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
          onPress={() => product.link && Linking.openURL(product.link)}
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

const ChatMessage = ({item}) => (
  <View style={[styles.messageRow, item.sender === 'user' && styles.userMessageRow]}>
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={[styles.messageText, item.sender === 'user' && styles.userMessageText]}>{item.text}</Text>
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
          message,
          sessionId: sessionId.current,
          source: N8N_CHAT_SOURCE,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }

      const responseText = await response.text();
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
    } catch {
      setMessages(current => [
        ...current,
        {
          id: `error-${Date.now()}`,
          sender: 'bot',
          text: 'I am unable to connect right now. Please try again in a moment.',
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
  launcherWrap: {position: 'absolute', right: 20, bottom: 28, zIndex: 1000, elevation: 12},
  launcher: {alignItems: 'center', backgroundColor: '#F95F19', borderRadius: 30, height: 58, justifyContent: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.24, shadowRadius: 8, width: 58},
  launcherIcon: {color: '#fff', fontSize: 29, fontWeight: '700'},
  onlineDot: {backgroundColor: '#35C759', borderColor: '#fff', borderRadius: 6, borderWidth: 2, height: 12, position: 'absolute', right: 2, top: 2, width: 12},
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
  userMessageText: {color: '#fff'},
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
