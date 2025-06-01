require("dotenv").config();
const http = require("http");
const mainRouter = require("./routes");

const PORT = process.env.PORT;

const server = http.createServer(mainRouter);
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
