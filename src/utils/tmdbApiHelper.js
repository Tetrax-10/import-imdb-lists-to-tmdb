import chalk from "chalk"
import "dotenv/config"

const apiKey = process.env.API_KEY
const authToken = process.env.AUTH_TOKEN

async function fetchTmdbDataFromImdbId(imdbId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`)
        return response.json()
    } catch (err) {
        console.error(chalk.red(`Error while fetching TMDB data from IMDB ID: ${imdbId}`))
    }
}

export async function fetchTmdbIdsFromImdbIds(imdbListItems) {
    const validResponseTypes = ["movie_results", "tv_results"]
    const tmdbIds = []

    for (const { Const: imdbId, Title: imdbTitle } of imdbListItems) {
        const response = await fetchTmdbDataFromImdbId(imdbId)

        let responseType, tmdbData

        // checks if we got valid response
        for (const type of validResponseTypes) {
            if (response[type].length) {
                responseType = type
                break
            }
        }

        if (responseType) {
            tmdbData = response[responseType][0]
        } else {
            console.error(chalk.red(`Title unavailable in TMDB: ${imdbId} ${imdbTitle}`))
            continue
        }

        const type = tmdbData["media_type"] === "movie" ? "movie" : "tv"

        tmdbIds.push({ media_type: type, media_id: tmdbData.id })
    }

    return tmdbIds
}

export async function fetchTmdbListDetails(tmdbListId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/4/list/${tmdbListId}`, {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })

        const data = await response.json()

        if (data.id) {
            return data
        } else {
            return false
        }
    } catch (error) {
        console.error(chalk.red(`Failed to fetch TMDB list details (${tmdbListId}): ${error}`))
        return false
    }
}

export async function creteTmdbList(name) {
    try {
        const response = await fetch("https://api.themoviedb.org/4/list", {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name: name, iso_639_1: "en" }),
        })

        const data = await response.json()

        if (data.status_code == 1 && data.success == true) {
            return data.id
        } else {
            return false
        }
    } catch (error) {
        console.error(chalk.red(`Failed to create TMDB list: ${error}`))
        return false
    }
}

export async function clearTmdbList(tmdbListId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/4/list/${tmdbListId}/clear`, {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        })

        const data = await response.json()

        if (data.status_code == 1 && data.success == true) {
            return data.id
        } else {
            return false
        }
    } catch (error) {
        console.error(chalk.red(`Can't clear TMDB list (${tmdbListId}): ${error}`))
        return false
    }
}

export async function addTitlesToTmdbList(tmdbListId, tmdbIds) {
    try {
        const response = await fetch(`https://api.themoviedb.org/4/list/${tmdbListId}/items`, {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ items: tmdbIds }),
        })

        const data = await response.json()

        if (data.status_code == 1 && data.success == true) {
            return true
        } else {
            return false
        }
    } catch (error) {
        console.error(chalk.red(`Failed to add titles to TMDB list (${tmdbListId}): ${error}`))
        return false
    }
}
