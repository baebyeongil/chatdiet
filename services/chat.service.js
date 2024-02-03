import { ChatRepository } from '../repositories';
import { ContractRepository } from '../repositories';
import { UserRepository } from '../repositories';
import { server } from '../init';

class ChatService {
  _chatRepository = new ChatRepository();
  _contractRepository = new ContractRepository();
  _userRepository = new UserRepository();

  postChat = async (data, userId) => {
    try {
      await server.redis.set('test', 'user1');
      const rd = await server.redis.get('test');
      // const user = await this._userRepository.getOneUserInfo(userId);
      data.name = rd;
      // data.name = user.userName;

      await this._chatRepository.postChat(data);

      return {
        status: 200,
        message: data.name,
      };
    } catch (err) {
      console.log(err);
      return { status: 500, message: 'Server Error' };
    }
  };

  findChat = async roomId => {
    try {
      if (!roomId) {
        return {
          status: 400,
          message: '채팅방 ID 미입력',
        };
      }
      const result = await this._chatRepository.findChat(roomId);
      return {
        status: 200,
        message: result,
      };
    } catch (err) {
      return { status: 500, message: 'Server Error' };
    }
  };
}
export default ChatService;
