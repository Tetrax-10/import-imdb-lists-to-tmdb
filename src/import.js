import chalk from "chalk"
import path from "path"

import { downloadImdbListCSV, csvToJson, wait, printLine, clearLastLine } from "./utils/utils.js"
import { getFileContents, getJsonContents, copyFile, writeJSON, fsExsists } from "./utils/glob.js"
import { addTitlesToTmdbList, clearTmdbList, creteTmdbList, fetchTmdbIdsFromImdbIds, fetchTmdbListDetails } from "./utils/tmdbApiHelper.js"

const CONFIG = getJsonContents("./config.json")

console.log(chalk.green("\nSyncing lists...\n"))

const isForceSync = process.argv.includes("--force")

for (let { name: imdbListName, imdbId: imdbListId, tmdbId: tmdbListId, sortField, isReverse: isReverseOrder } of structuredClone(CONFIG).reverse()) {
    let csvFileName
    // check if the id is a imdb list id
    if (/^ls\d{5,}$/.test(imdbListId)) {
        csvFileName = await downloadImdbListCSV(imdbListId, imdbListName)
    } else {
        // local csv support
        csvFileName = imdbListId
    }

    printLine(chalk.yellow(`Syncing: ${imdbListName}`))

    const isNewList = tmdbListId === null ? true : false

    if (!csvFileName) {
        if (imdbListId.endsWith(".csv")) {
            clearLastLine()
            console.error(chalk.red(`Can't find CSV file: ${imdbListId}`))
        }
        continue
    }

    if (isNewList) {
        // create tmdb list for new imdb list
        tmdbListId = await creteTmdbList(imdbListName)

        if (!tmdbListId) {
            clearLastLine()
            console.error(chalk.red(`Failed to create TMDB list: ${imdbListName}`))
            continue
        }

        // update config
        CONFIG.find((listItem) => listItem.imdbId === imdbListId).tmdbId = tmdbListId
        await writeJSON("./config.json", CONFIG)
    }

    // process imdb csv to json and movie it to cache folder
    const csvFilePath = path.join("./imdb-csv", csvFileName)
    const csvCacheFilePath = path.join("./cache", csvFileName)
    let imdbListItems = csvToJson(getFileContents(csvFilePath))

    let isTmdbListUpdatable = false

    // if list is updatable then extract updatable items
    if (fsExsists(csvCacheFilePath) && !sortField && !isReverseOrder && !isNewList && !isForceSync) {
        const imdbCacheListItems = csvToJson(getFileContents(csvCacheFilePath))

        // both list's last items
        const imdbListLastItemId = imdbListItems[imdbListItems.length - 1]?.["Const"]
        const imdbCacheListLastItemId = imdbCacheListItems[imdbCacheListItems.length - 1]?.["Const"]

        // check if last cache item is present in new list and check if any old items changed
        let hasAnyOldItemsChanged = false
        let count = 0
        const isLastCacheItemPresentInNewList = imdbListItems.find((item) => {
            if (item.Const !== imdbCacheListItems[count]?.Const) {
                hasAnyOldItemsChanged = true
            }
            count += 1

            return item["Const"] === imdbCacheListLastItemId
        })

        // check if list is already in sync
        let tmdbListDetails = await fetchTmdbListDetails(tmdbListId)
        if (tmdbListDetails.total_results == Object.keys(imdbListItems).length && !hasAnyOldItemsChanged && imdbListItems.length === imdbCacheListItems.length) {
            clearLastLine()
            console.log(chalk.green(`Already in sync: ${imdbListName}`))
            continue
        }

        if (imdbListItems.length > imdbCacheListItems.length && imdbListLastItemId !== imdbCacheListLastItemId && isLastCacheItemPresentInNewList?.Const && !hasAnyOldItemsChanged) {
            isTmdbListUpdatable = true
            const tempImdbListItems = []

            // extract updatable items
            let isImdbListLastItemIdFound = false
            for (const imdbListItem of imdbListItems) {
                if (imdbListItem.Const === imdbCacheListLastItemId) {
                    isImdbListLastItemIdFound = true
                }
                if (isImdbListLastItemIdFound) {
                    tempImdbListItems.push(imdbListItem)
                }
            }

            tempImdbListItems.shift()
            imdbListItems = tempImdbListItems
        }
    }

    // clear tmdb list before adding titles
    if (!isNewList && !isTmdbListUpdatable) {
        tmdbListId = await clearTmdbList(tmdbListId)

        if (!tmdbListId) {
            clearLastLine()
            console.error(chalk.red(`Failed to clear TMDB list: ${imdbListName}`))
            continue
        }
    }

    // sort imdb list
    if (!isTmdbListUpdatable) {
        clearLastLine()
        printLine(chalk.yellow(`${isNewList ? "Creating" : "Force Syncing"}: ${imdbListName}`))

        // wait for 5 secs for TMDB to process
        await wait(5000)

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
    }

    // fetch tmdb titles
    const tmdbListItems = await fetchTmdbIdsFromImdbIds(imdbListItems)

    // add titles to tmdb list
    const addTitlesToTmdbListResult = await addTitlesToTmdbList(tmdbListId, tmdbListItems)

    if (addTitlesToTmdbListResult) {
        clearLastLine()
        console.log(chalk.green(`${isNewList ? "Created" : "Synced"}: ${imdbListName}`))
    }

    // copy csv file to cache folder
    copyFile(csvFilePath, csvCacheFilePath)
}

console.log(chalk.green("\nDone!"))
