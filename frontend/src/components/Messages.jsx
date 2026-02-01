import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Messages.css";
import ChevronLeft from "../assets/images/ChevronLeft.png";
import { useUser } from "./UserContext";
import axios from "axios";

const Messages = () => {
    const { user } = useUser();
    const location = useLocation();
    const [search, setSearch] = useState("");
    const [conversationPartners, setConversationPartners] = useState([]);
    const [partnerDetails, setPartnerDetails] = useState({});
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [messageHistory, setMessageHistory] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const chatAreaRef = useRef(null);

    // Scroll to the bottom of the chat area whenever messageHistory changes
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messageHistory]);

    // Fetch conversation partners
    useEffect(() => {
        if (user) {
            axios
                .get(`${process.env.REACT_APP_BACKEND_URL}/api/conversation-partners/${user.id}`, { withCredentials: true })
                .then((response) => {
                    setConversationPartners(response.data.partners);
                    fetchPartnerDetails(response.data.partners);
                })
                .catch((error) => {
                    console.error("Error fetching conversation partners:", error);
                });
        }
    }, [user]);

    // Add new partner from location state
    useEffect(() => {
        const state = location.state;
        if (state?.partnerId) {
            if (conversationPartners.includes(state.partnerId)) {
                setSelectedPartner(state.partnerId);
                fetchMessageHistory(state.partnerId);
            } else {
                setConversationPartners((prev) => [...prev, state.partnerId]);
                fetchPartnerDetails([state.partnerId]);
                setSelectedPartner(state.partnerId);
            }
        }
    }, [location.state, conversationPartners]);

    // Fetch details for each conversation partner
    const fetchPartnerDetails = (partners) => {
        const newDetails = {};
        partners.forEach((partnerId) => {
            if (!partnerDetails[partnerId]) {
                axios
                    .get(`${process.env.REACT_APP_BACKEND_URL}/api/user-details/${partnerId}`, { withCredentials: true })
                    .then((response) => {
                        const { type, firstName, lastName, businessName } = response.data.userDetails;
                        newDetails[partnerId] = type === "worker" ? `${firstName} ${lastName}` : businessName;

                        setPartnerDetails((prev) => ({ ...prev, ...newDetails }));
                    })
                    .catch((error) => {
                        console.error(`Error fetching details for partner ${partnerId}:`, error);
                    });
            }
        });
    };

    // Fetch message history for the selected partner
    const fetchMessageHistory = (partnerId) => {
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/message-history`, {
                params: { senderId: user.id, receiverId: partnerId },
            }, { withCredentials: true })
            .then((response) => {
                setMessageHistory(response.data.messages || []);
                setSelectedPartner(partnerId);
            })
            .catch((error) => {
                console.error("Error fetching message history:", error);
            });
    };

    // Send a new message
    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        axios
            .post(`${process.env.REACT_APP_BACKEND_URL}/api/send-message`, {
                senderId: user.id,
                receiverId: selectedPartner,
                content: newMessage,
            }, { withCredentials: true })
            .then((response) => {
                setMessageHistory((prev) => [...prev, response.data.message]);
                setNewMessage("");
            })
            .catch((error) => {
                console.error("Error sending message:", error);
            });
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const isActive = (path) => location.pathname === path;

    return (!user ? (<div>Loading...</div>) : (
        <div className="messages-container">
            <header className="messages-header">
                <Link to="/dashboard" className={isActive("/find-gigs") ? "active" : ""}>
                    <img className="dash-back-btn" src={ChevronLeft} alt="Return to Dashboard" />
                </Link>
            </header>
            <div className="chat-container">
                <div className="person-list">
                    <h1 className="person-list-header">Messages</h1>
                    <input
                        type="text"
                        className="person-searchbar"
                        placeholder="Search..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                    <ul className="person-list-items">
                        {conversationPartners
                            .filter((partner) => {
                                const partnerName = partnerDetails[partner] || "";
                                return partnerName.toLowerCase().includes(search.toLowerCase());
                            })
                            .map((partner) => (
                                <li
                                    key={partner}
                                    className={`person-item ${selectedPartner === partner ? "active" : ""}`}
                                    onClick={() => fetchMessageHistory(partner)}
                                >
                                    {partnerDetails[partner] || "Loading..."}
                                </li>
                            ))}
                    </ul>
                </div>
                <div className="chat-divider" />
                <div className="chat">
                    <h1 className="chat-header">Chat</h1>
                    <div className="chat-area" ref={chatAreaRef}>
                        {messageHistory.length > 0 ? (
                            messageHistory.map((message, index) => (
                                <div
                                    key={index}
                                    className={`chat-message ${message.sender_id === user.id ? "sent" : "received"}`}
                                >
                                    {message.content}
                                </div>
                            ))
                        ) : (
                            <p className="no-chats">
                                {selectedPartner
                                    ? "No chat history available. Start a conversation!"
                                    : "No Chats Selected"}
                            </p>
                        )}
                    </div>
                    {selectedPartner && (
                        <div className="chat-input">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSendMessage(); // Trigger the send message function
                                    }
                                }}
                            />
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ));
};

export default Messages;
