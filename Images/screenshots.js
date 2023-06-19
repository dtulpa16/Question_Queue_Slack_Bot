
let screenshots = [
  "https://i.ibb.co/80StBRS/download-3.jpg",
  "https://i.ibb.co/wzFfN50/download-2.jpg",
  "https://i.ibb.co/kq11LrX/61ily8.jpg",
  "https://i.ibb.co/GMM46zj/61ikcu.jpg",
  "https://i.ibb.co/gSYsMrs/61ijfd.jpg",
  "https://i.ibb.co/8jN7sRg/61ijvk.jpg",
  "https://i.ibb.co/C7CqJ8C/download-5.jpg",
  "https://i.ibb.co/Jmcj1sp/download-4.jpg",
  "https://i.ibb.co/cbFkG6N/download-6.jpg",
  "https://i.ibb.co/Cw2TzRT/63z2hf.jpg",
  "https://i.ibb.co/1Kp6Hjr/63z3nt.jpg",
  "https://i.ibb.co/7vZBJgY/63z9pw.jpg",
  "https://i.ibb.co/rcQvzCn/6585js.gif",
  "https://i.ibb.co/yfC2Pxh/65862i.gif",
  "https://i.ibb.co/9pyyTwQ/69i8qr.jpg",
];

//TODO Instructor channel
const showTime = async (text, channel, res, client) => {
  try {
    let screenshotRequest = await client.chat.postMessage({
      channel: channel,
      blocks: [
        {
          type: "image",
          title: {
            type: "plain_text",
            text: " ",
            emoji: true,
          },
          image_url: `${text}`,
          alt_text: " ",
        },
      ],
    });
    console.log(screenshotRequest);
    return res.status(200).send("");
  } catch (error) {
    console.log(error);
  }

};

module.exports = { screenshots: screenshots, showTime: showTime };
