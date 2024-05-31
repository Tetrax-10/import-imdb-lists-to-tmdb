import chalk from "chalk"
import path from "path"

import { downloadImdbListCSV, csvToJson, wait, printLine, clearLastLine } from "./utils/utils.js"
import { getFileContents, getJsonContents, writeJSON } from "./utils/glob.js"
import { addTitlesToTmdbList, clearTmdbList, creteTmdbList, fetchTmdbIdsFromImdbIds, fetchTmdbListDetails } from "./utils/tmdbApiHelper.js"

const CONFIG = getJsonContents("./config.json")

console.log(chalk.green("\nSyncing lists...\n"))

for (let { name: imdbListName, imdbId: imdbListId, tmdbId: tmdbListId, sortField, isReverse: isReverseOrder } of structuredClone(CONFIG).reverse()) {
    let csvFileName
    // test if the id is a tmdb list id
    if (/^ls\d{5,}$/.test(imdbListId)) {
        csvFileName = (await downloadImdbListCSV(imdbListId)).split(".csv")[0]
    } else {
        // local file support
        csvFileName = imdbListId.split(".csv")[0]
    }

    printLine(chalk.yellow(`Syncing: ${imdbListName}`))

    const isNewList = tmdbListId === null ? true : false

    if (csvFileName) {
        let tmdbListDetails = { total_results: 0 }

        if (isNewList) {
            // create tmdb list for new imdb list
            tmdbListId = await creteTmdbList(imdbListName)

            if (!tmdbListId) {
                clearLastLine()
                console.error(chalk.red(`Failed to create TMDB list: ${imdbListName}`))
                break
            }

            // update config
            CONFIG.find((listItem) => listItem.imdbId === imdbListId).tmdbId = tmdbListId
            await writeJSON("./config.json", CONFIG)
        } else {
            tmdbListDetails = await fetchTmdbListDetails(tmdbListId)
        }

        // process imdb csv to json
        const imdbListItems = csvToJson(getFileContents(path.join("./imdb-csv", csvFileName + ".csv")))

        // check if list is already in sync
        if (tmdbListDetails.total_results == Object.keys(imdbListItems).length) {
            clearLastLine()
            console.log(chalk.green(`Already in sync: ${imdbListName}`))
            continue
        }

        // clear tmdb list before adding titles
        if (!isNewList) {
            tmdbListId = await clearTmdbList(tmdbListId)

            if (!tmdbListId) {
                clearLastLine()
                console.error(chalk.red(`Failed to clear TMDB list: ${imdbListName}`))
                break
            }
        }

        // wait for 5 secs for TMDB to process
        await wait(5000)

        // sort imdb list
        imdbListItems.sort((a, b) => {
            const fieldA = a[sortField]
            const fieldB = b[sortField]

            if (typeof fieldA === "number" && typeof fieldB === "number") {
                return fieldB - fieldA // descending
            } else if (typeof fieldA === "string" && typeof fieldB === "string") {
                return fieldA.localeCompare(fieldB) // ascending
            } else {
                return 0 // In case of different types or other edge cases
            }
        })
        if (isReverseOrder) imdbListItems.reverse()

        // fetch tmdb titles
        const tmdbListItems = await fetchTmdbIdsFromImdbIds(imdbListItems)

        // add titles to tmdb
        const addTitlesToTmdbListResult = await addTitlesToTmdbList(tmdbListId, tmdbListItems)
        if (addTitlesToTmdbListResult) {
            clearLastLine()
            console.log(chalk.green(`${isNewList ? "Created" : "Synced"}: ${imdbListName}`))
        }
    }
}

console.log(chalk.green("\nDone!"))
