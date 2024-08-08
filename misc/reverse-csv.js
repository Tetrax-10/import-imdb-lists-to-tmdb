import fs from "fs"
import path from "path"

import { createFolder, getFileContents } from "../src/utils/glob.js"

// Directory containing the CSV files
const directoryPath = "./cache"

// Function to reverse lines of a CSV file
function reverseCSV(filePath) {
    const data = getFileContents(filePath)

    // Split the file content into lines
    const lines = data.split("\n").filter((line) => line.trim() !== "")
    if (lines.length <= 1) return // If there's only one line, no need to reverse

    // Extract the header and the rest of the lines
    const header = lines[0]
    const rows = lines.slice(1)

    // Reverse the rows
    const reversedRows = rows.reverse()

    // Join the header and the reversed rows back together
    const reversedData = [header, ...reversedRows].join("\n")

    createFolder("./transformed/reversed")

    // Write the reversed data back to the file
    fs.writeFileSync(path.join("./transformed/reversed", path.basename(filePath)), reversedData)
}

// Read all files from the directory and process each CSV file
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error("Error reading directory:", err)
        return
    }

    files.forEach((file) => {
        const filePath = path.join(directoryPath, file)

        // Check if the file is a CSV
        if (path.extname(file) === ".csv") {
            reverseCSV(filePath)
        }
    })
})
