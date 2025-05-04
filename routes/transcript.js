const express = require("express");
const router = express.Router();
const { YoutubeTranscript } = require("youtube-transcript");

router.post("/transcript", async (req, res) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: "Missing videoId" });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return res.status(404).json({ error: "Transcript is not available for this video" });
    }

    res.status(200).json({ transcript });
  } catch (error) {
    console.error("Transcript fetch error:", error.message);

    if (error.message.includes("Transcript is disabled")) {
      return res.status(403).json({ error: "Transcript is disabled for this video" });
    }

    res.status(500).json({ error: "Failed to fetch transcript" });
  }
});


module.exports = router;
