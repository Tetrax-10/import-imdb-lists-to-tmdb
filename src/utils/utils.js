export function csvToJson(text, quoteChar = '"', delimiter = ",") {
    text = text.trim()
    let rows = text.split("\n")

    // Trim headers to remove any whitespace or carriage return characters
    let headers = rows[0].split(delimiter).map((header) => header.trim())

    const regex = new RegExp(`\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`, "gs")

    const match = (line) => {
        const matches = [...line.matchAll(regex)].map((m) => m[2])
        const paddedMatches = Array.from({ length: headers.length }, (_, i) => matches[i] ?? null)
        return paddedMatches
    }

    let lines = text.split("\n").slice(1)

    return lines.map((line) => {
        return match(line).reduce((acc, cur, i) => {
            const val = cur === null || cur.length <= 0 ? null : Number(cur) || cur
            const key = headers[i] ?? `{i}`
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
