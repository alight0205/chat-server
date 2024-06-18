const Koa = require("koa");
const app = new Koa();
const server = require("http").createServer(app.callback());
const io = require("socket.io")(server, { cors: true });
const cors = require("@koa/cors");
const static = require("koa-static");
let loginUsers = new Array(10);
let loginIds = new Array(10);

//获取用户信息
function getUserInfo(id) {
  const index = loginIds.indexOf(id);
  if (index !== -1) {
    return loginUsers[index];
  }
  return {};
}
//获取一个空位置
function getEmptyIndex() {
  for (let i = 0; i < loginIds.length; i++) {
    if (!loginIds[i]) return i;
  }
}
//添加用户
function addUserInfo(id) {
  const emptyIndex = getEmptyIndex();
  loginIds[emptyIndex] = id;
  loginUsers[emptyIndex] = {
    id: id,
    name: `神秘人${emptyIndex + 1}号`,
    avatar: `/${emptyIndex % 10}.webp`,
  };
}
//删除用户
async function removeUserInfo(id) {
  const index = loginIds.indexOf(id);
  if (index !== -1) {
    loginUsers[index] = null;
    loginIds[index] = null;
  }
}
// 监视客户端与服务器的连接
io.on("connection", (socket) => {
  addUserInfo(socket.id);
  console.log("有一个客户端连接上了服务器", socket.id);

  // 监听接收客户端发送的消息
  socket.on("sendMsg", function (data) {
    // 处理数据
    data.info = getUserInfo(data.id);
    // 服务器向客户端发送消息
    // 发送所有连接上服务器的客户端
    io.emit("receiveMsg", data);
  });

  //监听断开连接
  socket.on("disconnect", (data) => {
    removeUserInfo(socket.id);
    console.log("断开了连接", socket.id);
    console.log(loginUsers);
  });
});

//设置跨越
app.use(
  cors({
    origin: "*", // 允许 所有的都可以跨域
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"],
    maxAge: 50000,
    credentials: true,
    allowMethods: ["GET", "POST", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

//设置静态文件目录
app.use(static("./avatar"));

server.listen(3031, () => {
  console.log("server is running on port 3031");
});
