import chalk from "chalk"
import path from "path"

import { downloadImdbListCSV, csvToJson, processImdbListJson, wait } from "./utils/utils.js"
import { getFileContents, getJsonContents, writeJSON } from "./utils/glob.js"
import { addTitlesToTmdbList, clearTmdbList, creteTmdbList, fetchTmdbIdsFromImdbIds, fetchTmdbListDetails } from "./utils/tmdbApiHelper.js"

const CONFIG = getJsonContents("./config.json")
// reverse ordered, so first list is processed last inorder to get them on top of your tmdb lists page
const imdbListIds = Object.keys(CONFIG).reverse()

// sync lists
for (const imdbListId of imdbListIds) {
    let imdbListName
    if (/^ls\d{5,}$/.test(imdbListId)) {
        imdbListName = (await downloadImdbListCSV(imdbListId)).split(".csv")[0]
    } else {
        // local file support
        imdbListName = imdbListId.split(".csv")[0]
    }
    const isNewList = CONFIG[imdbListId] === null ? true : false

    if (imdbListName) {
        let tmdbListId
        let tmdbListDetails = { total_results: 0 }

        if (isNewList) {
            // create tmdb list for new imdb list
            tmdbListId = await creteTmdbList(imdbListName)

            if (!tmdbListId) {
                console.error(chalk.red(`Failed to create TMDB list: ${imdbListId} ${imdbListName}`))
                break
            }

            // update config
            CONFIG[imdbListId] = tmdbListId
            await writeJSON("./config.json", CONFIG)
        } else {
            tmdbListDetails = await fetchTmdbListDetails(CONFIG[imdbListId])
        }

        // process imdb csv
        const imdbListJson = csvToJson(getFileContents(path.join("./imdb-csv", imdbListName + ".csv")))
        const imdbListItems = processImdbListJson(imdbListJson)

        // check if list is already in sync
        if (tmdbListDetails.total_results == Object.keys(imdbListItems).length) {
            console.log(chalk.green(`list already in sync: ${imdbListName}`))
            continue
        }

        // clear tmdb list before adding titles
        if (!isNewList) {
            tmdbListId = await clearTmdbList(CONFIG[imdbListId])

            if (!tmdbListId) {
                console.error(chalk.red(`Failed to clear TMDB list: ${imdbListId} ${imdbListName}`))
                break
            }
        }

        // wait for 5 secs for TMDB to process
        await wait(5000)

        // fetch tmdb titles
        const tmdbListItems = await fetchTmdbIdsFromImdbIds(imdbListItems)

        // add titles to tmdb
        const addTitlesToTmdbListResult = await addTitlesToTmdbList(tmdbListId, tmdbListItems)
        if (addTitlesToTmdbListResult) console.log(chalk.green(`${isNewList ? "Created" : "Synced"} list: ${imdbListName}`))
    }
}

console.log(chalk.green("\nDone!"))
