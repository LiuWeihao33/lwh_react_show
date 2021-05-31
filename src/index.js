import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { SnackbarProvider } from 'notistack';
import Album from './Test';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
      <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
          }}
      >
        <Album title={"多重语音自然语言理解机"}/>
      </SnackbarProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
