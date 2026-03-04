import { useState, useEffect, useCallback } from 'react';
import { USE_MOCK_DATA } from '../config';
import { getMessages, sendMessage } from '../supabase/queries';

// 모크 자동 응답 풀
const AUTO_RESPONSES = [
    '반가워요! 오늘 하루는 어떠셨어요? 😊',
    '오, 그렇군요! 더 자세히 들려주세요~',
    '저도 비슷한 생각을 했어요! 역시 성향이 잘 맞나봐요 💜',
    '재미있네요! 혹시 이런 경험은 있으세요?',
    '그 말씀에 완전 공감해요! 특히 그 부분이요',
    '좋은 이야기네요. 저도 한마디 하자면... 🤔',
    '와, 정말요? 그건 처음 듣는 이야기예요!',
    '그렇게 생각하시는 이유가 궁금해요 😁',
];

export const useChat = (options) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            if (USE_MOCK_DATA) {
                // 모크 모드에서는 환영 메시지로 시작
                setMessages([{
                    id: 'system-welcome',
                    content: `안녕하세요! 루미니에서 연결되었어요. 편하게 대화를 시작해보세요 ✨`,
                    sender_id: options.receiverId,
                    receiver_id: options.senderId,
                    created_at: new Date().toISOString(),
                    isSystem: false
                }]);
            } else {
                const data = await getMessages(options);
                setMessages(data);
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [options.senderId, options.receiverId, options.communityId]);

    useEffect(() => {
        fetchMessages();

        // 실시간 구독은 모크 모드에서 생략
        if (USE_MOCK_DATA) return;

        let channel;
        try {
            const { supabase } = require('../supabase/client');
            if (options.communityId) {
                channel = supabase
                    .channel(`community:${options.communityId}`)
                    .on('postgres_changes', {
                        event: 'INSERT', schema: 'public', table: 'messages',
                        filter: `community_id=eq.${options.communityId}`,
                    }, (payload) => {
                        setMessages((prev) => [...prev, payload.new]);
                    })
                    .subscribe();
            } else if (options.receiverId) {
                channel = supabase
                    .channel(`chat:${options.senderId}`)
                    .on('postgres_changes', {
                        event: 'INSERT', schema: 'public', table: 'messages',
                    }, (payload) => {
                        const newMessage = payload.new;
                        if (
                            (newMessage.sender_id === options.senderId && newMessage.receiver_id === options.receiverId) ||
                            (newMessage.sender_id === options.receiverId && newMessage.receiver_id === options.senderId)
                        ) {
                            setMessages((prev) => [...prev, newMessage]);
                        }
                    })
                    .subscribe();
            }
        } catch (err) {
            console.log('Realtime subscription skipped in mock mode');
        }

        return () => {
            if (channel) {
                try {
                    const { supabase } = require('../supabase/client');
                    supabase.removeChannel(channel);
                } catch { }
            }
        };
    }, [options.communityId, options.receiverId, options.senderId, fetchMessages]);

    const send = async (content) => {
        if (USE_MOCK_DATA) {
            // 내 메시지 추가
            const myMessage = {
                id: `msg-${Date.now()}`,
                content,
                sender_id: options.senderId,
                receiver_id: options.receiverId,
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [...prev, myMessage]);

            // 1.5초 후 자동 응답
            setTimeout(() => {
                const autoReply = {
                    id: `msg-${Date.now() + 1}`,
                    content: AUTO_RESPONSES[Math.floor(Math.random() * AUTO_RESPONSES.length)],
                    sender_id: options.receiverId,
                    receiver_id: options.senderId,
                    created_at: new Date().toISOString(),
                };
                setMessages(prev => [...prev, autoReply]);
            }, 1500);

            return myMessage;
        }

        const messageData = {
            content,
            sender_id: options.senderId,
            receiver_id: options.receiverId || null,
            community_id: options.communityId || null,
        };
        const sent = await sendMessage(messageData);
        setMessages(prev => [...prev, sent]);
        return sent;
    };

    return { messages, loading, error, send, refresh: fetchMessages };
};
