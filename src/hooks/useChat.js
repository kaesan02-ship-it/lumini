import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { getMessages, sendMessage } from '../supabase/queries';

export const useChat = (options) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getMessages(options);
            setMessages(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [options]);

    useEffect(() => {
        fetchMessages();

        // Set up real-time subscription
        let channel;
        if (options.communityId) {
            channel = supabase
                .channel(`community:${options.communityId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `community_id=eq.${options.communityId}`,
                    },
                    (payload) => {
                        setMessages((prev) => [...prev, payload.new]);
                    }
                )
                .subscribe();
        } else if (options.receiverId) {
            // Direct message subscription is more complex due to OR filters in Realtime
            // For now, we subscribe to all messages where the current user is sender or receiver
            // and filter locally, or use a more specific channel.
            channel = supabase
                .channel(`chat:${options.senderId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                    },
                    (payload) => {
                        const newMessage = payload.new;
                        if (
                            (newMessage.sender_id === options.senderId && newMessage.receiver_id === options.receiverId) ||
                            (newMessage.sender_id === options.receiverId && newMessage.receiver_id === options.senderId)
                        ) {
                            setMessages((prev) => [...prev, newMessage]);
                        }
                    }
                )
                .subscribe();
        }

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [options.communityId, options.receiverId, options.senderId, fetchMessages]);

    const send = async (content) => {
        const messageData = {
            content,
            sender_id: options.senderId,
            receiver_id: options.receiverId || null,
            community_id: options.communityId || null,
        };
        return await sendMessage(messageData);
    };

    return { messages, loading, error, send, refresh: fetchMessages };
};
