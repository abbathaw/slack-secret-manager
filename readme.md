# Slack Secret Manager

Getting Started
===============
- `npm install` the needed npm packages.
- copy and rename `.env.sample` to `.env`.
- Obtain the ENVIRONMENT variable using this [guide](https://slack.dev/bolt-js/tutorial/getting-started).
    + Go to the Slack App page.
    + **OAuth & Permissions** to get the *Bot User OAuth Token*
    + **Basic Information** to get the *Signing Secret*
    + *Slack App Token* - this is retrieved when you enable socket mode or from the home config.
- Start development mode using `npm run dev`
    + If you get `ECONNREFUSED` try commenting away the `socketMode`
    + establish some connection by calling some API from the slack.
    + Then, uncomment the `socketMode`
- **Event Subscriptions** add in the *Request URL* (IF not using socket mode)
    + Eg. `https://XXXXXX.ngrok.io/slack/events`
    + Make sure is verified.
- In the app config, add the necessary commands and permissions (for write), and events listeners (refer to manifest.yaml)
- If everything works well, type `/secret` in the slack chat.
    + It should have a pop up model.

Local DynamoDB Setup
====================
- Setup the local dynamodb using `:8000` using the following [guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html)
- Ensure that you have the *Access Key* available in
    - Environment variable for `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
    - Or, `AWS_CONFIG`.

- Run local dynamodb
  ```bash
  docker run -itd -p 8000:8000  --name dev-db amazon/dynamodb-local:latest -jar DynamoDBLocal.jar -sharedDb
  ```
- Run `npm run db` to init create the tables.

- Enable time-to-live on local db
  ```bash
  aws dynamodb update-time-to-live --table-name Secret --time-to-live-specification Enabled=true,AttributeName=ttl --endpoint-url http://localhost:8000 --region=sas
  ```

Bolt app template
=================

[Bolt](https://slack.dev/bolt) is our framework that lets you build JavaScript-based Slack apps in a flash.

This project is a simple app template to make it easy to create your first Bolt app. Read our [Getting Started with Bolt](https://api.slack.com/start/building/bolt) guide for a more in-depth tutorial

Your Project
------------

- `app.js` contains the primary Bolt app. It imports the Bolt package (`@slack/bolt`) and starts the Bolt app's server. It's where you'll add your app's listeners.
- `.env` is where you'll put your Slack app's authorization token and signing secret.
- The `examples/` folder contains a couple of other sample apps that you can peruse to your liking. They show off a few platform features that your app may want to use.


Read the [Getting Started guide](https://api.slack.com/start/building/bolt)
-------------------

Read the [Bolt documentation](https://slack.dev/bolt)
-------------------



