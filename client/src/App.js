import React, { useEffect, useState } from 'react'
import useJwt from './utils/useJwt'
function App() {
  const [state, setState] = useState({
    email: '',
    password: ""
  })
  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value
    })
  }
  const login = async () => {
    try {
      const res = await useJwt.login(state);
      console.log(res)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      localStorage.setItem('accessToken', res.data.accessToken)
    } catch (error) {
      console.log(error)
    }
  }
  const testRequest = async () => {
    try {
      const res = await useJwt.test()
      console.log(res)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="App">
      <header className="App-header">
        <input onChange={inputHandle} value={state.email} type='email' name='email' />
        <input onChange={inputHandle} value={state.password} name='password' type='password' />
        <button onClick={login}>Login</button>
        <button onClick={testRequest} >Test</button>
      </header>
    </div>
  );
}

export default App;
