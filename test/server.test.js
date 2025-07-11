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