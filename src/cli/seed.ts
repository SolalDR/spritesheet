const sharp = require('sharp')

for (let i = 0; i < 100; i++) {
  sharp({
    create: {
      width: 200,
      height: 200,
      channels: 4,
      background: {
        r: 0,
        g: ~~(Math.random() * 255),
        b: ~~(Math.random() * 255),
        alpha: 1,
      },
    },
  })
    .png()
    .toFile(`./public/test2/${i}.png`)
}
