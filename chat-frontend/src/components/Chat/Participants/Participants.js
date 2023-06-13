import Select from 'react-select'
import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    getUsers,
    selectUsers,
    updateChatParticipants,
} from '../../../reducers/chatSlice';
const Participants = ((props) => {
    const users = useSelector(selectUsers);
    const [participants, set_participants] = useState(props.participants) 
    const dispatch = useCallback(useDispatch(), []);
    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

    const update_participants = () => {
        dispatch(updateChatParticipants(props.chat_uuid, participants))
    }

    return (
        <Select
            closeMenuOnSelect={false}
            defaultValue={participants}
            isMulti
            onChange={((event) => { set_participants(event) })}
            onBlur={(() => { update_participants() })}
            options={users}>
        </Select>
    )
})

export default Participants