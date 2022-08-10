const http = require("http");
const app = require("./server");
const server = http.createServer(app);

server.listen(4000, () => {
  console.log(
    `Server Listening on port 4000  in ${process.env.NODE_ENV} mode `
  );
});

// app.get("/paymaster-config/:id", (req, res) => {
//   const message = "No error";
//   res.json({
//     data: {},
//     success: true,
//     message,
//   });
// });
