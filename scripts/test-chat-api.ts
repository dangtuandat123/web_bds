async function testChat() {
    console.log("Testing Chat API...");
    try {
        const response = await fetch("http://localhost:3001/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: "",
                        parts: [
                            { type: "text", text: "Tìm nhà ở quận 9 giá dưới 5 tỷ" }
                        ]
                    }
                ]
            }),
        });

        if (!response.ok) {
            console.error("Error:", response.status, response.statusText);
            const text = await response.text();
            console.error("Body:", text);
            return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
            console.error("No reader available");
            return;
        }

        const decoder = new TextDecoder();
        console.log("Response Stream:");
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            console.log(chunk);
        }
        console.log("\nDone.");
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

testChat();
