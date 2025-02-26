import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const ConnectButton: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [authResult, setAuthResult] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [questData, setQuestData] = useState<any>(null);
  const [completeQuestData, setCompleteQuestData] = useState<any>(null);
  const [completeQuestResponse, setCompleteQuestResponse] = useState<any>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this app.");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setAuthResult(null);
    setSignature(null);
    setAccessToken(null);
    setQuestData(null);
    setCompleteQuestData(null);
    setCompleteQuestResponse(null);
  };

  useEffect(() => {
    const fetchAuthResult = async () => {
      if (walletAddress) {
        try {
          let response = await fetch(
            `http://localhost:3000/auth/${walletAddress}`
          );
          const data = await response.text();
          setAuthResult(data);

          // Ask MetaMask to sign the message
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const signature = await signer.signMessage(JSON.parse(data).message);
          setSignature(signature);

          // Make a POST request with the signature and wallet address
          response = await fetch("http://localhost:3000/auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address: walletAddress,
              signature: signature,
              nonce: JSON.parse(data).nonce,
            }),
          });
          const postData = await response.json();
          setAccessToken(postData.accessToken);

          // Make a GET request to /quests/1 with the access token
          response = await fetch("http://localhost:3000/quests/1", {
            headers: {
              Authorization: `Bearer ${postData.accessToken}`,
            },
          });
          const questData = await response.json();
          setQuestData(questData);

          // Make a GET request to /quests/complete/1 with the access token
          response = await fetch("http://localhost:3000/quests/complete/1", {
            headers: {
              Authorization: `Bearer ${postData.accessToken}`,
            },
          });
          const completeQuestData = await response.json();
          setCompleteQuestData(completeQuestData);
        } catch (error) {
          console.error("Error fetching auth result or signing message", error);
        }
      }
    };

    fetchAuthResult();
  }, [walletAddress]);

  const completeQuest = async () => {
    if (accessToken) {
      try {
        const response = await fetch("http://localhost:3000/quests/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ id: 1 }),
        });
        const data = await response.json();
        setCompleteQuestResponse(data);
      } catch (error) {
        console.error("Error completing quest", error);
      }
    }
  };

  return (
    <div>
      {walletAddress ? (
        <div>
          <p>Connected: {walletAddress}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
          {authResult && <p>Auth Result: {authResult}</p>}
          {signature && <p>Signature: {signature}</p>}
          {accessToken && <p>Access Token: {accessToken}</p>}
          {questData && (
            <div>
              <h2>Quest Data:</h2>
              <pre>{JSON.stringify(questData, null, 2)}</pre>
            </div>
          )}
          {completeQuestData && (
            <div>
              <h2>Complete Quest Data:</h2>
              <pre>{JSON.stringify(completeQuestData, null, 2)}</pre>
            </div>
          )}
          {completeQuestResponse && (
            <div>
              <h2>Complete Quest Response:</h2>
              <pre>{JSON.stringify(completeQuestResponse, null, 2)}</pre>
            </div>
          )}
          <button onClick={completeQuest}>Complete Quest</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect to MetaMask</button>
      )}
    </div>
  );
};

export default ConnectButton;
