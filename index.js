// import './log/logtape.log.js'
import { getLogger } from '@logtape/logtape'
import { z } from "zod";
import { login } from './auth/login';
import { jwtVerify } from 'jose';
import "./config/log.conf.js"

const defaultHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*"
};
const secret = new TextEncoder().encode(process.env.JWT_SECRET)
const loginLog = getLogger(['login'])

Bun.serve({
  port: process.env.BUN_PORT,
  routes: {
    "/api/system/status": {
      GET: () => new Response("Server is running", { status: 200, headers: defaultHeaders }),
      OPTIONS: () => new Response(null, { status: 204, headers: defaultHeaders })
    },
    "/api/auth/login": {
      POST: async (req) => {
        const body = await req.json();
        const request = {
          username: body.username,
          password: body.password,
        };

        // Log every login attempt
        loginLog.info(`Login attempt for username ${request.username}`);

        const loginSchema = z.object({
          username: z
            .string()
            .min(1, "Username is required")
            .max(50, "Username must be less than 50 characters")
            .email("Invalid email format"),
          password: z.string().min(1, "Password is required"),
        });

        const validation = loginSchema.safeParse(request);
        if (!validation.success) {
          return new Response(
            JSON.stringify({
              message: "Login failed",
              error: validation.error,
            }),
            { 
              status: 400, 
              headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Credentials": "true",
                  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                  "Access-Control-Allow-Headers": "*"
              } 
            }
          );
        } else {
          try {
            const check = await login(request.username, request.password)

            if (check.token) {
              loginLog.info(`User has been login : ${check.user.user_email}`)
              return new Response(JSON.stringify({ 
                message: 'Login successful',
                token: check.token,
                user_name: check.user.user_name,
                user_fullname: check.user.user_fullname,
                user_id: check.user.user_id 
              }), {
                status: 200,
                headers: defaultHeaders
              });  
            }
          } catch (error) {
            loginLog.error(`Username ${request.username} try to login but invalid credential!`, {code: 401})
            return new Response(JSON.stringify({ message: 'Invalid crendetials' }), {
              status: 401,
              headers: defaultHeaders
            }); 
          }

        }
      },
      OPTIONS: () => new Response(null, { status: 204, headers: defaultHeaders })
    }
  },
  fetch: (req, server) => {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: defaultHeaders });
    }
    return new Response("Not Found", { status: 404, headers: defaultHeaders });
  },
});