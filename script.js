const apiKey = "pcsk_5aPByc_ANDua3VzQEUskuJ5aX9DcHKo8SRd4Pm5YBetheEiUV6P2VEQjVGdvYZzgAV2KMv"; 
const host = "https://sample-movies-l7cyesi.svc.aped-4627-b74a.pinecone.io";

async function fetchAvatarById() {
  try {
    // Note the query parameter format: ?ids=0
    const response = await fetch(`${host}/vectors/fetch?ids=0`, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log("🎬 Found Avatar Details:", data.vectors["0"].metadata);
    
  } catch (error) {
    console.error("❌ Error fetching ID:", error.message);
  }
}

fetchAvatarById();
