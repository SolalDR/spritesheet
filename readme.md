# spritesheet

[![test](https://github.com/SolalDR/spritesheet/workflows/test/badge.svg?branch=master)](https://github.com/SolalDR/spritesheet/actions?workflow=test)
[![build](https://github.com/SolalDR/spritesheet/workflows/build/badge.svg?branch=master)](https://github.com/SolalDR/spritesheet/actions?workflow=build)
[![version](https://img.shields.io/github/package-json/v/SolalDR/spritesheet)](https://github.com/SolalDR/spritesheet)

## CLI

Basic use : 
```
spritesheet generate --dir ./myimagesdir --w 4096 --c.w 512 --c.h 512 --o walk
```

| option                                                 |type| description                                |default|
|--------------------------------------------------------|--|--------------------------------------------|-----------
| `--spritesheet.width`, `--s.width`, `--w`, `--width`   |number| Width of the output spritesheet file       |`2048`
| `--spritesheet.width`, `--s.height`, `--h`, `--height` |number| Height of the output spritesheet file      |`2048`
| `--chunk.width`, `--c.width`                           |number| Width of a single chunk                    |`auto` (spread amoung disponible space)
| `--chunk.height`, `--c.height`                         |number| Height of a single chunk                   |`auto` (spread amoung disponible space)
| `--chunk.resize`, `--c.resize`                         |number| Resize factor of a chunk                   |`auto` (spread amoung disponible space)
| `--output.name`, `--o.name`                            |string| Output name of the spritesheet             |`spritesheet`
| `--output.dir`, `--o.dir`                              |string| Output directory of the spritesheet        |`./`
| `--dir`                                                |string| Path to parent directory of target images  |

## How to contribute

Install dependencies

```
npm install
```

Install and init `commitizen`

```bash
npm install commitizen -g
```

```bash
commitizen init cz-conventional-changelog --save-dev --save-exact
```

```
npm run dev
```

Commit your work
```
npm run commit
```

## License

[MIT](LICENSE).
