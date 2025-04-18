# so-true-bot

So True.

## Setup

1. Clone the app locally

```
git clone https://github.com/davidvorona/so-true-bot.git
```

2. Install `npm` packages

```
npm install
```


3. Add a `config/` folder with files `auth.json` and `config.json` to the root

**auth.json:**
```
{
    "TOKEN": "YOUR_TOKEN",
    "PG": {
        "connectionString": "YOUR_CONNECTION_STRING"
    }
}
```

**config.json:**
```
{
    "CLIENT_ID": "YOUR_CLIENT_ID",
    "GUILD_ID": "YOUR_GUILD_ID",
}
```

4. Create the database specified in your PG connection string

## Usage

1. Build the bot

```
npm run-script build
```

2. Run the bot

```
npm start
```
