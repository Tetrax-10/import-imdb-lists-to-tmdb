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

## Sample `config.json`

```js
[
    // automatically downloads csv from IMDb
    {
        name: "Watched Movies", // https://www.imdb.com/list/ls540766631 will be synced with https://www.themoviedb.org/list/8282880
        imdbId: "ls540766631",
        tmdbId: "8282880",
        sortField: null,
        isReverse: true, // TMDB list will be in reverse order
    },
    {
        name: "My Favorite Movies", // https://www.imdb.com/list/ls540746212 will be imported to a new TMDB list
        imdbId: "ls540746212",
        tmdbId: null,
        sortField: "IMDb Rating",
        isReverse: false,
    },

    // If you manually download the list, just put them inside `imdb-csv` folder and specify the file name in `imdbId`
    {
        name: "Romance Movies", // Romance Movies.csv inside imdb-csv folder will be synced with https://www.themoviedb.org/list/8301861
        imdbId: "Romance Movies.csv",
        tmdbId: "8301861",
        sortField: "Num Votes", // list will be sorted by `Num Votes` and then synced
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

### Sorting

You can sort the IMDb list and then import it to TMDB by specifying the `sortField` field. You can identify the field names by opening the exported CSV and checking the first line. They will be like `Position, Const, Created, Modified, etc...`.

Note: numbers fields are sorted in descending order and strings are sorted in ascending order. You can reverse them by making `isReverse` as `true`.

</br>

### Dealing with private IMDb lists

#### Manual method

Just export them manually and put them inside `imdb-csv` folder and specify the file name in `imdbId`.

#### Automated method

Make sure you are logged in to IMDb on chrome. Then go to `chrome://version`, copy your `Profile Path` and paste it next to `CHROME_USER_DATA_PATH` in `.env` file.

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
