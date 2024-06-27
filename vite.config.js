/** @type {import('vite').UserConfig} */
export default {
  server: {
    port: 3030,
    open: './index.html',
    watch: {
      include: [
        './index.html',
        './1-JavaScript/Week3',
        '2-Browsers/Week1',
        '3-UsingAPIs/Week2',
      ],
    },
  },
};
