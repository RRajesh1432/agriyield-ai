import React, { useState, useRef, useEffect } from 'react';
import { askChatbot } from '../services/geminiService';
import type { ChatMessage } from '../types';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
}

const FAQ_QUESTIONS = [
    'What is AgriYield-AI?',
    'How do I get a prediction?',
    'Is my data private?',
    'What technology does this app use?',
];

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: "Hello! I'm the AgriYield-AI assistant. How can I help you today?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (messageText?: string) => {
        const text = (messageText || inputValue).trim();
        if (!text) return;

        const userMessage: ChatMessage = { role: 'user', text };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const botResponse = await askChatbot(text);
            const modelMessage: ChatMessage = { role: 'model', text: botResponse };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, something went wrong." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFaqClick = (question: string) => {
        handleSendMessage(question);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100%-2rem)] max-w-sm h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in-up border border-gray-200">
            <header className="flex items-center justify-between p-4 bg-green-700 text-white rounded-t-2xl">
                <h2 className="text-lg font-bold">🌾 AgriYield-AI Assistant</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-green-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </header>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                     {messages.length === 1 && !isLoading && (
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Frequently Asked Questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {FAQ_QUESTIONS.map((q, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleFaqClick(q)}
                                        className="text-xs px-3 py-1.5 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <footer className="p-4 border-t border-gray-200">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !inputValue} className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default Chatbot;
