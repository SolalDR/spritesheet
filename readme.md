# spritesheet

[![test](https://github.com/SolalDR/spritesheet/workflows/test/badge.svg?branch=master)](https://github.com/SolalDR/spritesheet/actions?workflow=test)
[![build](https://github.com/SolalDR/spritesheet/workflows/build/badge.svg?branch=master)](https://github.com/SolalDR/spritesheet/actions?workflow=build)
[![version](https://img.shields.io/github/package-json/v/SolalDR/spritesheet)](https://github.com/SolalDR/spritesheet)

## CLI

Basic use : 
```
spritesheet generate --dir ./myimagesdir --w 4096 --c.w 512 --c.h 512 --o walk
```

| option                                                 | description                                |
|--------------------------------------------------------|--------------------------------------------|
| `--spritesheet.width`, `--s.width`, `--w`, `--width`   | Width of the output spritesheet file       |
| `--spritesheet.width`, `--s.height`, `--h`, `--height` | Height of the output spritesheet file      |
| `--chunk.width`, `--c.width`                           | Width of a single chunk                    |
| `--chunk.height`, `--c.height`                         | Height of a single chunk                   |
| `--output`, `--o`                                      | Output name of the spritesheet             |
| `--dir`                                                | Path to parent directory of target images  |

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
