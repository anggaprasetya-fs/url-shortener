// import './log/logtape.log.js'
import { getLogger } from '@logtape/logtape'
import { z } from "zod";
import { login } from './auth/login';
import { jwtVerify } from 'jose';
import "./config/log.conf.js"
import { addUrl } from './shortener/add.url.js';

const defaultHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*"
};
const secret = new TextEncoder().encode(process.env.JWT_SECRET)
const loginLog = getLogger(['login'])
const appLog = getLogger(['app'])

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
              loginLog.info(`User has been login : ${check.user.user_email}, JWT : ${check.token}`)
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
    },
    "/api/add/url": {
      POST: async (req) => {
        const body = await req.json();
        const request = {
          token: req.headers.get("Authorization").split(" ")[1],
          url: body.url
        }

        if (!request.token || !request.url) {
          appLog.info(`Value for both token and url doesn't exist`, { code: 500 })
          return new Response(
            JSON.stringify({
              message: "Token and url data not supplied",
              error: validation.error,
            }),
            { 
              status: 500, 
              headers: defaultHeaders
            }
          );
        }

        appLog.info(`JWT Token trapped from the client`, { code: 200 })
        const { payload } = await jwtVerify(request.token, secret)
        
        if (!request.url.startsWith("http://") && !request.url.startsWith("https://") && !request.url.startsWith("www.")) {
          appLog.error(`URL not start with http/https/www`, { status: 400 })
          return new Response("URL must start with http/https/www", { status: 400, headers: defaultHeaders });
        }

        if (!payload) {
          appLog.error(`JWT Token error or expired`, { status: 401 })
          return new Response(JSON.stringify({ message: `JWT Token error or expired`}, { status: 401, headers: defaultHeaders }))
        }

        appLog.info(`JWT Token ${request.token} valid with secret`, { status: 200 })
        const add = await addUrl(payload, request.url)
        
        if (!add) {
          appLog.error(`Failed to shorten url`, { status: 500 })
          return new Response(JSON.stringify({ message: `Failed to shorten url` }), { status: 500, headers: defaultHeaders })
        }
        const newUrl = process.env.APP_URL+add.url_short_id
        appLog.info(`Success to shorten URL, new URL : ${newUrl}`, { status: 200 })
        return new Response(JSON.stringify({ message: `Successfull shorten URL`, url: newUrl }), { status: 200, headers: defaultHeaders })

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