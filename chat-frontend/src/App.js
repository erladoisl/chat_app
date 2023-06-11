import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

import { checkStatus, logout, selectIsLoggedIn, selectIsLoading } from './reducers/userSlice';

import LoginPage from './components/LoginPage';

import './App.css';

function App() {
	const dispatch = useCallback(useDispatch(), []);
	useEffect(() => dispatch(checkStatus()), [dispatch]);

	const isLoggedIn = useSelector(selectIsLoggedIn);
	const isLoading = useSelector(selectIsLoading);

	return (
		<>
			{!isLoading && isLoggedIn && (
				<Navbar className='position-relative m-4'>
					<Nav className='position-absolute end-0'>
						<Nav.Link href="#" onClick={() => dispatch(logout())}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<g clip-path="url(#clip0_1_4872)">
									<path d="M15.6356 0.599609H0.599968V23.4002H15.6356V0.599609Z" stroke="black" stroke-width="1.2" stroke-miterlimit="6.2" stroke-linecap="round" stroke-linejoin="round" />
									<path d="M23.3914 12.0004H6.28087" stroke="black" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
									<path d="M6.28086 12.0004L11.3203 16.9312" stroke="black" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
									<path d="M6.28086 12.0004L11.3203 7.06958" stroke="black" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
								</g>
								<defs>
									<clipPath id="clip0_1_4872">
										<rect width="24" height="24" fill="white" />
									</clipPath>
								</defs>
							</svg>
						</Nav.Link>
					</Nav>
				</Navbar>
			)}

			<BrowserRouter>
				<Routes>
					<Route exact path="/login" element={<LoginPage />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
