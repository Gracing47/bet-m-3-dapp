import React, { useState } from 'react';
import { Card } from '@/components/common';
import { Container } from '@/components/ui';

// FAQ item type
type FAQItem = {
  question: string;
  answer: string;
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs: FAQItem[] = [
    {
      question: "What is BETM3?",
      answer: "BETM3 is a decentralized betting platform built on the Celo blockchain. It allows users to create and participate in peer-to-peer bets without intermediaries, using smart contracts to ensure transparency and trustless execution."
    },
    {
      question: "How do I place a bet?",
      answer: "To place a bet, you need to connect your wallet first. Then navigate to the Betting page, where you can either create a new bet or join an existing one. Creating a bet requires specifying the condition, duration, and amount. Joining requires selecting a bet and your prediction (Yes/No)."
    },
    {
      question: "What cryptocurrencies can I use?",
      answer: "Currently, BETM3 supports cUSD (Celo Dollars) for all betting activities. We plan to add support for more Celo-based tokens in the future."
    },
    {
      question: "How are bet outcomes determined?",
      answer: "Bet outcomes are determined based on the specified condition and submitted by the creator or authorized participants once the condition's outcome is publicly verifiable. The outcome is then recorded on the blockchain and winnings are automatically distributed."
    },
    {
      question: "Is there a fee for using BETM3?",
      answer: "BETM3 doesn't charge any platform fees. You only pay the minimal gas fees required for executing transactions on the Celo blockchain, which are typically much lower than on other blockchains."
    },
    {
      question: "What if someone disputes a bet outcome?",
      answer: "If there's a dispute about a bet outcome, participants can use our resolution panel. For certain bets, we use oracle services or a consensus-based approach to ensure fair outcomes."
    },
    {
      question: "Can I cancel a bet after creating it?",
      answer: "You can cancel a bet only if no one has joined it yet. Once another user has staked funds on your bet, it cannot be canceled and must proceed to resolution."
    },
    {
      question: "Is my betting history private?",
      answer: "While your wallet address is linked to your bets on the blockchain (which is public by nature), personal identification information is not stored or required. Only users with your wallet address can connect your identity to your betting activity."
    },
    {
      question: "What happens if a bet condition cannot be verified?",
      answer: "In rare cases where a condition becomes impossible to verify (e.g., an event is canceled), the bet can be marked as 'invalid' and all participants receive their staked amounts back."
    },
    {
      question: "Are smart contracts secure?",
      answer: "Our smart contracts are developed following best practices and undergo thorough auditing before deployment. However, as with any blockchain application, there are inherent risks. We recommend users only bet amounts they are comfortable with."
    }
  ];

  return (
    <Container maxWidth="full" className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about the BETM3 betting platform.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 focus:outline-none flex justify-between items-center"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-lg">{faq.question}</span>
                <svg
                  className={`w-5 h-5 transform ${openIndex === index ? 'rotate-180' : ''} transition-transform duration-200`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
          <p className="mb-4">
            If you couldn't find the answer to your question, feel free to reach out to us.
          </p>
          <button 
            onClick={() => window.location.href = 'mailto:support@betm3.com'}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </Container>
  );
} 