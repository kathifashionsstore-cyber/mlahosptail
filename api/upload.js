export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { image, name } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Missing image base64 data" });
    }

    // Get the private ImgBB API key from the environment
    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      console.error("Server Configuration Error: IMGBB_API_KEY env variable is not set.");
      return res.status(500).json({ error: "ImgBB API key is not configured on the server." });
    }

    // Clean up base64 prefix if present (e.g. "data:image/jpeg;base64,")
    let cleanBase64 = image;
    if (image.includes("base64,")) {
      cleanBase64 = image.split("base64,")[1];
    }

    // Format body as x-www-form-urlencoded as required by ImgBB
    const bodyParams = new URLSearchParams();
    bodyParams.append("image", cleanBase64);
    if (name) {
      bodyParams.append("name", name);
    }

    // Call ImgBB API
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("ImgBB Upload Failure:", data);
      return res.status(response.status || 500).json({
        error: data.error?.message || "Failed to upload image to ImgBB",
      });
    }

    // Return the image URL and delete URL
    return res.status(200).json({
      success: true,
      imageUrl: data.data.url,
      deleteUrl: data.data.delete_url,
    });
  } catch (error) {
    console.error("Server API Upload Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
