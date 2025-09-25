module.exports = {
    dojotekchatbot: {
      output: {
        mode: 'tags-split',
        target: 'src/sdk/dojotekchatbot.ts',
        schemas: './src/sdk/models',
        client: 'react-query',
        mock: true,
        httpClient: 'axios',
        baseUrl: 'http://localhost:3000',
      },
      input: {
        target: './dojotek-chatbot.yaml',
      },
    },
  };
  