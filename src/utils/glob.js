import fs from "fs"
import prettier from "prettier"

const prettierConfig = getJsonContents("./.prettierrc.json")

function fsExsists(paths) {
    if (typeof paths === "object") {
        const availablePaths = []
        for (const _path of paths) {
            if (fs.existsSync(_path)) availablePaths.push(_path)
        }
        return availablePaths
    }
    return fs.existsSync(paths)
}

export function createFolder(folderPath) {
    if (!fsExsists(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
    }
}

export function getFileContents(filePath) {
    return fs.readFileSync(filePath, "utf-8")
}

export function getJsonContents(filePath) {
    try {
        return JSON.parse(getFileContents(filePath))
    } catch (err) {
        return null
    }
}

function formatContent(content, type, options = {}) {
    return prettier.format(content, {
        ...prettierConfig,
        ...options,
        parser: type,
        printWidth: 10,
    })
}

function formatJson(object, options = {}) {
    return formatContent(JSON.stringify(object), "json", options)
}

export async function writeJSON(filePath, object) {
    fs.writeFileSync(filePath, await formatJson(object))
}
