import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";
import { PrismaClient } from "../generated/prisma";

const SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();

export async function login(email, password) {
  const user = await prisma.users.findFirst({
    where: { 
        user_email: { 
            equals: email 
        }
    },
  });
  
  if ((await bcrypt.compare(password, user.user_password)) != true) {
    throw new Error("Invalid credentials or account not exist!");
  }
  
  const token = jwt.sign({ user_id: user.user_id }, SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  
  return { token, user };
}

export async function register(data) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { ...data, passwordHash },
  });
  return user;
}
