# patronizor-bot

A Discord bot that treats people as they should be treated.

## Setup

1. Clone the app locally

```
git clone https://github.com/davidvorona/patronizor-bot.git
```

2. Install `npm` packages

```
npm install
```


3. Add a `config/` folder with files `auth.json` and `config.json` to the root

**auth.json:**
```
{
    "TOKEN": "YOUR_TOKEN"
}
```

**config.json:**
```
{
    CLIENT_ID: "YOUR_CLIENT_ID",
    GUILD_ID: "YOUR_GUILD_ID",
    DATA_DIR: "./data"
}
```

4. Create an empty `data/` directory in the project root

## Usage

1. Build the bot

```
npm run-script build
```

2. Run the bot

```
npm start
```
