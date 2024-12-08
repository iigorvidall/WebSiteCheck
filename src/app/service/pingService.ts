// import axios from 'axios';

// export const pingSite = async (url: string) => {
//   const start = Date.now();
//   try {
//     // Adicionando o User-Agent para simular uma requisição de navegador
//     const response = await axios.get(url, {
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
//       }
//     });

//     const latency = Date.now() - start;
//     return {
//       status: response.status.toString(),
//       latency: latency,
//     };
//   } catch (error) {
//     const latency = Date.now() - start;
//     return {
//       status: 'OFFLINE',
//       latency: latency,
//     };
//   }
// };
