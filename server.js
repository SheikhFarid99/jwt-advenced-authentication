const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
dotenv.config({
    path: './config.env'
})

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
const port = process.env.PORT

app.post('/api/login', async (req, res) => {
    const user = {
        email: 'farid@gmail.com',
        password: '1234',
        name: 'Sheikh farid'
    }
    const { email, password } = req.body;

    if (email === user.email && password === user.password) {
        const accessToken = await jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1m'
        })

        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({ refreshToken, accessToken })

    } else {
        return res.status(406).json({
            message: 'Invalid credentials'
        });
    }
})

app.post('/test-request', async (req, res) => {
    const { authorization } = req.headers;
    if (authorization !== undefined) {
        const accessToken = authorization.split('Bearer ')[1]
        try {
            const user = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
            return res.status(200).json({ user })
        } catch (error) {
            console.log('exprire access token')
            return res.status(401).json({ error: 'Unauthorizedss' })
        }
    } else {
        return res.status(401).json({ error: 'Unauthorized' })
    }
})
app.post('/refresh-token', async (req, res) => {
    const user = {
        email: 'farid@gmail.com',
        password: '1234',
        name: 'Sheikh farid'
    }
    const { refreshToken } = req.cookies;
    if (refreshToken !== undefined) {
        try {
            const userData = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            // data get database / email = userData.email
            const accessToken = await jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1m'
            })

            const refreshTokenGenerat = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
            res.cookie('refreshToken', refreshTokenGenerat, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            });
            res.status(200).json({ refreshToken: refreshTokenGenerat, accessToken })
        } catch (error) {
            return res.status(404).json({ error: 'exprire refress token login please' })
        }
    } else {
        return res.status(404).json({ error: 'refresh token not found , login please' })
    }
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))