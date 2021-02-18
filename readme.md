# spritesheet

[![test](https://github.com/SolalDR/spritesheet/workflows/test/badge.svg?branch=master)](https://github.com/SolalDR/spritesheet/actions?workflow=test)
[![build](https://github.com/SolalDR/spritesheet/workflows/build/badge.svg?branch=master)](https://github.com/SolalDR/spritesheet/actions?workflow=build)
[![version](https://img.shields.io/github/package-json/v/SolalDR/spritesheet)](https://github.com/SolalDR/spritesheet)

## Description
This library is an easy and customizable way to generate optimized spritesheet through a CLI.

## Features
- [x] JSON map generation (store all the images coords)
- [x] Fast images processing using `sharp`
- [x] Space optimisation: optimize space in the spritesheet to store the more images possible
- [x] Auto-resize : if there isn't enough space in the spritesheet the chunk will resize down until fit perfectly in the spritesheet
- [x] Pass multiple input to get multiples sprites in the same texture
- [ ] (Incomming) Multiple textures generation

## Installation

```
npm i -g @solaldr/spritesheet
```

## CLI

Basic use :
```
spritesheet --input ./myimagesdir
```

| option                       |type  | description                                |default|
|------------------------------|------|--------------------------------------------|-----------
| `--w`, `--width`             |number| Width of the output spritesheet file       |`2048`
| `--h`, `--height`            |number| Height of the output spritesheet file      |`2048`
| `--chunk.width`, `--c.w`     |number| Width of a single chunk                    |`auto` (spread amoung disponible space)
| `--chunk.height`, `--c.h`    |number| Height of a single chunk                   |`auto` (spread amoung disponible space)
| `--flexibility`              |number| Resize factor of a chunk                   |`auto` (spread amoung disponible space)
| `--output`                   |string| Output name of the spritesheet             |`output`
| `--input`                    |string| Path to parent directory of target images  |
| `--name`                     |string| Name of the spritesheet                    |

## Docs

#### `--input`
The input parameter describle the way images will be inported.

#### `--output`
The output parameter describle in which directory the spritesheet will be generated.

#### `--name`
The name of the spritesheet `{name}.json`

#### `--width`, `--w`
Represent the width (in pixels) of the output spritesheet. If `width` is undefined, `width` will calculated automatically<br>
Notice: A power of two is recommanded

#### `--height`, `--h`
Represent the height(px) of the output spritesheet. If `height` is undefined, `height` will be equal to the `width` value<br>
Notice: A power of two is recommanded

#### `--chunk.width`, `--c.w`
Each image passed as an input in the CLI create a single chunk. A chunk is defined by the following properties: `width`, `height`, `x`, `y`
Represent the width of a chunk. If this parameter is undefined, the computed width will be constrained by the spritesheet dimensions. 
For instance, if a spritesheet has dimensions `2048x2048`, However the number of chunks, they will be resized automatically to fit inside this dimensions. See `--flexibility` option for more informations.

#### `--chunk.height`, `--c.h`
Represent the height of a chunk. See `chunk.width` behavior

#### `--flexibility`
The capacity of a chunk to resize in order to fit inside spritesheet dimensions. The parameter is ranged between 0 and 1. 
Example: If `--flexibility 0.5` a chunk will be able to resize down, up to 50% of his width
By default:
- If `chunk.width` or `chunk.height` id defined, `flexibility` will be equal to `0` The chunks will not resize 
- If neither `chunk.width` or `chunk.height` is defined, `flexibility` will be equal to `1` The chunks will resize to fit inside the spritesheet



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
