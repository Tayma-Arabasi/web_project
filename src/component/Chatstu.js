import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

// GraphQL queries
const GET_ADMINS = gql`
  query GetAdmins {
    Admins {
      username
    }
  }
`;

const GET_SENDER = gql`
  query GetSender {
    sender {
      username
    }
  }
`;

// GraphQL mutation
const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      success
      message
    }
  }
`;

export default function Chat() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [receiver, setReceiver] = useState("");
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get admin
  const { data: adminsData, loading: studentsLoading, error: studentsError } = useQuery(GET_ADMINS);

  // Get sender
  const { data: senderData, loading: senderLoading, error: senderError } = useQuery(GET_SENDER);

  const sender = senderData?.sender?.username || "";

  // Mutation hook
  const [sendMessage] = useMutation(SEND_MESSAGE);

  const handleSelectStudent = (name) => {
    setSelectedStudent(name);
    setReceiver(name);
    setMessages([]); // Clear old messages
  };

  const handleSendMessage = async () => {
    if (!content.trim() || !receiver.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    const newMsg = {
      content,
      timestamp: new Date().toLocaleTimeString(),
      sender,
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, newMsg]);
    setContent("");
    setIsLoading(true);

    try {
      const { data } = await sendMessage({
        variables: {
          input: {
            sender,
            receiver,
            content,
          },
        },
      });

      if (!data.sendMessage.success) {
        throw new Error(data.sendMessage.message || "Failed to send message");
      }

      alert("Message sent successfully");
    } catch (err) {
      console.error("Error sending message:", err.message);
      alert(err.message || "Server error");
      // Optionally rollback optimistic update or handle failure UI here
    } finally {
      setIsLoading(false);
    }
  };

  if (studentsLoading || senderLoading) return <p>Loading...</p>;
  if (studentsError) return <p>Error loading students.</p>;
  if (senderError) return <p>Error loading sender.</p>;

  return (
    <div className="flex w-full h-full p-4 gap-4" style={{ backgroundColor: "#1e1e1e" }}>
      {/* Student List */}
      <div className="w-1/4 p-4 rounded-2xl shadow-lg" style={{ backgroundColor: "#1e1e1e" }}>
        <h3 className="text-lg font-semibold mb-4 text-white">Admins</h3>
        <ul className="space-y-2 max-h-96 overflow-y-auto">
{adminsData.Admins.map((student) => (
            <li
              key={student.username}
              onClick={() => handleSelectStudent(student.username)}
              className={`cursor-pointer px-3 py-2 rounded-lg text-white ${
                selectedStudent === student.username ? "bg-green-600" : "hover:bg-[#444444]"
              }`}
              style={{ backgroundColor: selectedStudent === student.username ? "#4CAF50" : "#444444" }}
            >
              {student.username}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Box */}
      <div className="flex-1 p-4 rounded-2xl shadow-lg flex flex-col" style={{ backgroundColor: "#2a2a2a" }}>
        <h3 className="text-lg font-semibold mb-2 text-white">
          Chat with: <span className="text-green-400">{selectedStudent || "None"}</span>
        </h3>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto border border-gray-700 rounded-xl p-3 space-y-2 bg-[#1e1e1e] max-h-96">
          {messages.length === 0 && <p className="text-gray-500 italic">No messages yet.</p>}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === sender ? "justify-end" : "justify-start"}`}>
              <div
                className={`p-3 rounded-xl max-w-xs ${
                  msg.sender === sender ? "bg-green-600 text-white text-right" : "bg-gray-700 text-white text-left"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <span className="text-xs text-gray-300 block mt-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 p-2 rounded-lg text-white placeholder-gray-300 focus:outline-none"
            style={{ backgroundColor: "#333333" }}
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
          />
          <button
            className="text-white px-4 py-2 rounded-lg"
            style={{ backgroundColor: "#4caf50" }}
            onClick={handleSendMessage}
            disabled={isLoading}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#45a049")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4caf50")}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
