import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Adjust according to your imports
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI("AIzaSyAG5tHEVC0S_0TgpArJ2gIGgG1_kFoZPlk"); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "tunedModels/culinatrained1-p9b2gf0l0ae0"});

app.post('/generate', async (req, res) => {
  const { prompt } = req.body; // Extract prompt from request body

  if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
      const result = await model.generateContent([prompt]); // Call the generative model
      console.log("Result from AI:", JSON.stringify(result, null, 2)); // Log the entire result for better readability

      // Check the structure of candidates
      if (result.response.candidates && result.response.candidates.length > 0) {
          const candidate = result.response.candidates[0];
          console.log("Candidate:", candidate); // Log the first candidate to inspect its structure
          
          // Extract the text from the content.parts array
          const responseText = candidate.content.parts[0].text; // Get the text from parts

          if (responseText) {
              res.json({ response: responseText }); // Send the response text back
          } else {
              res.status(500).json({ error: 'Text not found in the response' });
          }
      } else {
          res.status(500).json({ error: 'No candidates found in response' });
      }
  } catch (error) {
      console.error('Error generating content:', error);
      res.status(500).json({ error: 'Failed to generate content' });
  }
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
