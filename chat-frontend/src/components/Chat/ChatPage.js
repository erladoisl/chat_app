import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Spinner, ListGroup } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';

import { API_HOST } from '../../globals';
import { selectUser, selectIsLoading } from '../../reducers/userSlice';
import {
	selectMessages,
	fetchMessages,
	loadMessage,
	selectChatLoading,
	selectChatError,
	getChat,
	selectChat,
	setError
} from '../../reducers/chatSlice';

function ChatPage() {
	const dispatch = useCallback(useDispatch(), []);
	const { chatUuid } = useParams();

	const user = useSelector(selectUser);
	const userLoading = useSelector(selectIsLoading);

	const messages = useSelector(selectMessages);
	const chatLoading = useSelector(selectChatLoading);
	const chatError = useSelector(selectChatError);
	const selectedChat = useSelector(selectChat);

	const ws = useRef(null);
	const [newMsg, setNewMsg] = useState('');

	useEffect(() => {
		try {
			ws.current = new WebSocket(`ws://${API_HOST}/ws/chat/${chatUuid}/`);
			ws.current.onopen = e => console.log('Chat socket opened');
			ws.current.onerror = e => dispatch(setError('Web socket error!'));
			ws.current.onmessage = e => {
				const msg = JSON.parse(e.data);

				if (msg.type === 'error') dispatch(setError(msg.data.text));
				else if (msg.type === 'chat_message') dispatch(loadMessage(msg.data));
			};
		} catch (e) {
			console.log(e.stack);
		}

		// load previous chat messages
		dispatch(fetchMessages(chatUuid));
		dispatch(getChat(chatUuid))
		return () => ws.current.close();
	}, [chatUuid, dispatch]);

	if (userLoading || !ws.current) return <Spinner animation="grow" />;
	if (!user) return <Navigate rect to="/login" />;

	const sendNewMsg = e => {
		e.preventDefault();

		// check if newMsg is valid
		if (newMsg && newMsg.replace(/\s+/g, '') !== '') {
			const messageData = { uuid: uuid(), message: newMsg, text: newMsg, recieved: false, sender: user.username };
			ws.current.send(JSON.stringify(messageData));
			dispatch(loadMessage(messageData));
			setNewMsg('');
		}
	};

	// submit form when enter pressed in text area
	const onKeyDown = e => {
		if (e.keyCode === 13 && e.shiftKey === false && newMsg) sendNewMsg(e);
	};

	return (
		<div className="container">
			<div className="row">
				<Card className="col col-8 m-auto p-0">
					<ListGroup variant="flush">
						<ListGroup.Item>
							{selectedChat && (
								<div className='row'>
									<div className='text-center col'>
										<div>
											{selectedChat.name}
										</div>
										<a title='Посмотреть всех участников' className="link-secondary" href={`/chat/participants/${selectedChat.uuid}`}>
											{selectedChat.users.length} {'участник' + (selectedChat.users.length === 1 ? '' : [2, 3, 4].includes(selectedChat.users.length) ? 'a' : 'ов')}
										</a>
									</div>
									<div className='col col-1 p-3'>
										<a href={`/`} title='Назад'>
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<g clipPath="url(#clip0_1_4872)">
													<path d="M15.6356 0.599609H0.599968V23.4002H15.6356V0.599609Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="6.2" strokeLinecap="round" strokeLinejoin="round" />
													<path d="M23.3914 12.0004H6.28087" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
													<path d="M6.28086 12.0004L11.3203 16.9312" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
													<path d="M6.28086 12.0004L11.3203 7.06958" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
												</g>
												<defs>
													<clipPath id="clip0_1_4872">
														<rect width="24" height="24" fill="white" />
													</clipPath>
												</defs>
											</svg>
										</a>
									</div>
								</div>
							)}
						</ListGroup.Item>
					</ListGroup>
					<div variant="flush " className='container' style={{ height: '500px', display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-start', overflowY: 'scroll' }}>
						<div className="row flex-column-reverse" style={{ width: '100%' }}>
							{messages.map((message) => (
								<div className={`m-2 col-auto rounded ${message.sender === user.username ? 'bg-primary align-self-end text-light' : 'ms-4 align-self-start bg-light'}`}>
									<div className='row'>
										<div className='col'>
											{message.sender !== user.username && <div className='row px-2 fw-bold fs-6'>
												{message.sender}
											</div>
											}
											<div className='row px-2 fs-5'>
												{message.text}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					<ListGroup className='border-radius-0'>
						<Form onSubmit={sendNewMsg}>
							<div className='container'>
								<div className='row'>
									<div className='col-11'>
										<Form.Group>
											<Form.Control
												as="input"
												rows="3"
												style={{ resize: 'none' }}
												value={newMsg}
												placeholder='Сообщение...'
												className='border-0'
												onKeyDown={onKeyDown}
												onChange={e => setNewMsg(e.target.value)}
											/>
										</Form.Group>
									</div>
									<div className='col-1'>
										<Button type="submit" className='btn btn-link'>
											<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
												<g clipPath="url(#clip0_1_3574)">
													<path fillRule="evenodd" clipRule="evenodd" d="M1.59168 2.71245L2.38083 7.25004H7.25001C7.66422 7.25004 8.00001 7.58582 8.00001 8.00004C8.00001 8.41425 7.66422 8.75004 7.25001 8.75004H2.38083L1.59168 13.2876L13.9294 8.00004L1.59168 2.71245ZM0.988747 8.00004L0.0636748 2.68087C-0.0111098 2.25086 0.128032 1.81135 0.436661 1.50272C0.824446 1.11494 1.40926 1.00231 1.91333 1.21834L15.3157 6.9622C15.7308 7.14013 16 7.54835 16 8.00004C16 8.45172 15.7308 8.85995 15.3157 9.03788L1.91333 14.7817C1.40926 14.9978 0.824446 14.8851 0.436661 14.4974C0.128032 14.1887 -0.01111 13.7492 0.0636748 13.3192L0.988747 8.00004Z" fill="#8E8E93" />
												</g>
												<defs>
													<clipPath id="clip0_1_3574">
														<rect width="16" height="16" fill="white" />
													</clipPath>
												</defs>
											</svg>
										</Button>
									</div>
								</div>
							</div>
						</Form>
					</ListGroup>

				</Card>
				{chatError && (
					<p className="mt-3" style={{ color: 'red' }}>
						{chatError}
					</p>
				)}
			</div>
		</div>
	);
}

export default ChatPage;
