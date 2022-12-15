// pages/api/logout.ts

import { withSessionRoute } from "../../lib/withSession";
export default withSessionRoute(logoutRoute);

  async function logoutRoute(req, res) {
    await req.session.destroy();
    
    return res.send({ ok: true });
  }
  