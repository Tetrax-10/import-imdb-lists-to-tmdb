import path from "path"
import fs from "fs"
import chalk from "chalk"

import { createFolder } from "./glob.js"

export async function downloadImdbListCSV(imdbListId) {
    try {
        const response = await fetch(`https://www.imdb.com/list/${imdbListId}/export`)

        if (response.ok) {
            const data = await response.text()

            // get list name
            let filename = `${imdbListId}.csv`
            const contentDisposition = response.headers.get("content-disposition")
            if (contentDisposition && contentDisposition.includes("filename=")) {
                filename = contentDisposition.split("filename=")[1].replace(/"/g, "")
            }

            createFolder("./imdb-csv")
            fs.writeFileSync(path.join("./imdb-csv", filename), data, "utf8")
            return filename
        }

        return false
    } catch (error) {
        console.error(chalk.red(`Failed to download CSV file for imdb list (${imdbListId}): ${error}`))
        return false
    }
}

export function csvToJson(text, quoteChar = '"', delimiter = ",") {
    text = text.trim()
    let rows = text.split("\n")
    let headers = rows[0].split(",")

    const regex = new RegExp(`\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`, "gs")

    const match = (line) => {
        const matches = [...line.matchAll(regex)].map((m) => m[2])
        // Ensure matches length matches headers length by padding with null values
        const paddedMatches = Array.from({ length: headers.length }, (_, i) => matches[i] ?? null)
        return paddedMatches
    }

    let lines = text.split("\n")
    const heads = headers ?? match(lines.shift())
    lines = lines.slice(1)

    return lines.map((line) => {
        return match(line).reduce((acc, cur, i) => {
            // replace blank matches with `null`
            const val = cur === null || cur.length <= 0 ? null : Number(cur) || cur
            const key = heads[i] ?? `{i}`
            return { ...acc, [key]: val }
        }, {})
    })
}

export function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function printLine(message) {
    process.stdout.write(message)
}

export function clearLastLine() {
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)
}
