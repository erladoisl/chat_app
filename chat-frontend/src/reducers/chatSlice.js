import { createSlice } from '@reduxjs/toolkit';

import { instance } from '../globals';

export const chatSlice = createSlice({
	name: ' chat',
	initialState: {
		messages: [],
		loading: false,
		error: null,
		chats: [],
		users: [],
	},
	reducers: {
		loadMessages: (state, action) => {
			state.messages = [...action.payload, ...state.messages];
			state.loading = false;
		},
		loadUsers: (state, action) => {
			state.users = [...action.payload];
		},
		loadMessage: (state, action) => {
			state.messages = [action.payload, ...state.messages];
			state.loading = false;
		},
		clearMessages: state => {
			state.messages = [];
			state.error = null;
		},
		loadChats: (state, action) => {
			state.chats = action.payload;
			state.loading = false;
		},
		filterChat: (state, action) => {
			state.chats = state.chats.filter(chat => chat.uuid !== action.payload);
		},
		setSelectedChat: (state, action) => {
			state.selectedChat = action.payload
			state.loading = false;
		},
		setLoading: (state, action) => {
			state.loading = action.payload;
			state.error = null;
		},
		setError: (state, action) => {
			state.error = action.payload;
			state.loading = false;
		}
	}
});

// ACTIONS
export const {
	loadMessages,
	loadMessage,
	loadUsers,
	clearMessages,
	loadChats,
	setError,
	setSelectedChat,
	setLoading,
	filterChat
} = chatSlice.actions;

// SELECTORS
export const selectMessages = state => state.chat.messages;
export const selectChatLoading = state => state.chat.loading;
export const selectChatError = state => state.chat.error;
export const selectChats = state => state.chat.chats;
export const selectChat = state => state.chat.selectedChat;
export const selectUsers = state => state.chat.users;

export const fetchMessages = chat_uuid => dispatch => {
	dispatch(setLoading(true));
	instance
		.get(`/chat/${chat_uuid}/messages/`)
		.then(res => {
			dispatch(loadMessages(res.data));
		})
		.catch(err => dispatch(setError(err.response.data.detail)));
};

export const getUsers = () => dispatch => {
	instance
		.get(`/auth/users/`)
		.then(res => {
			dispatch(loadUsers(res.data))
		})
		.catch(err => dispatch(setError(err.response.data.detail)));
};

export const getChat = chat_uuid => dispatch => {
	dispatch(setLoading(true));
	instance
		.get(`/chat/${chat_uuid}/`)
		.then(res => {
			dispatch(setSelectedChat(res.data))
		})
		.catch(err => dispatch(setError(err.response.data.detail)));
};


export const getChats = () => dispatch => {
	dispatch(setLoading(true));
	instance
		.get('/chat/')
		.then(res => dispatch(loadChats(res.data)))
		.catch(err => {
			if (err.response) {
				dispatch(setError(err.response.data.detail));
			} else {
				dispatch(setError('Error fetching chats'));
			}
		});
};

export const updateChatParticipants = (chat_uuid, participants) => dispatch => {
	dispatch(setLoading(true));
	instance
		.put(`/chat/${chat_uuid}/`, { participants })
		.then(res => dispatch(setSelectedChat(res.data)))
		.catch(err => {
			if (err.response) {
				dispatch(setError(err.response.data.detail));
			} else {
				dispatch(setError('Error updatinging chats participants'));
			}
		});
};
export const createChat = (name, navigate) => dispatch => {
	dispatch(setLoading(true));
	instance
		.post('/chat/', { name: name })
		.then(res => {
			const chat_uuid = res.data.uuid;
			dispatch(setLoading(false));
			navigate(`/chat/${chat_uuid}/`);
		})
		.catch(err => {
			console.log(err)
			if (err.response.data.users && err.response.data.users.length) {
				dispatch(setError(err.response.data.users[0]));
			} else {
				dispatch(setError('Error creating new chat'));
			}
		});
};

export default chatSlice.reducer;
