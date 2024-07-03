package models

import (
	"bytes"
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

func (b *Board) PutTilesOnBoard(cells []Cell) error {
	for _, cell := range cells {
		if (cell.Tile != nil &&
			cell.Row <= len(b.Cells) - 1 &&
			cell.Col <= len(b.Cells[0]) - 1) {

			// Place tiles on board
			b.Cells[cell.Row][cell.Col].Tile = cell.Tile
		} else {
			log.Printf("row: %d, col: %d", cell.Row, cell.Col)
			return fmt.Errorf("invalid tile placement supplied")
		}
	}

	return nil
}

func (b *Board) ValidateTilePlacement() error {
	log.Println("ValidateTilePlacement is not implemented yet")

	return nil
}

func (b *Board) GetWordsPlayed() ([]string, error) {
	words := []string{}
	cells := b.getCellsWithInPlayTiles();

	log.Println("CELLS")
	log.Println(cells)
	
	// Check if word is horizontal or vertical
	isHorizontal := cells[0].Row == cells[1].Row

	// Get main word
	if isHorizontal {
		log.Println("word is horizontal!")
		mainWordCells := b.getHorizontalWordCells(cells[0])
		log.Println(mainWordCells)
		words = append(words, getStringFromCells(mainWordCells))
	} else {
		log.Println("word is vertical!")
		mainWordCells := b.getVerticalWordCells(cells[0])
		log.Println(mainWordCells)
		words = append(words, getStringFromCells(mainWordCells))
	}

	return words, nil
}

func (b *Board) getHorizontalWordCells(startingCell Cell) []Cell {
	currentCell := startingCell
	cells := []Cell{}
	
	for currentCell.Tile != nil {
		cells = append(cells, currentCell)
		currentCell = b.Cells[currentCell.Row][currentCell.Col + 1]
	}

	return cells
}

func (b *Board) getVerticalWordCells(startingCell Cell) []Cell {
	currentCell := startingCell
	cells := []Cell{}
	
	for currentCell.Tile != nil {
		cells = append(cells, currentCell)
		currentCell = b.Cells[currentCell.Row + 1][currentCell.Col]
	}

	return cells
}

func getStringFromCells(cells []Cell) string {
	var stringBuffer bytes.Buffer

	for _, cell := range cells {
		stringBuffer.WriteString(cell.Tile.Letter)
	}

	log.Printf("STRING BUFFER: %s", stringBuffer.String())
	return stringBuffer.String()
}

func (b *Board) ConfirmInPlayTiles() error {
	// Set all tiles that are in play to false
	for _, row := range b.Cells {
		for _, cell := range row {
			if cell.Tile != nil && cell.Tile.InPlay {
				cell.Tile.InPlay = false
			}
		}
	}

	return nil
}

func (b *Board) ScorePlayedWords() int {
	score := 0

	return score
}

func (b *Board) getCellsWithInPlayTiles() []Cell {
	cells := []Cell{}

	for _, row := range b.Cells {
		for _, cell := range row {
			if cell.Tile != nil && cell.Tile.InPlay {
				cells = append(cells, cell)
			}
		}
	}

	return cells
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
