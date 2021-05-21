import React, { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import Web3 from 'web3';

// const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
const contractAddress = '0xEC5E1795eb01eb44d4960c4cF02c25B36a4Ab6eB';
// prettier-ignore
const abi = [ { inputs: [], stateMutability: 'nonpayable', type: 'constructor' }, { anonymous: false, inputs: [ { indexed: false, internalType: 'uint256', name: 'id', type: 'uint256' }, { indexed: false, internalType: 'string', name: 'content', type: 'string' }, { indexed: false, internalType: 'bool', name: 'completed', type: 'bool' } ], name: 'TaskCreated', type: 'event' }, { inputs: [], name: 'taskCount', outputs: [ { internalType: 'uint256', name: '', type: 'uint256' } ], stateMutability: 'view', type: 'function', constant: true }, { inputs: [ { internalType: 'uint256', name: '', type: 'uint256' } ], name: 'tasks', outputs: [ { internalType: 'uint256', name: 'id', type: 'uint256' }, { internalType: 'string', name: 'content', type: 'string' }, { internalType: 'bool', name: 'completed', type: 'bool' } ], stateMutability: 'view', type: 'function', constant: true }, { inputs: [], name: 'getTaskCount', outputs: [ { internalType: 'uint256', name: '', type: 'uint256' } ], stateMutability: 'view', type: 'function', constant: true }, { inputs: [ { internalType: 'string', name: '_content', type: 'string' } ], name: 'createTask', outputs: [], stateMutability: 'nonpayable', type: 'function' }, { inputs: [ { internalType: 'uint256', name: '_taskId', type: 'uint256' }, { internalType: 'bool', name: '_completed', type: 'bool' } ], name: 'completeTask', outputs: [], stateMutability: 'nonpayable', type: 'function' } ];

let contract;
let web3;

export default function Home() {
	const [account, setAccount] = useState(null);
	const [taskCount, setTaskCount] = useState(0);
	const [tasks, setTasks] = useState([]);

	const ethEnabled = async () => {
		if (!ethereum) {
			console.log('Enable MetaMask');
		}
		const accounts = await ethereum.request({
			method: 'eth_requestAccounts'
		});
		setAccount(accounts[0]);
		web3 = new Web3(Web3.givenProvider);
		contract = new web3.eth.Contract(abi, contractAddress);

		contract.methods.taskCount().call().then(setTaskCount);

		// Loops through tasks to save to state and render to page.
		// for (let i = 1; i < taskCount; i++) {
		// 	contract.methods
		// 		.tasks(i)
		// 		.call()
		// 		.then(task =>
		// 			setTasks(prev => {
		// 				console.log(prev);
		// 				prev.push(task);
		// 				console.log(tasks);
		// 			})
		// 		)
		// 		.catch(console.log);
		// }
	};

	async function getTasks() {
		for (let i = 1; i < taskCount; i++) {
			const result = await contract.methods.tasks(i).call();
			setTasks(prev => [...prev, result]);
		}
	}

	async function createTask(e) {
		if (e.key === 'Enter') {
			const result = await contract.methods
				.createTask(e.target.value)
				.send({ from: account });
			getTasks();
		}
	}

	async function completeTask({ target }) {
		if (target.checked) {
			const result = await contract.methods
				.completeTask(target.name, true)
				.send({ from: account });
			console.log(result);
		}
	}

	return (
		<>
			<button onClick={ethEnabled}>Connect to MetaMask</button>
			<button onClick={getTasks}>Get Tasks</button>
			{tasks.map(todo => {
				const { id, content, completed } = todo;
				return (
					<div key={id}>
						<p>Todo ID: {id}</p>
						<p>{content}</p>
						<input type="checkbox" name={id} onClick={completeTask} />
					</div>
				);
			})}

			<input type="text" onKeyPress={e => createTask(e)} />
			<p>{taskCount}</p>
		</>
	);
}
