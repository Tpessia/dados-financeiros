import axios from 'axios';

export const HttpService = axios.create({ timeout: 60000 });

// import { SocksProxyAgent } from 'socks-proxy-agent';
// const socksAgent = new SocksProxyAgent('socks5h://localhost:9050');
// export const HttpProxyService = axios.create({
//     timeout: 60000,
//     httpAgent: socksAgent,
//     httpsAgent: socksAgent,
// });