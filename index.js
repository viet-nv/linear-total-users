import fetch from "node-fetch";

const subgraphUrl =
  "https://thegraph.goerli.zkevm.consensys.net/subgraphs/name/kybernetwork";
const elasticSubgraphName = "kyberswap-elastic-linea";
const aggregatorSubgraphName = "kyberswap-aggregator-linea";

async function fetchAllSwapUsers() {
  const data = {};
  let page = 1;

  const fetchData = async (page) => {
    return fetch(`${subgraphUrl}/${aggregatorSubgraphName}`, {
      method: "POST",
      body: JSON.stringify({
        query: `
          {
            routerSwappeds(first: 1000, skip: ${(page - 1) * 1000}) {
              userAddress
            }
          }`,
      }),
    });
  };

  console.log("Start fetching all aggregator user addresses....");
  while (true) {
    console.log(`Fetching page ${page}`);
    let res = await fetchData(page).then((res) => res.json());
    res?.data?.routerSwappeds?.forEach((item) => {
      data[item.userAddress] = 1;
    });

    if (res?.data?.routerSwappeds.length < 1000) {
      break;
    } else {
      page += 1;
    }
  }

  console.log("Finished!!! Total swap users: ", Object.keys(data).length);
}

async function fetchAllProtocolUsers() {
  const data = {};
  let page = 1;

  const fetchData = async (page) => {
    return fetch(`${subgraphUrl}/${elasticSubgraphName}`, {
      method: "POST",
      body: JSON.stringify({
        query: `
          {
            mints(first: 1000, skip: ${(page - 1) * 1000}) {
              origin
            }
          }`,
      }),
    });
  };

  console.log("Start fetching all protocol users....");
  while (true) {
    console.log(`Fetching page ${page}`);
    let res = await fetchData(page).then((res) => res.json());
    res?.data?.mints?.forEach((item) => {
      data[item.origin] = 1;
    });

    if (res?.data?.mints.length < 1000) {
      break;
    } else {
      page += 1;
    }
  }

  console.log("Finished!!! Total protocol users: ", Object.keys(data).length);
}

fetchAllSwapUsers();
fetchAllProtocolUsers();
