## Node.js Masterclass Assignment 1

This is a simple `Hello World` RESTful API

### How to run the app
- Clone the repo
- run `npm install` to install dev dependencies
- Run `npm start`. The app will start on port 4000
- Make a GET request to the URL `localhost:4000/hello`
- The response will be in *JSON* with the format:
   ```javascript
   {
      "message": "Hello <device username>",
      "System information": {
        "username": "device username>",
        "hostname": "device hostname>",
        "platform": "<device platform>",
        "architecture": "<device architecture>",
      },
    }
   ```


