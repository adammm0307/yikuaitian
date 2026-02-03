import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// 如果你有 index.css 文件，请保留下面这行；如果没有，可以先注释掉
// import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
