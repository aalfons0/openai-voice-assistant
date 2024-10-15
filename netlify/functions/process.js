   // netlify/functions/process.js

   const axios = require('axios');

   exports.handler = async (event, context) => {
     // Handle CORS preflight
     if (event.httpMethod === 'OPTIONS') {
       return {
         statusCode: 200,
         headers: {
           'Access-Control-Allow-Origin': 'https://h2olabs.de', // Replace with your ReadyMag site URL
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
           'Access-Control-Allow-Origin': 'https://h2olabs.de', // Replace with your ReadyMag site URL
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

       const response = await axios.post(
         'https://api.openai.com/v1/chat/completions',
         {
           model: 'gpt-3.5-turbo',
           messages: [
             {
               role: 'system',
               content:
                 'You are a helpful customer service agent for h2o labs AI. Provide friendly and informative assistance to the customer.',
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
             Authorization: `Bearer ${OPENAI_API_KEY}`,
           },
         }
       );

       const aiMessage = response.data.choices[0].message.content.trim();

       return {
         statusCode: 200,
         headers: {
           'Access-Control-Allow-Origin': 'https://h2olabs.de', // Replace with your ReadyMag site URL
         },
         body: JSON.stringify({ reply: aiMessage }),
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


Add Netlify serverless function for OpenAI integration
