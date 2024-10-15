// netlify/functions/process.js

const axios = require('axios');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://h2olabs.de', // Replace with your domain
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': 'https://h2olabs.de',
      },
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': 'https://h2olabs.de',
        },
        body: JSON.stringify({ message: 'Bad Request: No message provided.' }),
      };
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_ORG_ID = process.env.OPENAI_ORG_ID; // Add this
    const OPENAI_PROJECT_ID = process.env.OPENAI_PROJECT_ID; // Add this

    // First, get the assistant's response using the Chat API
    const chatResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful customer service agent for H2O Labs AI. Provide friendly and informative assistance to the customer.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Organization': OPENAI_ORG_ID, // Include your Organization ID
        },
      }
    );

    const aiMessage = chatResponse.data.choices[0].message.content.trim();

    // Next, synthesize the speech using OpenAI's Speech API
    const audioResponse = await axios.post(
      'https://api.openai.com/v1/tts', // Use the correct TTS endpoint
      {
        text: aiMessage,
        model: 'whisper-1', // Specify the model if required
        response_format: 'base64', // Receive audio as Base64
        // Include any additional parameters as needed
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Organization': OPENAI_ORG_ID,
        },
      }
    );

    const audioBase64 = audioResponse.data.audio; // Adjust according to actual response structure

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://h2olabs.de',
      },
      body: JSON.stringify({ audioContent: audioBase64 }),
    };
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://h2olabs.de',
      },
      body: JSON.stringify({
        message: 'An error occurred while processing your request.',
      }),
    };
  }
};
