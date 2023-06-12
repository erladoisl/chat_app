import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { Spinner, Card, Button, Form } from 'react-bootstrap';

import {
	getChats,
	selectChats,
	selectChatLoading,
	createChat,
	selectChatError,
} from '../../reducers/chatSlice';
import { selectIsLoggedIn, selectIsLoading } from '../../reducers/userSlice';

import './MainPage.css';

function HomePage() {
	const dispatch = useCallback(useDispatch(), []);
	const chats = useSelector(selectChats);
	const isLoading = useSelector(selectChatLoading);
	const error = useSelector(selectChatError);
	const isAuthLoading = useSelector(selectIsLoading);
	const isLoggedIn = useSelector(selectIsLoggedIn);
	const [name, setName] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		dispatch(getChats());
	}, [dispatch]);

	if (!isLoggedIn) return <Navigate to="/login" />;

	const changeName = e => {
		setName(e.target.value);
	};

	const submitCreateChat = e => {
		e.preventDefault();
		dispatch(createChat(name, navigate));
	};

	return (
		<div className="HomePage">
			{isLoading || isAuthLoading ? (
				<Spinner animation="grow" />
			) : (
				<Card>
					<Card.Header className='bg-white text-center'>
						<span className='fs-3'>Выберите / создайте чат</span>
					</Card.Header>

					{chats.map(chat => (
						<div className='container m-1' key={chat.uuid}>
							<div className='row'>
								<div className='col'>
									<a href={`/chat/${chat.uuid}`}>
										<div className='container  bg-primary rounded'>
											<div className='row '>
												<span className=' col text-white fs-6 fw-normal p-1 p-2'>
													{chat.name}
												</span>

												<div className='col-md-auto p-2'>

													<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
														<path d="M0.75 12C0.75 9.77497 1.4098 7.59989 2.64597 5.74984C3.88213 3.89979 5.63914 2.45785 7.69481 1.60636C9.75048 0.754875 12.0125 0.532087 14.1948 0.966171C16.3771 1.40025 18.3816 2.47171 19.955 4.04505C21.5283 5.61839 22.5998 7.62295 23.0338 9.80524C23.4679 11.9875 23.2451 14.2495 22.3936 16.3052C21.5422 18.3609 20.1002 20.1179 18.2502 21.354C16.4001 22.5902 14.225 23.25 12 23.25C9.01631 23.25 6.15483 22.0647 4.04505 19.955C1.93526 17.8452 0.75 14.9837 0.75 12ZM21.75 12C21.75 10.0716 21.1782 8.18657 20.1068 6.5832C19.0355 4.97982 17.5127 3.73013 15.7312 2.99218C13.9496 2.25423 11.9892 2.06114 10.0979 2.43735C8.20655 2.81355 6.46927 3.74215 5.10571 5.10571C3.74215 6.46928 2.81355 8.20656 2.43734 10.0979C2.06114 11.9892 2.25422 13.9496 2.99217 15.7312C3.73013 17.5127 4.97981 19.0355 6.58319 20.1068C8.18657 21.1782 10.0716 21.75 12 21.75C14.5859 21.75 17.0658 20.7228 18.8943 18.8943C20.7228 17.0658 21.75 14.5859 21.75 12Z" fill="#F4F4F4" />
														<path d="M10.0975 16.1926L14.2825 12.0001L10.0975 7.80758C9.9578 7.66705 9.87939 7.47697 9.87939 7.27883C9.87939 7.08069 9.9578 6.8906 10.0975 6.75008C10.238 6.61039 10.4281 6.53198 10.6262 6.53198C10.8244 6.53198 11.0145 6.61039 11.155 6.75008L15.925 11.5201C16.0514 11.6479 16.1223 11.8203 16.1223 12.0001C16.1223 12.1798 16.0514 12.3523 15.925 12.4801L11.155 17.2501C11.0145 17.3898 10.8244 17.4682 10.6262 17.4682C10.4281 17.4682 10.238 17.3898 10.0975 17.2501C9.9578 17.1096 9.87939 16.9195 9.87939 16.7213C9.87939 16.5232 9.9578 16.3331 10.0975 16.1926Z" fill="#F4F4F4" />
													</svg>
												</div>
											</div>
										</div>
									</a>
								</div>
							</div>
						</div>
					))}

					<Form onSubmit={submitCreateChat}>
						<div className='container m-1 mb-2'>
							<div className='row'>
								<div className='col'>

									<Form.Control
										className=""
										placeholder="Введите название чата"
										list="name"
										value={name}
										onChange={changeName}
										required={true}
									/>
								</div>

								<div className='col-md-auto'>

									<Button
										type="submit"
										className=""
										disabled={!name && name.replace(/\s+/g, '') === ''}>
										Создать
									</Button>
								</div>

							</div>
						</div>
					</Form>
				</Card>
			)}
			{error && <p style={{ color: 'red' }}>{error}</p>}
		</div>
	);
}

export default HomePage;
