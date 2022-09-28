import apiEndpoint from './jwtConfig'
import api from './api'

export default class jetService {
    allReadyFatchingAccessToken = false
    user = []
    jwtConfig = { ...apiEndpoint }
    constructor() {
        // request
        api.interceptors.request.use(
            config => {
                const accessToken = this.getAccessToken()
                if (accessToken) {
                    config.headers.Authorization = `${this.jwtConfig.tokenType} ${accessToken}`
                }
                return config
            },
            error => Promise.reject(error)
        )

        //response 
        api.interceptors.response.use(
            response => response,
            async (error) => {
                const { config, response } = error
                const originalRequest = config
                if (response && response.status === 401) {
                    console.log('ok')
                    if (!this.allReadyFatchingAccessToken) {
                        this.allReadyFatchingAccessToken = true
                        try {
                            const r = await this.getRefreshToken();
                            this.allReadyFatchingAccessToken = false
                            this.setAccessToken(r.data.accessToken)
                            this.setRefreshToken(r.data.refreshToken)
                            this.onAccessTokenFetched(r.data.accessToken)
                        } catch (e) {
                            this.allReadyFatchingAccessToken = false
                            return e
                        }
                    }
                    const retryOriginalRequest = new Promise(resolve => {
                        this.addSubscriber(accessToken => {
                            originalRequest.headers.Authorization = `${this.jwtConfig.tokenType} ${accessToken}`
                            resolve(api(originalRequest))
                        })
                    })
                    return retryOriginalRequest
                }
                return Promise.reject(error)
            }
        )
    }
    onAccessTokenFetched(accessToken) {
        this.user = this.user.filter(callback => callback(accessToken))
    }
    addSubscriber = (callback) => {
        this.user.push(callback)
    }
    getRefreshToken = () => {
        return api.post(this.jwtConfig.refreshTokenEndPoint, {}, { withCredentials: true })
    }
    getAccessToken = () => {
        return localStorage.getItem(this.jwtConfig.accessTokenKey)
    }
    setAccessToken = (value) => {
        localStorage.setItem(this.jwtConfig.accessTokenKey, value)
    }
    setRefreshToken = (value) => {
        localStorage.setItem(this.jwtConfig.refressTokenKey, value)
    }
    login = (data) => {
        return api.post(this.jwtConfig.login, data, { withCredentials: true })
    }
    test = () => {
        return api.post('/test-request', {}, { withCredentials: true })
    }
}