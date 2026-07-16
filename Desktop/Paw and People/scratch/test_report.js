async function testSubmit() {
  const url = process.argv[2] || "http://127.0.0.1:5001/paws-and-people-dev/us-central1/reportDistress";
  console.log(`Sending mock JSON request to: ${url}\n`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        latitude: "12.9716",
        longitude: "77.5946",
        photoBase64: "dGhpcyBpcyBhIGZha2UgaW1hZ2UgYmFzZTY0IHN0cmluZw==", // mock base64
        audioBase64: "YW5vdGhlciBmYWtlIGJhc2U2NCBzdHJpbmc=" // mock base64
      }),
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log("Response Body:\n", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error sending test request:", error);
  }
}

testSubmit();