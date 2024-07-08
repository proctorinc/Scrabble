package models

import (
	"fmt"
	"math/rand"
	"sort"

	"github.com/google/uuid"
)

type TileBag struct {
	Tiles []Tile `json:"tiles"`
}

type Tile struct {
	Id string `json:"id"`
	Letter string `json:"letter"`
	Value int `json:"value"`
	InPlay bool `json:"in_play"`
}

var scrabbleTileValues = map[string]int{
	"A": 1,
	"B": 3,
	"C": 3,
	"D": 2,
	"E": 1,
	"F": 4,
	"G": 2,
	"H": 4,
	"I": 1,
	"J": 8,
	"K": 5,
	"L": 1,
	"M": 3,
	"N": 1,
	"O": 1,
	"P": 3,
	"Q": 10,
	"R": 1,
	"S": 1,
	"T": 1,
	"U": 1,
	"V": 4,
	"W": 4,
	"X": 8,
	"Y": 4,
	"Z": 10,
	"*": 0,
}

var scrabbleTileCount = map[string]int{
	"E": 12,
	"A": 9, "I": 9,
	"O": 8,
	"N": 6, "R": 6, "T": 6,
	"D": 4,	"L": 4,	"S": 4, "U": 4,
	"G": 3,
	"B": 2,	"C": 2, "F": 2,	"H": 2, "M": 2,	"P": 2, "V": 2,	"W": 2, "Y": 2,	
	"J": 1, "K": 1, "Q": 1, "X": 1, "Z": 1,
	"*": 2,
}

func NewTileBag() TileBag {
	bag := TileBag{
		Tiles: generateScrabbleTiles(),
	}
	bag.shuffleTiles()

	return bag
}

func (b *TileBag) DisplayTileCount() {
	letters := make([]string, len(scrabbleTileValues))

	i := 0
	for letter := range scrabbleTileValues {
			letters[i] = letter
			i++
	}

	sort.Strings(letters)

	// Print tile value with count
	for _, letter := range letters {
		fmt.Printf("%s: %d ", letter, b.tileCount(letter));
	}
	fmt.Println()
}

func (b *TileBag) tileCount(letter string) int {
	count := 0

	for _, tile := range b.Tiles {
		if tile.Letter == letter {
			count++
		}
	}

	return count
}

func (b *TileBag) TakeTile() Tile {
	// TODO: Need check for when tiles run out
	// Pop next tile from bag
	tile := b.Tiles[0]
	tiles := b.Tiles[1:]
	b.Tiles = tiles

	tile.InPlay = true

	return tile
}

func (b *TileBag) TakeTiles(count int) []Tile {
	var takenTiles []Tile

	for range count {
		takenTiles = append(takenTiles, b.TakeTile())
	}

	return takenTiles
}

func (b *TileBag) GetTileCount() int {
	return len(b.Tiles)
}

func (b *TileBag) ReturnTiles(tiles []Tile) {
	for _, tile := range tiles {
		b.returnTile(tile.Letter)
	}

	// Shuffle tiles to randomize next tile drawn
	b.shuffleTiles()
}

func (b *TileBag) GetTile(letter string) Tile {
	return Tile{
		Letter: letter,
		Value: scrabbleTileValues[letter],
	}
}

func (b *TileBag) returnTile(letter string) {
	tile := b.GetTile(letter)
	b.Tiles = append(b.Tiles, tile)
}

func (b *TileBag) shuffleTiles() {
	ShuffleTiles(&b.Tiles)
}

func ShuffleTiles(tiles *[]Tile) {
	rand.Shuffle(len(*tiles), func(i, j int) {
		(*tiles)[i], (*tiles)[j] = (*tiles)[j], (*tiles)[i]
	})
}

func generateScrabbleTiles() []Tile {
	tiles := make([]Tile, 100)
	index := 0

	for letter, count := range scrabbleTileCount {
		for range count {
			tiles[index] = Tile{
				Id: uuid.NewString(),
				Letter: letter,
				Value: scrabbleTileValues[letter],
			}
			index++
		}
	}

	return tiles
}