import axios from "axios";
import { createClient } from "urql";

const GRAPH_APIURL =
  "https://api.thegraph.com/subgraphs/name/plusminushalf/paas-deploy";

export const getDeployedPaymaster = async (address) => {
  const query = `{
    exampleEntities(where: {deployer: "${address}"}) {
      id
      count
      createdContract
      deployer
    }
  }
  `;

  const client = createClient({
    url: GRAPH_APIURL,
  });

  return await client.query(query).toPromise();
};
