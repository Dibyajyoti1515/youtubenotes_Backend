const express = require("express");
const router = express.Router();
const { YoutubeTranscript } = require("youtube-transcript");

// POST /ytnotes/transcript
router.post("/transcript", async (req, res) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: "Missing videoId" });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    res.status(200).json({ transcript });
  } catch (error) {
    console.error("Transcript fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch transcript" });
  }
});

module.exports = router;
