import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Navigate} from 'react-router-dom';
import {Form, Button, Spinner} from 'react-bootstrap';

import './LoginPage.css';

import {login, selectAuthError, selectIsLoggedIn, selectIsLoading} from '../../reducers/userSlice';

function LoginPage() {
	const dispatch = useDispatch();
	const authError = useSelector(selectAuthError);
	const isLoggedIn = useSelector(selectIsLoggedIn);
	const isLoading = useSelector(selectIsLoading);

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	if (!isLoading && isLoggedIn) return <Navigate to="/" />;

	const submitLogin = e => {
		e.preventDefault();
		setPassword('');
		dispatch(login(username, password));
	};

	return (
		<div className="loginPage">
			{isLoading ? (
				<Spinner animation="grow" />
			) : (
				<Form className="loginForm" onSubmit={submitLogin}>
					<h5 className='text-center mb-4'>Авторизация</h5>
					<hr/>
					<Form.Group className=' mb-2'>
						<Form.Control
							type="text"
							placeholder="Логин"
							value={username}
							onChange={e => setUsername(e.target.value)}
						/>
					</Form.Group>

					<Form.Group className=' mb-2'>
						<Form.Control
							type="password"
							placeholder="Пароль"
							value={password}
							onChange={e => setPassword(e.target.value)}
						/>
					</Form.Group>
					<div className='text-center'>
					<Button type="submit" disabled={!username || !password} className='btn-primary'>
						Войти
					</Button>
					</div>

					<div className="loginMsg">{authError && <p className="formError">{authError}</p>}</div>
				</Form>
			)}
		</div>
	);
}

export default LoginPage;
