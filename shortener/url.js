import { DateTime } from "luxon";
import { PrismaClient } from "../generated/prisma";
import { customAlphabet } from "nanoid";
import { PrismaClientKnownRequestError } from "../generated/prisma/runtime/library";

const prisma = new PrismaClient()
const now = DateTime.local().setZone("Asia/Jakarta").toUTC()
const localTime = now.toJSDate()
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 5)

export async function addUrl(payload, url) { // payload from validating JWT Token, URL that will be inserted to database
    const slug = nanoid()
    const check = await checkSlug(slug)

    if (check == 'NG') {
        return await addUrl(payload, url)
    }

    const add = prisma.short_url.create({
        data: {
            url_short_id: nanoid(),
            url_original: url.trim(),
            url_user_id: payload.user_id,
            url_created_at: localTime
        }
    })
    
    return add
}

export async function getUrl(payload) {
    const get = await prisma.short_url.findMany({
        where: {
            url_user_id: {
                equals: payload.user_id
            }
        }
    })

    const allData = get.map(item => ({
        ...item,
        url_short_id: process.env.APP_URL + item.url_short_id
    }))
    return allData
}

export async function deleteUrl(url_id) {
    try {
        const remove = await prisma.short_url.delete({
            where: {
                url_id: url_id
            }
        })

        return remove
    } catch (err) {
        
        if (err instanceof PrismaClientKnownRequestError) {
            switch (err.code) {
                case 'P2025':
                    return { error: { code: err.code, message: "URL id not found" } }
                    break;
            
                default:
                    return { error: { code: err.code, message: "Query failed" } }
                    break;
            }
        }
    }
}

export async function getOriginalUrl(slug, ipaddr, userAgent) {
    try {
        const getOriginal = await prisma.short_url.findFirst({
            where: {
                url_short_id: {
                    equals: slug
                }
            }
        })

        if (!getOriginal) {
            return { error: { code: 'P2025', message: "URL not found" } }
        }

        const addClick = await clickUrl(getOriginal.url_id, ipaddr, userAgent)

        if (!addClick.click_id) {
            return { error: { code: err.code, message: "URL click cannot be inserted" } }
        }
        
        return getOriginal.url_original
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            switch (err.code) {
                case 'P42025':
                    return { error: { code: err.code, message: "URL not found" } }
                    break;
            
                default:
                    return { error: { code: err.code, message: "Query failed" } }
                    break;
            }
        }
    }
}

async function clickUrl(url_id, ipaddr, userAgent) {
    const click = await prisma.click.create({
        data: {
            click_short_url_id: url_id,
            click_timestamp: localTime,
            click_ip_address: ipaddr,
            click_user_agent: userAgent
        }
    })

    return click
}

async function checkSlug(slug){
    const check = await prisma.short_url.findMany({
        where: {
            url_short_id: {
                equals: slug
            }
        }
    })

    if (check.length > 0) {
        return "NG"
    }

    return "OK"
}