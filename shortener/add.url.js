import { DateTime } from "luxon";
import { PrismaClient } from "../generated/prisma";
import { customAlphabet } from "nanoid";

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