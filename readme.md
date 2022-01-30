# Slack Secret Manager

Create and share secrets (e.g. passwords, confidential text) to other Slack users in a private message or within channels and get ultimate confidence that only the correct users see the secret.

Features
===============

- `/secret` command to open a modal dialog which lets you create a new secret. Configure a title, the channel, authorized users, expiry of access, and whether this should expire after first view.
- `/secret @user <secretMessage>` Lets you create a secret instantly to one user within that conversation/channel.
- `/vault` Lets you view non-expired secrets that you are authorised to view.
- "Create a Secret" shortcut also shows the modal dialog to create a new secret.
- After creating any secret, a secret would have **two buttons**. 
  - `Reveal Secret` would show a popup to reveal the secret message. 
  - `Access Log` would show a popup with all users who opened the secret and who got access or were denied.
- You can also configure the default settings for expiry, title and one-time view in the App Home page.

Security
===============
- All secrets are encrypted using OpenPGP standard and are stored as encrypted values in the app's database.
- Every secret is encrypted with a random decode key.
- The decode key is never stored in the app itself but stored as a value within the `Reveal Secret` block button that is sent in the conversation message by the app bot.
- When a user reveals a secret, authorization is checked first before the decode key taken will be used to decode any secret
- All secrets that have expired be automatically deleted by their `time-to-live` attribute in AWS DynamoDb.

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


Read the [Getting Started guide](https://api.slack.com/start/building/bolt)
-------------------

Read the [Bolt documentation](https://slack.dev/bolt)
-------------------



