import { DateTime } from "luxon";
import { PrismaClient } from "../generated/prisma";

const now = DateTime.local().setZone("Asia/Jakarta").toUTC()
const localTime = now.toJSDate()
const prisma = new PrismaClient();
const add = await prisma.users.create({
    data: {
        user_email: 'user3@example.com',
        user_password: await Bun.password.hash('rahasia', {
            algorithm: 'bcrypt',
            cost: 6
        }),
        user_created_at: localTime
    }
})

console.info(add)