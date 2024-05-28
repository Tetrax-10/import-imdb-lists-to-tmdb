# Import IMDb lists to TMDB

Import and sync IMDb lists to TMDB

![Demo](https://raw.githubusercontent.com/Tetrax-10/import-imdb-lists-to-tmdb/master/assets/demo.gif)

## Installation

1. You need to have [Node.js](https://nodejs.org/) installed.

2. Clone this repo by running this command or [download](https://github.com/Tetrax-10/import-imdb-lists-to-tmdb/archive/refs/heads/main.zip) this repo.

```sh
git clone https://github.com/Tetrax-10/import-imdb-lists-to-tmdb.git
```

3. Run `npm install` inside `import-imdb-lists-to-tmdb` folder.

4. Rename the file `.env.example` to `.env` and replace the placeholders with your api key and write access token.

    _Note_: you can create write access token from [here](http://dev.travisbell.com/play/v4_auth.html) and test it out [here](http://dev.travisbell.com/play/v4_list.html).

## Configure what to import and sync

#### Syncing IMDb lists with TMDB lists

If you have already created IMDb lists in TMDB and they are just out of sync, you can update them by putting the IMDb list's ID on the left side and the TMDB list's ID on the right side. This will create the `config.json` file. The script will automatically export your IMDb lists and import them into their respective TMDB lists. If you have private lists on IMDb, you can't simply put the IMDb list's ID on the left side due to permission issues. Instead, you can manually export those IMDb lists, place them inside the `imdb-csv` folder, and put their filenames with the extension on the left side.

#### Importing IMDb lists freshly into TMDB

If you haven't created IMDb lists in TMDB, just follow the same process specified above, except put `null` on the right side since you don't have their respective TMDB lists.

#### Sample `config.json`

```js
{
    "ls540766631": 8282880, // https://www.imdb.com/list/ls540766631 will be synced with https://www.themoviedb.org/list/8282880
    "ls540743324": 8301864,
    "ls540746212": null, // https://www.imdb.com/list/ls540766631 will be imported to a new TMDB list
    "ls540425139": 8301862,
    "Romance Movies.csv": 8301861, // Romance Movies.csv inside imdb-csv folder will be synced with https://www.themoviedb.org/list/8301861
    "ls540639180": 8301860,
    "My Private List.csv": null // My Private List.csv inside imdb-csv folder will be imported to a new TMDB list
}
```

## Usage

Run this command inside `import-imdb-lists-to-tmdb` folder to import/sync your lists specified in `config.json`.

```sh
npm run sync
```
