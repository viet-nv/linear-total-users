import fetch from "node-fetch";

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/kybernetwork";
const elasticSubgraphName = "kyberswap-elastic-matic";

async function fetchAllSnapshots() {
  const data = [];
  let page = 1;

  const fetchData = async (page) => {
    return fetch(`${subgraphUrl}/${elasticSubgraphName}`, {
      method: "POST",
      body: JSON.stringify({
        query: `
        query Positions {
  positionSnapshots(
    first: 1000,
    skip: ${(page - 1) * 1000}
    orderBy: timestamp
    orderDirection: asc
    where: {timestamp_gte: 1688664988}
  ) {
    id
    timestamp
    position {
      id
      liquidity
      ownerOriginal
      owner
    }
    transaction {
      id
      to
      mints {
        id
        amountUSD
        amount0
        amount1
        timestamp
      }
      burns {
        id
        amountUSD
        timestamp
        amount0
        amount1
      }
    }
  }
}
          `,
      }),
    });
  };

  console.log("Start fetching all positionSnapshots....");
  while (true) {
    console.log(`Fetching page ${page}`);
    let res = await fetchData(page).then((res) => res.json());
    res?.data?.positionSnapshots?.forEach((item) => {
      // only get day have burn or mint
      if (item.transaction.mints.length || item.transaction.burns.length) {
        data.push(item);
      }
    });

    if (res?.data?.positionSnapshots.length < 1000) {
      break;
    } else {
      page += 1;
    }
  }

  console.log("Finished!!! Total positionSnapshots: ", data.length);

  // group by position
  const snapshotByPos = data.reduce((acc, cur) => {
    const posId = cur.id.split("#")[0];
    if (!acc[posId]) acc[posId] = [];
    acc[posId].push(cur);
    return acc;
  }, {});
  console.log(JSON.stringify(snapshotByPos, null, 2));
}

fetchAllSnapshots();
