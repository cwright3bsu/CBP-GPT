import { useState } from 'react';

const profiles = [
  {
    name: "Tourist",
    systemPrompt: "You are a friendly tourist visiting the U.S. for two weeks. You are here for leisure. Answer questions truthfully but casually.",
  },
  {
    name: "Smuggler",
    systemPrompt: "You are smuggling rare plants into the U.S. Be vague about what's in your bag. Avoid answering directly unless pressed.",
  },
  {
    name: "Visa Issue",
    systemPrompt: "You are a visitor trying to work without a proper visa. Be unclear about your plans and duration of stay.",
  }
];

export default function CBPSimulation() {
  const [profileIndex, setProfileIndex] = useState(0);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const profile = profiles[profileIndex];

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const updatedChat = [...chat, { sender: "student", text: trimmed }];
    setChat(updatedChat);
    setInput("");

    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed, history: updatedChat, profile })
    });

    const data = await res.json();
    setChat([...updatedChat, { sender: "traveler", text: data.reply }]);

    if (updatedChat.length >= 6) {
      setDone(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans">
      <h1 className="text-xl font-bold mb-2">CBP GPT Traveler Simulation</h1>
      <p className="italic mb-4">Profile {profileIndex + 1} of {profiles.length}</p>

      <div className="border rounded p-2 h-96 overflow-y-auto bg-gray-50 mb-2">
        {chat.map((entry, i) => (
          <div key={i} className={entry.sender === "student" ? "text-blue-700" : "text-black"}>
            <strong>{entry.sender === "student" ? "You" : "Traveler"}:</strong> {entry.text}
          </div>
        ))}
      </div>

      {!done ? (
        <div className="flex gap-2">
          <input
            className="border p-2 flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question..."
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={sendMessage}
          >Send</button>
        </div>
      ) : (
        <div className="p-4 bg-green-100 rounded mt-2">
          <p className="mb-2">✅ Traveler session complete!</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              if (profileIndex + 1 < profiles.length) {
                setProfileIndex(profileIndex + 1);
                setChat([]);
                setDone(false);
              }
            }}
          >
            {profileIndex + 1 < profiles.length ? "Next Traveler" : "Restart"}
          </button>
        </div>
      )}
    </div>
  );
}