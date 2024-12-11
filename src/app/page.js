"use client"; // Required for client-side rendering in Next.js 13+

import { useState, useEffect } from "react";
import { Button, Card, Container, Row, Col, Form } from "react-bootstrap";
import { ethers } from "ethers"; // Ethers.js (v6) utilities
import { Web3Provider } from "@ethersproject/providers"; // Web3Provider from ethersproject

// Replace these with your actual contract details
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
const NFT_CONTRACT_ADDRESS = "0x524cab2ec69124574082676e6f654a18df49a048";
const ABI = [
  "function claimUSDC(uint256 tokenId) external",
  "function nftClaims(uint256 tokenId) public view returns (bool)",
  "function claimStartTime() public view returns (uint256)",
  "function claimEndTime() public view returns (uint256)",
  "function claimAmountPerNFT() public view returns (uint256)",
  "event Claimed(address indexed nftOwner, uint256 indexed tokenId, uint256 amount)",
];

export default function Home() {
  const [userAddress, setUserAddress] = useState(null);
  const [claimAmount, setClaimAmount] = useState(0);
  const [claimPeriod, setClaimPeriod] = useState({ startTime: 0, endTime: 0 });
  const [nftId, setNftId] = useState("");
  const [isClaimed, setIsClaimed] = useState(false);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);

  useEffect(() => {
    // Initialize Ethers.js provider and contract instances
    const initEthers = async () => {
      const { ethereum } = window;
      if (ethereum) {
        const web3Provider = new Web3Provider(ethereum); // Use Web3Provider from ethersproject
        const signer = web3Provider.getSigner();
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          ABI,
          signer
        );
        const nftContractInstance = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          ["function ownerOf(uint256 tokenId) external view returns (address)"],
          signer
        );
        setProvider(web3Provider);
        setContract(contractInstance);
        setNftContract(nftContractInstance);
      } else {
        alert("Please install MetaMask or another wallet provider.");
      }
    };
    initEthers();
  }, []);

  useEffect(() => {
    const fetchClaimPeriod = async () => {
      if (contract) {
        const startTime = await contract.claimStartTime();
        const endTime = await contract.claimEndTime();
        setClaimPeriod({ startTime, endTime });
        const amount = await contract.claimAmountPerNFT();
        setClaimAmount(utils.formatUnits(amount, 6)); // Use utils from ethers for formatting
      }
    };
    fetchClaimPeriod();
  }, [contract]);

  const handleClaim = async () => {
    if (nftId) {
      try {
        const claimed = await contract.nftClaims(nftId);
        if (claimed) {
          alert("This NFT has already been used for a claim.");
          return;
        }

        const tx = await contract.claimUSDC(nftId);
        await tx.wait();
        alert("Claim Successful!");
      } catch (err) {
        console.error("Claim failed:", err);
        alert("Claim failed.");
      }
    } else {
      alert("Please enter a valid NFT token ID.");
    }
  };

  const handleNFTCheck = async () => {
    if (nftId) {
      try {
        const owner = await nftContract.ownerOf(nftId);
        const userAddr = await provider.getSigner().getAddress();
        if (owner.toLowerCase() === userAddr.toLowerCase()) {
          setIsClaimed(false);
        } else {
          setIsClaimed(true);
        }
      } catch (err) {
        console.error("Error checking NFT ownership:", err);
      }
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col md={6} className="offset-md-3">
          <Card>
            <Card.Body>
              <h2>Claim Your USDC</h2>
              <p>
                Claim Period:{" "}
                {new Date(claimPeriod.startTime * 1000).toLocaleString()} -{" "}
                {new Date(claimPeriod.endTime * 1000).toLocaleString()}
              </p>
              <p>Claim Amount: {claimAmount} USDC per NFT</p>
              <Form.Group>
                <Form.Label>Enter NFT Token ID</Form.Label>
                <Form.Control
                  type="number"
                  value={nftId}
                  onChange={(e) => setNftId(e.target.value)}
                  placeholder="NFT Token ID"
                />
                <Button onClick={handleNFTCheck} className="mt-2">
                  Check Ownership
                </Button>
                {isClaimed && (
                  <p>You dont own this NFT or it has already been used.</p>
                )}
              </Form.Group>
              <Button
                onClick={handleClaim}
                disabled={isClaimed || !nftId}
                className="mt-3"
              >
                Claim USDC
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
