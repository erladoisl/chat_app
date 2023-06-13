import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import traceback
from chat.models import Chat, Message


class ChatConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def get_chat(self, chat_uuid, user):
        print('get_chat')
        try:
            return Chat.objects.get(uuid=chat_uuid)
        except:
            print('error while getting chat by id ', chat_uuid)
            raise Chat.DoesNotExist

    @database_sync_to_async
    def create_message(self, text, sender, uuid):
        print('create_message')
        return Message.objects.create(text=text, sender=sender,
                                      chat=self.chat, uuid=uuid)

    async def connect(self):
        print('connect')
        if self.scope['user'].is_anonymous:
            await self.close()
        else:
            user = self.scope['user']
            chat_uuid = self.scope['url_route']['kwargs'].get('chat_id')

            try:
                # authenticate user with chat
                self.chat = await self.get_chat(chat_uuid, user)
                self.room_name = f'chat.{chat_uuid}'

                # join channel group
                await self.channel_layer.group_add(self.room_name, self.channel_name)
                await self.accept()
            except Chat.DoesNotExist:
                print('chat does not exist')
                await self.close()  # not a valid chat for this user -> close conn
            except:
                print(traceback.format_exc())
                await self.close()  # not a valid chat for this user -> close conn

    async def disconnect(self, code):
        print('disconnect')
        # leave channel group if joined
        if hasattr(self, 'room_name') and self.channel_layer is not None:
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        print('receive')
        sender = self.scope['user']
        payload = json.loads(text_data)
        text = payload.get('text')
        uuid = payload.get('uuid')

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
                    }
                )
            except Exception as e:
                # TODO: log error here
                await self.send(json.dumps({
                    'type': 'error',
                    'data': {
                        'message': 'There was an error sending your message'
                    }
                }))

    async def chat_recieved(self, event):
        print('chat_recieved')
        # ignore message if sent to self
        if self.channel_name != event['sender_channel_name']:
            await self.send(json.dumps({
                'type': 'chat_message',
                'data': {
                    'text': event['text'],
                    'uuid': event['uuid'],
                    'recieved': True,
                    'sender': event['sender'].username
                }
            }))
