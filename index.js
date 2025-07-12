// import './log/logtape.log.js'
import { getLogger } from '@logtape/logtape'
import { Schema, z } from "zod";
import { login } from './auth/login';
import { jwtVerify } from 'jose';
import "./config/log.conf.js"
import { addUrl, deleteUrl, getOriginalUrl, getUrl } from './shortener/url.js';

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
            return new Response(JSON.stringify({ status: 401, message: 'Invalid crendetials' }), {
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
          appLog.info(`Value for both token and url doesn't exist`, { code: 400 })
          return new Response(
            JSON.stringify({
              status: 400,
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
          return new Response(JSON.stringify({ status: 400, message: "URL must start with http/https/www" }), { status: 400, headers: defaultHeaders });
        }

        if (!payload) {
          appLog.error(`JWT Token error or expired`, { status: 401 })
          return new Response(JSON.stringify({ status: 401, message: `JWT Token error or expired`}, { status: 401, headers: defaultHeaders }))
        }

        appLog.info(`JWT Token ${request.token} valid with secret`, { status: 200 })
        const add = await addUrl(payload, request.url)
        
        if (!add) {
          appLog.error(`Failed to shorten url`, { status: 404 })
          return new Response(JSON.stringify({ status: 404, message: `Failed to shorten url` }), { status: 500, headers: defaultHeaders })
        }
        const newUrl = process.env.APP_URL+add.url_short_id
        appLog.info(`Success to shorten URL, new URL : ${newUrl}`, { status: 200 })
        return new Response(JSON.stringify({ status: 200, message: `Success shorten URL`, url: newUrl }), { status: 200, headers: defaultHeaders })

      },
      OPTIONS: () => new Response(null, { status: 204, headers: defaultHeaders })
    },
    "/api/get/url": {
      POST: async (req) => {
        const request = {
          token: req.headers.get("Authorization").split(" ")[1]
        }

        if (!request.token) {
          appLog.info(`Value for both token and url doesn't exist`, { code: 400 })
          return new Response(
            JSON.stringify({
              status: 400,
              message: "Token not supplied",
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

        if (!payload) {
          appLog.error(`JWT Token error or expired`, { status: 401 })
          return new Response(JSON.stringify({ status: 401, message: `JWT Token error or expired`}, { status: 401, headers: defaultHeaders }))
        }

        appLog.info(`JWT Token ${request.token} valid with secret`, { status: 200 })
        const get = await getUrl(payload)
        
        if (!get) {
          appLog.error(`Failed to shorten url`, { status: 404 })
          return new Response(JSON.stringify({ status: 404, message: `Failed to get all shorten url` }), { status: 404, headers: defaultHeaders })
        }

        const newUrl = get
        appLog.info(`Success to get all shorten URL, total : ${newUrl.length}`, { status: 200 })
        return new Response(JSON.stringify({ status: 200, message: `Success to get all shorten URL`, url: newUrl }), { status: 200, headers: defaultHeaders })

      },
      OPTIONS: () => new Response(null, { status: 204, headers: defaultHeaders })
    },
    "/api/delete/url": {
      POST: async (req) => {
        const body = await req.json();
        const token = req.headers.get("Authorization").split(" ")[1]
        const request = {
          url_id: body.url_id
        }

        if (!token || !request.url_id) {
          appLog.info(`Value for both token and url doesn't exist`, { code: 400 })
          return new Response(
            JSON.stringify({
              status: 400,
              message: "Token and url data not supplied"
            }),
            { 
              status: 400, 
              headers: defaultHeaders
            }
          );
        }

        appLog.info(`JWT Token trapped from the client`, { code: 200 })
        const { payload } = await jwtVerify(token, secret)

        const urlIdValidation = z.object({
          url_id: z.string().length(36, { message: "Must be exactly 36 characters long!" }).uuid({ message: "Invalid UUID" })
        });

        const validation = urlIdValidation.safeParse(request)

        if (!validation.success) {
          appLog.error(`URL UUID invalid`)
          return new Response(JSON.stringify({ status: 411, message: validation.error.issues[0].message }, { status: 411, headers: defaultHeaders }))
        }

        if (!payload) {
          appLog.error(`JWT Token error or expired`, { status: 401 })
          return new Response(JSON.stringify({ status: 401, message: `JWT Token error or expired`}, { status: 401, headers: defaultHeaders }))
        }

        appLog.info(`JWT Token ${token} valid with secret`, { status: 200 })
        const remove = await deleteUrl(request.url_id)
        
        if (remove.error) {
          appLog.error(`Failed to remove URL: ${remove.error.code} ${remove.error.message}`, { status: 404 })
          return new Response(JSON.stringify({ status: 404, message: remove.error.message }), { status: 404, headers: defaultHeaders })
        }
        
        appLog.info(`Success to remove URL`, { status: 200 })
        return new Response(JSON.stringify({ status: 200, message: `Success remove URL`, url_id: remove.url_id}), { status: 200, headers: defaultHeaders })

      },
      OPTIONS: () => new Response(null, { status: 204, headers: defaultHeaders })
    },
    "/s/:slug": async req => {
      const body = {
        slug: req.params.slug,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown"
      }

      const slugValidation = z.object({
        slug: z.string().max(7, "Slug length exceed")
      })

      const validation = slugValidation.safeParse(body)

      if (!validation) {
        appLog.error(`Invalid slug combination`)
        return new Response(JSON.stringify({ status: 400, message: validation.error }), { status: 400, headers: defaultHeaders })
      }

      const get = await getOriginalUrl(body.slug, body.ip, body.userAgent)
      
      if (get.error) {
        appLog.error(`Failed to get original URL: ${get.error.code} ${get.error.message}`)
        return new Response(JSON.stringify({ status: 404, message: get.error.message }), { status: 404, headers: defaultHeaders })
      }

      appLog.info(`Success to get original URL, redirecting to ${get}`, { status: 200 })
      return Response.redirect(get, 302)
    },
    "/docs" : req => {
      return new Response(Bun.file("./docs/swagger.html"), { headers: defaultHeaders })
    },
    "/docs/openapi.json" : req => {
      return new Response(Bun.file("./docs/openapi.json"), { headers: defaultHeaders })
    }
  },
  fetch: (req, server) => {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: defaultHeaders });
    }
    return new Response("Not Found", { status: 404, headers: defaultHeaders });
  },
});