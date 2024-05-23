// import { Readable } from "stream"
import { Status, Beatmap } from "./types"

export type Server =
    | "Automatic"
    | "Europe"
    | "US West"
    | "US Central"
    | "US East"
    | "Brazil"
    | "Japan"
    | "Australia"
    | "Custom"

type SearchParams = {
    query?: string
    limit?: number
    offset?: number
    ranked?: number[]
    mode?: number
    sort?: string[]
}

const serverToHosts: Omit<Record<Server, string>, "Custom"> = {
    Automatic: "https://catboy.best",
    Europe: "https://central.catboy.best",
    "US West": "https://us.catboy.best",
    "US Central": "https://usc.catboy.best",
    "US East": "https://use.catboy.best",
    Brazil: "https://br.catboy.best",
    Japan: "https://jp.catboy.best",
    Australia: "https://aus.catboy.best",
}

function errorHandler(status: number) {
    switch (status) {
        case 404:
            return undefined
        default:
            throw new Error("Server responded with " + status)
    }
}

export default class Direct {
    url: string
    v1: v1API
    v2: v2API
    constructor(server: Server, url?: string) {
        this.url = this.getHost(server, url)
        this.v1 = new v1API(this)
        this.v2 = new v2API(this)
    }

    private getHost(server: Server, url?: string) {
        return server == "Custom" ? url || "https://catboy.best" : serverToHosts[server]
    }

    async fetch(url: string, retries = 3): Promise<Response> {
        try {
            return await fetch(`${this.url}${url}`)
        } catch (e) {
            if (--retries > 0) return await this.fetch(url, retries)
            throw e
        }
    }

    async status() {
        const response = await this.fetch(`/api`)
        if (!response.ok) {
            throw new Error("Server responded with " + response.status)
        }
        return (await response.json()) as Status
    }
    async download(id: number | string, novideo: Boolean = true) {
        const response = await this.fetch(`/d/${id}`)
        if (!response.ok) {
            throw new Error("Server responded with " + response.status)
        }
        return response.body
    }
}

class v1API {
    constructor(private base: Direct) {}
    async map() {
    }
}

class v2API {
    constructor(private base: Direct) {}
    async map(id: number) {
        const response = await this.base.fetch(`/api/v2/${id}`)
        if (!response.ok) return errorHandler(response.status)
        return (await response.json()) as Beatmap
    }

    async search({ query, limit, offset, ranked, mode, sort }: SearchParams = {}) {
        const response = await this.base.fetch(`/api/v2/search`)
        if (!response.ok) throw new Error("Server responded with " + response.status)
        return (await response.json()) as Beatmap[]
    }
}

const client = new Direct("Automatic")
