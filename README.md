# Import IMDb lists to TMDB

Import and sync IMDb lists to TMDB

![Demo](https://raw.githubusercontent.com/Tetrax-10/import-imdb-lists-to-tmdb/main/assets/demo.gif)

</br>

## Installation

1. You need to have [Node.js](https://nodejs.org/) installed.

2. Clone this repo by running this command or [download](https://github.com/Tetrax-10/import-imdb-lists-to-tmdb/archive/refs/heads/main.zip) this repo.

```sh
git clone https://github.com/Tetrax-10/import-imdb-lists-to-tmdb.git
```

3. Run `npm install` inside `import-imdb-lists-to-tmdb` folder.

4. Rename the file `.env.example` to `.env` and replace the placeholders with your api key and write access token.

    _Note_: You can create write access token from [here](http://dev.travisbell.com/play/v4_auth.html) with your [API Read Access Token](https://www.themoviedb.org/settings/api) and test it out [here](http://dev.travisbell.com/play/v4_list.html).

</br>

## Configuring config.json

### Syncing IMDb lists with TMDB lists

If you have already created IMDb lists in TMDB and they are just out of sync, you can update them by entering the `IMDb list's ID` and the `TMDB list's ID` in the `imdbId` and `tmdbId` fields, respectively. The script will automatically export your IMDb lists and sync them to their respective TMDB lists. If you have private lists on IMDb, you can't simply use the IMDb list's ID due to permission issues. Instead, you can manually export those IMDb lists, place them inside the `imdb-csv` folder, and enter their filenames with the extension in the `imdbId` field.

### Importing IMDb lists freshly into TMDB

If you haven't created IMDb lists in TMDB, simply follow the same process specified above, except enter `null` in the `tmdbId` field, since you don't have their respective TMDB lists.

### Sorting

You can sort the IMDb list and then import it to TMDB by specifying the `sortField` field. You can identify the field names by opening the exported CSV and checking the first line. They will be like `Position, Const, Created, Modified`.

Note: numbers fields are sorted in descending order and strings are sorted in ascending order. You can reverse them by making `isReverse` as `true`.

</br>

## Sample `config.json`

```js
[
    {
        name: "Watched Movies", // https://www.imdb.com/list/ls540766631 will be synced with https://www.themoviedb.org/list/8282880
        imdbId: "ls540766631",
        tmdbId: "8282880",
        sortField: null,
        isReverse: true,
    },
    {
        name: "My Favorite Movies", // https://www.imdb.com/list/ls540766631 will be imported to a new TMDB list
        imdbId: "ls540746212",
        tmdbId: null,
        sortField: "IMDb Rating",
        isReverse: false,
    },
    {
        name: "Romance Movies", // Romance Movies.csv inside imdb-csv folder will be synced with https://www.themoviedb.org/list/8301861
        imdbId: "Romance Movies.csv",
        tmdbId: "8301861",
        sortField: "Num Votes",
        isReverse: true,
    },
    {
        name: "Weird Movies", // Weird Movies.csv inside imdb-csv folder will be imported to a new TMDB list
        imdbId: "Weird Movies.csv",
        tmdbId: null,
        sortField: "Title",
        isReverse: false,
    },
]
```

</br>

## Usage

Run this command inside `import-imdb-lists-to-tmdb` folder to import/sync your lists specified in `config.json`.

```sh
npm run sync
```

To force sync your list (clears all titles inside your TMDB list and imports them freshly)

```sh
npm run force-sync
```
