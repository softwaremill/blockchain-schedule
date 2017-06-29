import React from 'react';
import Web3 from './Web3';
import Didle from './Didle';


export default function App() {
  return (
    <div className="app">
      <h1>Sample Ethereum Dapp with Webpack</h1>
      <p>Example</p>

      <hr />
      <Web3 />

      <hr />
      <Didle />

      <hr />
    </div>
  );
}