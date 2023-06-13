import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import traceback
from chat.models import Chat, Message
from datetime import datetime
import logging


class ChatConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def get_chat(self, chat_uuid, user):
        logging.info(f'get_chat {chat_uuid}')

        try:
            return Chat.objects.get(uuid=chat_uuid)
        except:
            logging.error(f'Error while getting chat by id {chat_uuid}')

            raise Chat.DoesNotExist

    @database_sync_to_async
    def create_message(self, text, sender, uuid):
        logging.info(f'create_message "{text}" by s{sender}')

        message = Message.objects.create(text=text, sender=sender,
                                         chat=self.chat, uuid=uuid, created_at=datetime.now())

        return message

    async def connect(self):

        if self.scope['user'].is_anonymous:
            logging.info('Unauthorized connection attempt')

            await self.close()
        else:
            user = self.scope['user']
            chat_uuid = self.scope['url_route']['kwargs'].get('chat_id')

            logging.info(f"connect to {chat_uuid} by {user}")

            try:
                # authenticate user with chat
                self.chat = await self.get_chat(chat_uuid, user)
                self.room_name = f'chat.{chat_uuid}'

                # join channel group
                await self.channel_layer.group_add(self.room_name, self.channel_name)
                await self.accept()
                logging.info(f"Connected to {chat_uuid} by {user} successfuly")
            except Chat.DoesNotExist:
                logging.warning(f'Chat {chat_uuid} does not exist')
                await self.close()  # not a valid chat for this user -> close conn
            except:
                logging.error(traceback.format_exc())

                await self.close()  # not a valid chat for this user -> close conn

    async def disconnect(self, code):
        logging.info(f"Disconnecting from channel")
        # leave channel group if joined
        if hasattr(self, 'room_name') and self.channel_layer is not None:
            await self.channel_layer.group_discard(self.room_name, self.channel_name)
            logging.info(
                f"Disconnected from channel channel_name:{self.channel_name} room_name:{self.room_name} succesfully")

    async def receive(self, text_data):
        sender = self.scope['user']
        payload = json.loads(text_data)
        text = payload.get('text')
        uuid = payload.get('uuid')

        logging.info(f"Receiving message: {text} from {sender}")

        if not text or text.isspace():
            await self.send(json.dumps({
                'type': 'error',
                'data': {'message': 'Please enter a message'}
            }))
        else:
            try:
                # create message then send to channel group
                msg_obj = await self.create_message(text, sender, uuid)

                await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': 'chat_recieved',
                        'text': text,
                        'uuid': str(msg_obj.uuid),
                        'sender': sender,
                        'sender_channel_name': self.channel_name,
                        'created_at': msg_obj.created_at.isoformat()
                    }
                )
                logging.info(
                    f"Message: {text} from {sender} received successfully")

            except Exception as e:
                logging.error(
                    f"Error while receiving message: {text} from {sender} {traceback.format_exc()}")

                await self.send(json.dumps({
                    'type': 'error',
                    'data': {
                        'message': 'There was an error sending your message'
                    }
                }))

    async def chat_recieved(self, event):
        # ignore message if sent to self
        if self.channel_name != event['sender_channel_name']:
            logging.info(
                f"Sending message {event['text']} by {event['sender'].username}")

            await self.send(json.dumps({
                'type': 'chat_message',
                'data': {
                    'text': event['text'],
                    'uuid': event['uuid'],
                    'recieved': True,
                    'sender': event['sender'].username,
                    'created_at': event['created_at']
                }
            }))
