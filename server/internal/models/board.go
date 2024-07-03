package models

import (
	"fmt"
	"log"
)

type Board struct {
	Cells [][]Cell `json:"cells"`
}

type Cell struct {
	Bonus string `json:"bonus"`
	Tile *Tile `json:"tile"`
	Col int `json:"col"`
	Row int `json:"row"`
}

type WordPlayed struct {
	Word string `json:"word"`
	Points int `json:"score"`
}

var STANDARD_SCRABBLE_BONUSES = [15][15]string {
	{"TW", "", "", "TL", "", "", "", "TW", "", "", "", "TL", "", "", "TW"},
	{"", "DW", "", "", "", "TL", "", "", "", "TL", "", "", "", "DW", ""},
	{"", "", "DW", "", "", "", "DL", "", "DL", "", "", "", "DW", "", ""},
	{"DL", "", "", "DW", "", "", "", "DL", "", "", "", "DW", "", "", "DL"},
	{"", "", "", "", "DW", "", "", "", "", "", "DW", "", "", "", ""},
	{"", "TL", "", "", "", "TL", "", "", "", "TL", "", "", "", "TL", ""},
	{"", "", "DL", "", "", "", "DL", "", "DL", "", "", "", "DL", "", ""},
	{"TW", "", "", "DL", "", "", "", "DW", "", "", "", "DL", "", "", "TW"},
	{"", "", "DL", "", "", "", "DL", "", "DL", "", "", "", "DL", "", ""},
	{"", "TL", "", "", "", "TL", "", "", "", "TL", "", "", "", "TL", ""},
	{"", "", "", "", "DW", "", "", "", "", "", "DW", "", "", "", ""},
	{"DL", "", "", "DW", "", "", "", "DL", "", "", "", "DW", "", "", "DL"},
	{"", "", "DW", "", "", "", "DL", "", "DL", "", "", "", "DW", "", ""},
	{"", "DW", "", "", "", "TL", "", "", "", "TL", "", "", "", "DW", ""},
	{"TW", "", "", "TL", "", "", "", "TW", "", "", "", "TL", "", "", "TW"},
}

func NewBoard() Board {
	cells := generateScrabbleBoard()

	return Board{
		Cells: cells,
	}
}

func (b *Board) ValidatePlayedTiles(cells []Cell) ([]*Cell, error) {
	return nil, fmt.Errorf("Invalid word of tiles")
	
	return nil, fmt.Errorf("Invalid placement of tiles")
}

func (b *Board) PlayTiles(cells []*Cell) (*WordPlayed, error) {
	boardCopy := b.Cells

	for _, cell := range cells {
		if (cell.Tile != nil &&
			cell.Row <= len(boardCopy) - 1 &&
			cell.Col <= len(boardCopy[0]) - 1) {

			// Set tile to no longer be in play
			cell.Tile.InPlay = false

			// Place tiles on board
			boardCopy[cell.Row][cell.Col].Tile = cell.Tile
		} else {
			log.Printf("row: %d, col: %d", cell.Row, cell.Col)
			return nil, fmt.Errorf("invalid tile placement supplied")
		}
	}

	// TODO: validate tiles are validly placed, err if not
	wordPlayed, err := validateWordPlayed(boardCopy)

	if err != nil {
		return nil, err
	}

	// If everything is valid, copy to board
	b.Cells = boardCopy

	return wordPlayed, nil
}

func validateWordPlayed(board [][]Cell) (*WordPlayed, error) {
	
	
	return &WordPlayed{
		Word: "NOT IMPLEMENTED",
		Points: -1,
	}, nil
}

func generateScrabbleBoard() [][]Cell {
	var board [][]Cell

	for i, row := range STANDARD_SCRABBLE_BONUSES {
		var cells []Cell
		for j, bonus := range row {
			cells = append(cells, Cell{
				Bonus: bonus,
				Col: j,
				Row: i,
			})
		}
		board = append(board, cells)
	}

	return board
}
