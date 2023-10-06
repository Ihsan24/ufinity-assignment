async function handler(req, res) {
  const { query, method } = req;
  const { id, type } = query;

  switch (method) {
    case "GET":
      //get a single thread details
      try {
        const result = await fetch(`https://api.data.gov.sg/v1/transport/traffic-images?date_time="2023-01-01T09:00:00"`);
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: error });
      }

    default:
      // res.setHeader("Allow", ["GET", "POST"]);
      // res.status(405).end(`Method ${method} Not Allowed`);
      return;
  }
}

export default handler;
