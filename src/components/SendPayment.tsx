// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Fragment, useEffect, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useAccount, useContractWrite } from '@web3modal/react';
import { periodDuration, yieldStrategy } from '../utils/index';
import CapazEscrowFactory from '../contracts/CapazEscrowFactory.json';
import SimpleERC20 from '../contracts/SimpleERC20.json';
import useConfig from '../hooks/useConfig';
import SvgLoader from './svgLoader';
import { ethers } from 'ethers';

export default function SendPayment() {
  const config = useConfig();

  const { account, isReady } = useAccount();
  const [query, setQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [amount, setAmount] = useState(100);
  const [period, setPeriod] = useState(0);
  const [selectedYieldPlatform, setSelectedYieldPlatform] = useState(yieldStrategy[1]);
  const [selectedSelector, setSelectedSelector] = useState(periodDuration[5]);
  const [approveTxHasLoaded, setApproveTxHasLoaded] = useState(false);
  const [executeTxHasLoaded, setExecuteTxHasLoaded] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState(
    '0x0000000000000000000000000000000000000000',
  );
  const [openModal1, setOpenModal1] = useState(true);
  const stylesModal1 = {
    popup: {
      display: openModal1 ? 'block' : 'none',
    },
  };
  const [openModal2, setOpenModal2] = useState(false);
  const stylesModal2 = {
    popup: {
      display: openModal2 ? 'block' : 'none',
    },
  };

  const getAmountFromEthInWei = ethAmount =>
    ethers.utils.parseUnits(String(ethAmount), selectedToken?.decimals).toString();

  // APPROVE
  const approveTx = useContractWrite({
    address: selectedToken?.address,
    abi: SimpleERC20.abi,
    functionName: 'approve',
    args: [config?.escrowFactoryAddress, getAmountFromEthInWei(amount)],
    enabled: !!config && selectedToken,
  });

  // EXECUTE
  const executeTx = useContractWrite({
    address: config?.escrowFactoryAddress,
    abi: CapazEscrowFactory.abi,
    functionName: 'mint',
    args: [
      {
        sender: `${isReady ? account.address : null}`,
        receiver: receiverAddress,
        tokenAddress: selectedToken?.address,
        totalAmount: getAmountFromEthInWei(amount),
        startTime: getTimestampInSeconds(),
        periodDuration: selectedSelector.value,
        periods: period,
        yieldStrategyId: selectedYieldPlatform.id,
        escrowAddress: '0x0000000000000000000000000000000000000000',
      },
    ],
    enabled: !!config && selectedToken,
  });

  function getTimestampInSeconds() {
    return Math.floor(Date.now() / 1000) + 120;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (approveTxHasLoaded !== true) {
      onApprove().then(() => {
        setApproveTxHasLoaded(true);
        setOpenModal1(true);
      });
    } else {
      onPayment().then(() => {
        setExecuteTxHasLoaded(true);
        setOpenModal1(false);
        setOpenModal2(true);
      });
    }
  }

  async function onApprove() {
    await approveTx.write();
  }

  async function onPayment() {
    await executeTx.write();
  }

  useEffect(() => {
    setSelectedToken(null);
  }, [config?.networkId]);

  return (
    <main>
      {/* Main dashboard's table */}
      <div className='py-6 w-full'>
        <div className='mx-auto xl:w-8/12 px-4 sm:px-6 md:px-8'>
          <h1 className='text-2xl font-semibold text-gray-900'>Send Payment</h1>
        </div>
        <div className='mx-auto xl:w-8/12 px-4 sm:px-6 md:px-8'>
          <form onSubmit={e => handleSubmit(e)} className='py-4'>
            <div>
              {/* Receiver wallet */}
              <input
                required
                id='receiverAddress'
                type='text'
                className='focus:outline-none border-b w-full pb-2 border-sky-400 placeholder-gray-500'
                placeholder='Receiver wallet address'
                onChange={event => setReceiverAddress(event.target.value)}
              />
            </div>
            <div className='flex'>
              {/* Token selection */}
              <div className='my-8 w-72 mr-8'>
                <Combobox value={selectedToken} onChange={setSelectedToken}>
                  <div className='relative mt-1'>
                    <div className='relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm'>
                      <Combobox.Input
                        className='w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0'
                        displayValue={token => (token ? token.name : 'Select token')}
                        onChange={event => setQuery(event.target.value)}
                      />
                      <Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>
                        <ChevronUpDownIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave='transition ease-in duration-100'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                      afterLeave={() => setQuery('')}>
                      <Combobox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                        {config?.tokens.length === 0 && query !== '' ? (
                          <div className='relative cursor-default select-none py-2 px-4 text-gray-700'>
                            Nothing found.
                          </div>
                        ) : (
                          config?.tokens.map(token => (
                            <Combobox.Option
                              key={token}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-teal-600 text-white' : 'text-gray-900'
                                }`
                              }
                              value={token}>
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}>
                                    {token?.name}
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-teal-600'
                                      }`}>
                                      <CheckIcon className='h-5 w-5' aria-hidden='true' />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
              </div>
              {/* Amount */}
              <input
                id='amount'
                type='number'
                required
                className='focus:outline-none border-b w-full pb-2 border-sky-400 placeholder-gray-500 my-8'
                placeholder='Amount'
                onChange={event => {
                  setAmount(event.target.value);
                }}
              />
            </div>
            <div className='flex'>
              {/* Period */}
              <input
                type='number'
                required
                className='focus:outline-none border-b w-full pb-2 border-sky-400 placeholder-gray-500 my-8 mr-8'
                placeholder='Payed in X times'
                onChange={event => setPeriod(event.target.value)}
              />
              {/* Period selector */}
              <div className='my-8 w-72 mr-8'>
                <Combobox value={selectedSelector} onChange={setSelectedSelector}>
                  <div className='relative mt-1'>
                    <div className='relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm'>
                      <Combobox.Input
                        required
                        className='w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0'
                        displayValue={selectedSelector => selectedSelector.name}
                        onChange={event => {
                          setQuery(event.target.value);
                        }}
                      />
                      <Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>
                        <ChevronUpDownIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave='transition ease-in duration-100'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                      afterLeave={() => setQuery('')}>
                      <Combobox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                        {periodDuration.length === 0 && query !== '' ? (
                          <div className='relative cursor-default select-none py-2 px-4 text-gray-700'>
                            Nothing found.
                          </div>
                        ) : (
                          periodDuration.map(periodDuration => (
                            <Combobox.Option
                              key={periodDuration.id}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-teal-600 text-white' : 'text-gray-900'
                                }`
                              }
                              value={periodDuration}>
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}>
                                    {periodDuration.name}
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-teal-600'
                                      }`}>
                                      <CheckIcon className='h-5 w-5' aria-hidden='true' />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
              </div>
            </div>
            <div className='flex'>
              {/* Yield selector */}
              <div className='my-8 w-72 mr-8'>
                <Combobox value={selectedYieldPlatform.name} onChange={setSelectedYieldPlatform}>
                  <div className='relative mt-1'>
                    <div className='relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm'>
                      <Combobox.Input
                        className='w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0'
                        displayValue={() => selectedYieldPlatform.name}
                        onChange={event => {
                          setQuery(event.target.value);
                        }}
                      />
                      <Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>
                        <ChevronUpDownIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave='transition ease-in duration-100'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                      afterLeave={() => setQuery('')}>
                      <Combobox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                        {yieldStrategy.length === 0 && query !== '' ? (
                          <div className='relative cursor-default select-none py-2 px-4 text-gray-700'>
                            Nothing found.
                          </div>
                        ) : (
                          yieldStrategy.map(yieldStrategy => (
                            <Combobox.Option
                              key={yieldStrategy.id}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-teal-600 text-white' : 'text-gray-900'
                                }`
                              }
                              value={yieldStrategy}>
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}>
                                    {yieldStrategy.name}
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-teal-600'
                                      }`}>
                                      <CheckIcon className='h-5 w-5' aria-hidden='true' />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
              </div>
              <div className='my-8'>
                {`${selectedYieldPlatform.apy} % APY | Estimated gain : ${Number(
                  amount * 1.05 - amount,
                ).toFixed(2)} $`}
              </div>
            </div>

            {/* Buttons */}
            <div className='flex justify-center my-6 flex-col align-center mx-auto'>
              {approveTxHasLoaded !== true ? (
                <button
                  type='submit'
                  className='rounded-full text-center flex align-center justify-center  p-3 w-full sm:w-56   bg-gradient-to-r from-sky-600  to-teal-300 text-white text-lg font-semibold'>
                  <span>Approve Payment</span>
                  {approveTx.isLoading && (
                    <div className='loader'>
                      <SvgLoader />
                    </div>
                  )}
                </button>
              ) : (
                <button
                  type='submit'
                  className='rounded-full text-center flex align-center justify-center  p-3 w-full sm:w-56   bg-gradient-to-r from-sky-600  to-teal-300 text-white text-lg font-semibold'>
                  <span>Send Payment</span>
                  {executeTx.isLoading ? (
                    <div className='loader'>
                      <SvgLoader />
                    </div>
                  ) : null}
                </button>
              )}
              {/* display errors */}
              {approveTx.error && (
                <div className='text-red-500 text-sm font-semibold text-center'>
                  {approveTx.error.message.split(' (')[0]}
                </div>
              )}
              {executeTx.error && (
                <div className='text-red-500 text-sm font-semibold text-center'>
                  {executeTx.error.message.split(' (')[0]}
                </div>
              )}
            </div>
          </form>
          {/* display info message */}
          <div className='z-50 fixed left-0 bottom-0 p-4' style={stylesModal1.popup}>
            <div className='max-w-xs p-4 bg-gray-500 rounded-lg shadow'>
              <div className='flex w-full h-full items-center justify-between'>
                <div className='pr-6'>
                  <span className='text-sm leading-5 text-gray-200 font-semibold'>
                    You confirmed the transaction, you need to execute it by clicking on "Send
                    Payment".
                  </span>
                </div>
                <button
                  className='inline-block text-gray-400 hover:text-gray-300'
                  onClick={() => {
                    setOpenModal1(false);
                  }}>
                  <svg width='10' height='10' viewBox='0 0 10 10' fill='none'>
                    <path
                      d='M5.93996 5.00001L8.80663 2.14001C8.93216 2.01448 9.00269 1.84421 9.00269 1.66668C9.00269 1.48914 8.93216 1.31888 8.80663 1.19335C8.68109 1.06781 8.51083 0.997284 8.33329 0.997284C8.15576 0.997284 7.9855 1.06781 7.85996 1.19335L4.99996 4.06001L2.13996 1.19335C2.01442 1.06781 1.84416 0.997284 1.66663 0.997284C1.48909 0.997284 1.31883 1.06781 1.19329 1.19335C1.06776 1.31888 0.997231 1.48914 0.997231 1.66668C0.997231 1.84421 1.06776 2.01448 1.19329 2.14001L4.05996 5.00001L1.19329 7.86001C1.13081 7.92199 1.08121 7.99572 1.04737 8.07696C1.01352 8.1582 0.996094 8.24534 0.996094 8.33334C0.996094 8.42135 1.01352 8.50849 1.04737 8.58973C1.08121 8.67097 1.13081 8.7447 1.19329 8.80668C1.25527 8.86916 1.329 8.91876 1.41024 8.95261C1.49148 8.98645 1.57862 9.00388 1.66663 9.00388C1.75463 9.00388 1.84177 8.98645 1.92301 8.95261C2.00425 8.91876 2.07798 8.86916 2.13996 8.80668L4.99996 5.94001L7.85996 8.80668C7.92194 8.86916 7.99567 8.91876 8.07691 8.95261C8.15815 8.98645 8.24529 9.00388 8.33329 9.00388C8.4213 9.00388 8.50844 8.98645 8.58968 8.95261C8.67092 8.91876 8.74465 8.86916 8.80663 8.80668C8.86911 8.7447 8.91871 8.67097 8.95255 8.58973C8.9864 8.50849 9.00383 8.42135 9.00383 8.33334C9.00383 8.24534 8.9864 8.1582 8.95255 8.07696C8.91871 7.99572 8.86911 7.92199 8.80663 7.86001L5.93996 5.00001Z'
                      fill='currentColor'></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* display success message */}
          <div className='z-50 fixed left-0 bottom-0 p-4' style={stylesModal2.popup}>
            <div className='max-w-xs p-4 bg-gray-500 rounded-lg shadow'>
              <div className='flex w-full h-full items-center justify-between'>
                <div className='pr-6'>
                  <span className='text-sm leading-5 text-gray-200 font-semibold'>
                    Bravo ! Your transaction is confirmed
                  </span>
                </div>
                <button
                  className='inline-block text-gray-400 hover:text-gray-300'
                  onClick={() => {
                    setOpenModal2(false);
                  }}>
                  <svg width='10' height='10' viewBox='0 0 10 10' fill='none'>
                    <path
                      d='M5.93996 5.00001L8.80663 2.14001C8.93216 2.01448 9.00269 1.84421 9.00269 1.66668C9.00269 1.48914 8.93216 1.31888 8.80663 1.19335C8.68109 1.06781 8.51083 0.997284 8.33329 0.997284C8.15576 0.997284 7.9855 1.06781 7.85996 1.19335L4.99996 4.06001L2.13996 1.19335C2.01442 1.06781 1.84416 0.997284 1.66663 0.997284C1.48909 0.997284 1.31883 1.06781 1.19329 1.19335C1.06776 1.31888 0.997231 1.48914 0.997231 1.66668C0.997231 1.84421 1.06776 2.01448 1.19329 2.14001L4.05996 5.00001L1.19329 7.86001C1.13081 7.92199 1.08121 7.99572 1.04737 8.07696C1.01352 8.1582 0.996094 8.24534 0.996094 8.33334C0.996094 8.42135 1.01352 8.50849 1.04737 8.58973C1.08121 8.67097 1.13081 8.7447 1.19329 8.80668C1.25527 8.86916 1.329 8.91876 1.41024 8.95261C1.49148 8.98645 1.57862 9.00388 1.66663 9.00388C1.75463 9.00388 1.84177 8.98645 1.92301 8.95261C2.00425 8.91876 2.07798 8.86916 2.13996 8.80668L4.99996 5.94001L7.85996 8.80668C7.92194 8.86916 7.99567 8.91876 8.07691 8.95261C8.15815 8.98645 8.24529 9.00388 8.33329 9.00388C8.4213 9.00388 8.50844 8.98645 8.58968 8.95261C8.67092 8.91876 8.74465 8.86916 8.80663 8.80668C8.86911 8.7447 8.91871 8.67097 8.95255 8.58973C8.9864 8.50849 9.00383 8.42135 9.00383 8.33334C9.00383 8.24534 8.9864 8.1582 8.95255 8.07696C8.91871 7.99572 8.86911 7.92199 8.80663 7.86001L5.93996 5.00001Z'
                      fill='currentColor'></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
