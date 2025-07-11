import {describe, expect, test, toBe} from 'bun:test'

describe('Web API Status', () => {
    test(`should running in port ${process.env.BUN_PORT}`, async () => {
        const response = await fetch(`http://${process.env.BUN_HOST}:${process.env.BUN_PORT}/api/system/status`)
        expect(response.status).toBe(200)
        expect(await response.text()).toBe('Server is running')
    })
})

describe('Web API Login Validation', () => {
    test(`should validation and login success`, async () => {
        const response = await fetch(`http://${process.env.BUN_HOST}:${process.env.BUN_PORT}/api/auth/login`,{
            method: 'POST',
            body: JSON.stringify({
                username: 'anggaprasetya@example.com',
                password: 'rahasia'
            })
        })
        
        expect(response.status).toBe(200)
        expect(await response.json()).toContainValue('Login successful')
    })
})

describe('Adding URL to be shorted', () => {
    test(`should url inserted and JWT validation success`, async () => {
        const response = await fetch(`http://${process.env.BUN_HOST}:${process.env.BUN_PORT}/api/add/url`,{
            method: 'POST',
            headers: {
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYzcxYWE5NDYtZDZjNS00NTc0LTgzN2QtNWI5MGE0N2NhYjU4IiwiaWF0IjoxNzUyMjQwNDQzLCJleHAiOjE3NTIzMjY4NDN9.DsKvV5cmd1v-xtXPIOSQ8PpuHfttinIBDU4RISoT_CI"
            },
            body: JSON.stringify({
                url: 'https://music.youtube.com/watch?v=5XzDXuhFr2s&list=RDAMVMIE9a8B4r4iY'
            })
        })
        
        expect(response.status).toBe(200)
        expect(await response.json()).toContainValue('Successfull shorten URL')
    })
})