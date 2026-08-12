const apiKey = "";
const remoteHost = "https://sample-movies-l7cyesi.svc.aped-4627-b74a.pinecone.io";
const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const fetchUrl = isLocalDev
  ? "/pinecone/vectors/fetch?ids=0"
  : `${remoteHost}/vectors/fetch?ids=0`;

async function fetchAvatarById() {
  try {
    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: isLocalDev
        ? { "Content-Type": "application/json" }
        : { "Api-Key": apiKey, "Content-Type": "application/json" },
    });

    const data = await response.json();
    console.log("🎬 Found Avatar Details:", data.vectors["0"].metadata);
    
  } catch (error) {
    console.error("❌ Error fetching ID:", error.message);
  }
}

fetchAvatarById();
