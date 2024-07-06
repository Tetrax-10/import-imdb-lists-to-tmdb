import fs from "fs"
import path from "path"
import chalk from "chalk"
import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import "dotenv/config"

import { createFolder, fsDelete } from "./glob.js"
import { wait, clearLastLine } from "./utils.js"

puppeteer.use(StealthPlugin())

export async function downloadImdbListCsv(imdbListId, imdbListName) {
    const tempDownloadFolder = "temp-downloads"
    let browser, page

    // start puppeteer
    try {
        browser = await puppeteer.launch({
            headless: true,
            ignoreDefaultArgs: ["--disable-extensions", "--disable-gpu", "--disable-dev-shm-usage"],
            ...(process.env.CHROME_EXECUTABLE_PATH ? { executablePath: process.env.CHROME_EXECUTABLE_PATH } : {}),
            ...(process.env.CHROME_USER_DATA_PATH ? { userDataDir: process.env.CHROME_USER_DATA_PATH } : {}),
        })
        page = await browser.newPage()
    } catch (error) {
        if (error.message.includes("Failed to launch the browser process!")) {
            console.error(chalk.red("Error: Chrome is already running. Please close it and try again"))
        } else {
            console.error(chalk.red(error))
        }
        process.exit()
    }

    // set download path
    const client = await page.createCDPSession()
    await client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: path.resolve(tempDownloadFolder),
    })

    // chose this page because of less loading time
    await page.goto("https://www.imdb.com/privacy/adpreferences/")

    async function exportList(imdbListId) {
        return await page.evaluate(async (imdbListId) => {
            // send request to imdb
            async function sendRequest(data) {
                const response = await fetch("https://api.graphql.imdb.com/", {
                    credentials: "include",
                    headers: {
                        Accept: "application/graphql+json, application/json",
                        "content-type": "application/json",
                    },
                    referrer: "https://www.imdb.com/",
                    body: JSON.stringify(data),
                    method: "POST",
                    mode: "cors",
                })

                if (!response.ok) {
                    throw new Error(`Request failed with status code ${response.status}`)
                }

                const result = await response.json()
                return result
            }

            // graphql query to start list export
            function getExportedListQuery(imdbListId) {
                return {
                    query: "mutation StartListExport($listId: ID!) {\n  createListExport(input: {listId: $listId}) {\n    status {\n      id\n    }\n  }\n}",
                    operationName: "StartListExport",
                    variables: {
                        listId: imdbListId,
                    },
                }
            }

            // send export request
            const res = await sendRequest(getExportedListQuery(imdbListId))
            // make sure the request was successful
            if (res.data?.createListExport?.status?.id === "PROCESSING") {
                return true
            } else {
                return false
            }
        }, imdbListId)
    }

    async function downloadCSV() {
        // wait 1 second and go to exports page
        await wait(1000)
        await page.goto("https://www.imdb.com/exports/", { waitUntil: "domcontentloaded" })

        const readyButtonSelector = `.ipc-btn.READY[data-testid="export-status-button"]`
        const processingButtonSelector = `.ipc-btn.PROCESSING[data-testid="export-status-button"]`

        // check if list is ready to download
        async function checkIfListIsReady() {
            return await page.evaluate(
                async ([readyButtonSelector, processingButtonSelector]) => {
                    if (document.querySelector(readyButtonSelector) && !document.querySelector(processingButtonSelector)) {
                        return true
                    } else {
                        return false
                    }
                },
                [readyButtonSelector, processingButtonSelector]
            )
        }

        // wait until list is ready to download
        while (!(await checkIfListIsReady())) {
            await wait(1000)
            await page.reload({ waitUntil: "domcontentloaded" })
        }

        // click on ready button (export button)
        return await page.evaluate((readyButtonSelector) => {
            document.querySelector(readyButtonSelector).click()
            return true
        }, readyButtonSelector)
    }

    async function renameCSV(imdbListName) {
        // Get the list of csv files in the temp directory
        const files = fs.readdirSync(`./${tempDownloadFolder}`)
        const csvFiles = files.filter((file) => path.extname(file) === ".csv")

        if (csvFiles.length) {
            const oldFilePath = path.join(`./${tempDownloadFolder}`, csvFiles[0])
            const newFilePath = path.join("./imdb-csv", `${imdbListName}.csv`)

            // Move and rename the file
            createFolder("./imdb-csv")
            fs.renameSync(oldFilePath, newFilePath)
            return `${imdbListName}.csv`
        } else {
            // Wait 1 second and try again
            await wait(1000)
            return await renameCSV(imdbListName)
        }
    }

    async function closeBrowser() {
        // delete temp downloads
        fsDelete(`./${tempDownloadFolder}`)

        // close browser
        await browser.close()
    }

    // export list
    const isListExportedSuccessfully = await exportList(imdbListId)
    if (!isListExportedSuccessfully) {
        clearLastLine()
        console.error(chalk.red("Failed to export list"))
        await closeBrowser()
        return false
    }

    // download csv
    createFolder(`./${tempDownloadFolder}`)
    const isCsvDownloadedSuccessfully = await downloadCSV()
    if (!isCsvDownloadedSuccessfully) {
        clearLastLine()
        console.error(chalk.red("Failed to download csv"))
        await closeBrowser()
        return false
    }

    // rename csv
    const csvFileName = await renameCSV(imdbListName)
    if (!csvFileName) {
        clearLastLine()
        console.error(chalk.red("Failed to rename csv"))
        await closeBrowser()
        return false
    }

    await closeBrowser()

    return csvFileName
}
