export default async function handler(req, res) {
  const { message, history, profile } = req.body;
  const fullPrompt = [
    { role: "system", content: profile.systemPrompt },
    ...history.map(msg => ({
      role: msg.sender === "student" ? "user" : "assistant",
      content: msg.text
    })),
    { role: "user", content: message }
  ];

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: fullPrompt,
      temperature: 0.7
    })
  });

  const data = await completion.json();
  const reply = data.choices?.[0]?.message?.content || "Hmm... not sure how to respond.";
  res.status(200).json({ reply });
}