async function handler(req, res) {
  const { query, method } = req;
  const { id, type } = query;

//   switch (method) {
//     case "GET":
//       //get a single thread details
//       try {
//         const result = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`);
//         res.status(200).json(result);
//       } catch (error) {
//         res.status(500).json({ error: error });
//       }

//     default:
//       // res.setHeader("Allow", ["GET", "POST"]);
//       // res.status(405).end(`Method ${method} Not Allowed`);
//       return;
//   }
}

export default handler;
