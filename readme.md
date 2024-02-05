![alt text](image-1.png)

채팅 시 redis 를 이용하여 username 불러오기

기존 redis 없이 매 채팅 시 userInfo를 조회하여 userName을 가져와 data에 data.name으로 넣어줌

처음 redis를 적용해보았지만 key와 value를 저장할 때 string 타입으로 저장해줘야 하기 때문에
매개변수 userId와 userInfo를 조회하여 가져오는 userName을 어떻게 넣어줘야 할 지 고민

우선 매개변수 userId의 경우 Number type 이기 때문에 String(userId),
userName의 경우 user.userName 이기 때문에 Json으로 변환 jSON.stringify(user.userName)

@@.set(String(userId), jSON.stringify(user.userName)) 의 코드로 데이터를 저장해주었고

조회 시 

jSON.parse(@@.get(String(userId)) 의 코드로 데이터를 가져온 뒤 파싱해주었다.

하지만 기존 방식 보다 검사창(F12)으로 확인해보았을 때 응답속도가 더 느려졌다..
이 부분은 더 공부해봐야함
