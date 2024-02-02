import dotenv from 'dotenv';
import Http from 'node:http';
import { ExpressApp } from './app';
import connector from './db/db.js';
import socket from 'socket.io';
import { mongoDB } from './db/mongdb';
import { createClient } from 'redis';

const mongdb = new mongoDB();

dotenv.config();

export class Server {
  expressApp = new ExpressApp();
  httpServer;
  io;

  constructor() {
    // HTTP 서버를 생성하고, expressApp을 사용하여 요청을 처리하도록 설정
    this.httpServer = new Http.Server(this.expressApp.app);
    this.io = socket(this.httpServer);
  }

  // 서버를 실행하는 메서드입니다.
  runServer = async () => {
    try {
      // 서버를 실행하고 클라이언트의 요청을 수신 대기
      return this.serverListen();
    } catch (e) {
      // 에러가 발생하면 에러 핸들러를 호출
      return this.serverErrorHandler(e);
    }
  };

  // socket 연결
  runSocket = () => {
    // 접속
    this.io.sockets.on('connection', function (socket) {
      socket.on('newUser', function (data) {
        socket.user = data.user;
        socket.trainer = data.trainer;
        socket.roomId = data.roomId;
        socket.join(socket.roomId);
        console.log('test');
      });

      // 전송한 메세지 받기
      socket.on('message', function (data) {
        // 본인에게만 보내기
        socket.emit('message', data);

        // 본인 제외 해당 방에 보내기
        socket.to(socket.roomId).emit('message', data);
      });

      // 접속 종료
      socket.on('disconnect', function () {
        socket.leave(socket.roomId);
      });
    });
  };

  connectRedis = () => {
    //* Redis 연결
    const redisClient = createClient({
      url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
      legacyMode: true, // 반드시 설정 !!
    });
    redisClient.on('connect', () => {
      console.info('Redis connected!');
    });
    redisClient.on('error', err => {
      console.error('Redis Client Error', err);
    });
    redisClient.connect().then(); // redis v4 연결 (비동기)
    const redisCli = redisClient.v4; // 기본 redisClient 객체는 콜백기반인데 v4버젼은 프로미스 기반이라 사용
  };

  // HTTP 서버를 시작하는 메서드
  serverListen = () => {
    // .env 파일에서 PORT와 HOST 환경변수 값을 가져옴
    const { PORT: port, HOST: host } = process.env;
    // HTTP 서버 시작
    return this.httpServer.listen(port, () => {
      console.log(`Server is running on: http://${host}:${port}`);
    });
  };

  // 서버 실행 에러 처리
  serverErrorHandler = error => {
    console.log('Server run error: ', error.message);
  };
}

// Server 클래스의 인스턴스를 생성
const server = new Server();

// 여기서 실행
server.runSocket();
connector.testConnectDB();
connector.connectDB();
mongdb.mongoDBconnect();
server.connectRedis();
server.runServer();
