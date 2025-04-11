# Import IMDb lists to TMDB

Import and sync IMDb lists to TMDB

![Demo](https://raw.githubusercontent.com/Tetrax-10/import-imdb-lists-to-tmdb/main/assets/demo.gif)

</br>

## Setup

1. Make sure you have [Node.js](https://nodejs.org/) installed. You can use [Bun.js](https://bun.sh/) too.

2. [Download this repo](https://github.com/Tetrax-10/import-imdb-lists-to-tmdb/archive/refs/heads/main.zip).

3. Open a terminal inside `import-imdb-lists-to-tmdb` folder and run `npm install`.

4. Rename the file `.env.example` to `.env` and replace the placeholders with your api key and WRITE access token.

    **Note**: You should create a write access token if you don't have one in-order for this tool to work. Create it from [here](http://dev.travisbell.com/play/v4_auth.html) with your [API Read Access Token](https://www.themoviedb.org/settings/api).

</br>

## Configuration

To Import/Sync your IMDb lists to TMDB, all you have to do is configure the `config.json` file and follow the [usage instruction](#usage).

### Configuration for Importing

If you want to import to a new TMDB list, Open the `config.json` file and specify the IMDb list's ID in the `imdbId` field or if you have the list as a CSV, then just put the file name in the `imdbId` field with `.csv` extension. Set the `tmdbId` field to `null` to create a new TMDB list, and provide a name for the new list in the `name` field.

```js
{
    "name": "Watched Movies",
    "imdbId": "ls540766631", // or "my-list.csv"
    "tmdbId": null, // when ID is null it will be imported
    "sortField": null,
    "isReverse": false
}
```

</br>

### Configuration for Syncing

If you already have a TMDB list that's just out of sync, follow the same procedure. However, instead of assigning `null` to the `tmdbId` field, assign the TMDB list's ID to the `tmdbId` field.

```js
{
    "name": "Watched Movies",
    "imdbId": "ls540766631",
    "tmdbId": "8282880", // when ID is not null it will be synced
    "sortField": null,
    "isReverse": false
}
```

</br>

### Configuration for private IMDb lists

If your list is private, you can't simply put the IMDb list's ID in the `imdbId` field due to permission issues. You can overcome this with these two methods:

#### Manual method

Just export the private IMDb lists as CSV and put them inside `imdb-csv` folder and specify the file name in `imdbId` with `.csv` extension.

```js
{
    "name": "Watched Movies",
    "imdbId": "Watched Movies.csv", // exported csv file name
    "tmdbId": "8282880",
    "sortField": null,
    "isReverse": false
}
```

#### Automated method

Make sure you are logged in to IMDb on chrome. Then go to `chrome://version`, copy your `Profile Path` and paste it next to `CHROME_USER_DATA_PATH` in `.env` file. So this script can access your IMDb account.

```js
// It should look like this
CHROME_USER_DATA_PATH=C:/Users/username/AppData/Local/Google/Chrome/User Data
```

</br>

### sortField and isReverse in `config.json`

You can sort the IMDb list and then import it to TMDB by specifying a valid field name in the `sortField`.

valid field names are:

```
Position | Created | Modified | Title | Title Type | IMDb Rating | Runtime (mins) | Year | Num Votes | Release Date | Directors | Your Rating | Date Rated
```

Note: numbers fields are sorted in descending order and strings are sorted in ascending order. You can reverse them by making `isReverse` as `true`.

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
