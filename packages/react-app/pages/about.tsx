import React from 'react';
import { Card } from '@/components/common';
import { Container } from '@/components/ui';

export default function AboutPage() {
  return (
    <Container maxWidth="full" className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">About BETM3</h1>
          <p className="text-lg text-gray-600">
            The next generation decentralized betting platform on the Celo blockchain.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">What is BETM3?</h2>
          <Card className="p-6">
            <p className="mb-4">
              BETM3 is a decentralized betting platform built on the Celo blockchain that allows users to create 
              and participate in peer-to-peer bets without intermediaries. Our platform leverages smart contracts 
              to ensure transparent, secure, and trustless betting experiences.
            </p>
            <p>
              Unlike traditional betting platforms, BETM3 doesn't take any commission from your winnings. 
              All bets are executed directly on the blockchain, ensuring complete transparency and preventing 
              any possible manipulation.
            </p>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">1</span>
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2 text-center">Create a Bet</h3>
              <p className="text-gray-600">
                Define your bet's terms, stake amount, and outcome conditions. Your bet is recorded on the blockchain.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">2</span>
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2 text-center">Join a Bet</h3>
              <p className="text-gray-600">
                Browse available bets and choose which ones to join with your prediction and stake amount.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">3</span>
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2 text-center">Resolve & Collect</h3>
              <p className="text-gray-600">
                When the bet condition is met, the outcome is submitted and verified. Winners automatically receive their winnings.
              </p>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Why Choose BETM3?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-medium mb-3">Fully Decentralized</h3>
              <p className="text-gray-600">
                No central authority controls your bets or funds. All bets execute through smart contracts, eliminating 
                the need to trust a third party with your money.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-medium mb-3">Low Fees</h3>
              <p className="text-gray-600">
                Operating on the Celo blockchain means minimal gas fees and no platform commission, maximizing your potential returns.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-medium mb-3">Transparent & Fair</h3>
              <p className="text-gray-600">
                All bet terms, stakes, and outcomes are recorded on the blockchain and publicly verifiable, ensuring complete fairness.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-medium mb-3">Bet on Anything</h3>
              <p className="text-gray-600">
                Create bets around virtually any real-world outcome or event. If it can be verified, it can be bet on.
              </p>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Technical Details</h2>
          <Card className="p-6">
            <p className="mb-4">
              BETM3 is built on the Celo blockchain, a mobile-first platform focused on making financial 
              tools accessible to anyone with a mobile phone. Our smart contracts are written in Solidity 
              and audited for security.
            </p>
            <p>
              We use a factory pattern for deploying betting contracts, ensuring scalability and flexibility 
              in the types of bets that can be created. All interactions with our platform are conducted through 
              your web3 wallet, giving you complete control over your funds at all times.
            </p>
          </Card>
        </section>
      </div>
    </Container>
  );
} 